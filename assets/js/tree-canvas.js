/*
 * Vẽ cây gia phả lên một khung: thẻ người (HTML) + đường nối (SVG),
 * kéo để di chuyển, phóng to/thu nhỏ, thu gọn nhánh, tô đường huyết thống.
 * Dùng cho màn hình cây (interactive) và khung xem thử ở trang chủ (chỉ xem).
 */
(function (global) {
  'use strict';
  var CN = global.CN = global.CN || {};
  var L = CN.LAYOUT;

  function TreeCanvas(opts) {
    this.el = opts.el;                 // phần tử .canvas
    this.treeId = opts.treeId;
    this.interactive = opts.interactive !== false;
    this.onSelect = opts.onSelect || function () {};
    this.onBackground = opts.onBackground || function () {};
    this.onView = opts.onView || function () {};
    this.onRender = opts.onRender || function () {};
    this.getInsets = opts.getInsets || function () { return { left: 24, right: 24, top: 32, bottom: 32 }; };
    this.collapsed = opts.collapsed || {};
    this.selected = null;
    this.view = { x: 0, y: 0, s: 1 };
    this.cards = {};
    this.layout = null;
    this._build();
    if (this.interactive) this._bindEvents();
  }

  TreeCanvas.prototype._build = function () {
    this.el.innerHTML = '';
    this.stage = document.createElement('div');
    this.stage.className = 'stage';
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'links');
    this.svg.setAttribute('aria-hidden', 'true');
    this.stage.appendChild(this.svg);
    this.el.appendChild(this.stage);
    if (this.interactive) {
      this.rail = document.createElement('div');
      this.rail.className = 'gen-rail';
      this.el.appendChild(this.rail);
    }
  };

  /* ---------- Vẽ ---------- */
  TreeCanvas.prototype.render = function () {
    var S = CN.store;
    var lay = this.layout = CN.computeLayout(this.treeId, this.collapsed);
    var tree = S.tree(this.treeId);
    var self = this;
    var seen = {};

    Object.keys(lay.nodes).forEach(function (id) {
      var p = S.person(id);
      if (!p) return;
      var nd = lay.nodes[id];
      var el = self.cards[id];
      var fresh = !el;
      if (fresh) {
        el = document.createElement(self.interactive ? 'button' : 'div');
        if (self.interactive) el.type = 'button';
        el.dataset.id = id;
        self.stage.appendChild(el);
        self.cards[id] = el;
      }
      var cls = 'pcard';
      if (p.deceased) cls += ' is-mourn';
      if (nd.inlaw) cls += ' is-inlaw';
      if (tree.rootId === id) cls += ' is-root';
      el.className = cls;
      el.innerHTML = self._cardHTML(p, nd, tree);
      el.setAttribute('aria-label', p.name + ', ' + CN.yearsText(p) + (nd.gen ? ', đời ' + nd.gen : ''));
      if (fresh) {
        // mọc ra từ vị trí cha mẹ (nếu có) để chuyển động tự nhiên
        el.style.transition = 'none';
        el.style.left = nd.x + 'px';
        el.style.top = nd.y + 'px';
        el.style.opacity = '0';
        void el.offsetWidth;
        el.style.transition = '';
        el.style.opacity = '1';
      } else {
        el.style.left = nd.x + 'px';
        el.style.top = nd.y + 'px';
      }
      seen[id] = true;
    });
    Object.keys(this.cards).forEach(function (id) {
      if (!seen[id]) { self.cards[id].remove(); delete self.cards[id]; }
    });

    // nút thu gọn / mở nhánh
    CN.$$('.collapse-btn', this.stage).forEach(function (b) { b.remove(); });
    if (this.interactive) {
      lay.units.forEach(function (u) {
        if (!u.hasKids) return;
        var p = S.person(u.id);
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'collapse-btn' + (u.collapsed ? ' is-collapsed' : '');
        b.dataset.collapse = u.id;
        b.style.left = u.anchor.x + 'px';
        b.style.top = (lay.nodes[u.id].y + L.H + 26) + 'px';
        if (u.collapsed) {
          b.innerHTML = CN.icon('plus') + u.hidden;
          b.setAttribute('aria-label', 'Mở nhánh của ' + p.name + ' (' + u.hidden + ' người đang ẩn)');
          b.title = 'Mở nhánh (' + u.hidden + ' người đang ẩn)';
        } else {
          b.innerHTML = CN.icon('minus');
          b.setAttribute('aria-label', 'Thu gọn nhánh của ' + p.name);
          b.title = 'Thu gọn nhánh';
        }
        self.stage.appendChild(b);
      });
    }

    this._drawLinks();
    this._applySelectionClasses();
    this._renderRail();
    this.onView(this.view);
    this.onRender(lay);
  };

  TreeCanvas.prototype._cardHTML = function (p, nd, tree) {
    var tag = '';
    if (tree.rootId === p.id) tag = '<span class="pc-tag root">Thủy tổ</span>';
    else if (nd.inlaw) tag = '<span class="pc-tag inlaw">' + (p.gender === 'nu' ? 'Dâu' : 'Rể') + '</span>';
    var extra;
    if (p.deceased) {
      extra = p.gio && p.gio.d ? CN.icon('lotus') + 'Giỗ ' + p.gio.d + '/' + p.gio.m + ' âm lịch' : CN.icon('lotus') + 'Đã mất';
    } else {
      var age = CN.ageText(p);
      extra = age ? age : 'Còn sống';
    }
    var years = p.deceased ? CN.yearsText(p) : (CN.yearOf(p.birth) ? 'Sinh năm ' + CN.yearOf(p.birth) : 'Chưa rõ năm sinh');
    return tag + CN.avatarHTML(p) +
      '<span class="pc-body"><span class="pc-name">' + CN.esc(p.name) + '</span>' +
      '<span class="pc-years">' + CN.esc(years) + '</span>' +
      '<span class="pc-extra">' + extra + '</span></span>';
  };

  TreeCanvas.prototype._drawLinks = function () {
    var lay = this.layout;
    var S = CN.store;
    var pad = 40;
    var w = lay.width + pad * 2, h = lay.height + pad * 2;
    this.svg.setAttribute('width', w);
    this.svg.setAttribute('height', h);
    this.svg.setAttribute('viewBox', (-pad) + ' ' + (-pad) + ' ' + w + ' ' + h);
    this.svg.style.left = (-pad) + 'px';
    this.svg.style.top = (-pad) + 'px';

    var path = this.selected ? S.lineage(this.treeId, this.selected) : [];
    var onPath = {};
    path.forEach(function (id) { onPath[id] = true; });
    var normal = [], hl = [], spouse = [];
    lay.units.forEach(function (u) {
      var nd = lay.nodes[u.id];
      // vợ chồng: tô đỏ khi cả hai cùng nằm trên đường đang chọn
      u.spouseIds.forEach(function (sid, i) {
        var x1 = nd.x + L.W + i * (L.W + L.SG), x2 = x1 + L.SG, y = nd.y + L.H / 2;
        spouse.push({ x1: x1, x2: x2, y: y, hl: !!(onPath[sid] && onPath[u.id]) });
      });
      if (!u.kids.length) return;
      var ax = u.anchor.x, ay = u.anchor.y;
      var busY = nd.y + L.H + (L.ROW - L.H) / 2;
      var xs = u.kids.map(function (k) { return lay.nodes[k].x + L.W / 2; });
      var minX = Math.min.apply(null, xs.concat(ax)), maxX = Math.max.apply(null, xs.concat(ax));
      var d = 'M' + ax + ' ' + ay + 'V' + busY + 'M' + minX + ' ' + busY + 'H' + maxX;
      u.kids.forEach(function (k, i) { d += 'M' + xs[i] + ' ' + busY + 'V' + lay.nodes[k].y; });
      normal.push(d);
      u.kids.forEach(function (k, i) {
        if (onPath[k] && (onPath[u.id] || u.spouseIds.some(function (s) { return onPath[s]; }))) {
          hl.push('M' + ax + ' ' + ay + 'V' + busY + 'H' + xs[i] + 'V' + lay.nodes[k].y);
        }
      });
    });

    var html = '';
    normal.forEach(function (d) { html += '<path d="' + d + '"/>'; });
    spouse.forEach(function (s) {
      html += '<path class="spouse-link' + (s.hl ? ' hl' : '') + '" d="M' + s.x1 + ' ' + s.y + 'H' + s.x2 + '"/>';
      var cx = (s.x1 + s.x2) / 2;
      html += '<circle class="ring' + (s.hl ? ' hl' : '') + '" cx="' + cx + '" cy="' + s.y + '" r="11"/>' +
        '<path class="heart' + (s.hl ? ' hl' : '') + '" transform="translate(' + (cx - 6) + ' ' + (s.y - 6) + ') scale(.5)" d="M12 21s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 8.5 4.3 4.3 0 0 1 19.5 11c0 5.6-7.5 10-7.5 10Z"/>';
    });
    hl.forEach(function (d) { html += '<path class="hl" d="' + d + '"/>'; });
    this.svg.innerHTML = html;
  };

  TreeCanvas.prototype._applySelectionClasses = function () {
    var S = CN.store;
    var path = this.selected ? S.lineage(this.treeId, this.selected) : [];
    var onPath = {};
    path.forEach(function (id) { onPath[id] = true; });
    var self = this;
    Object.keys(this.cards).forEach(function (id) {
      var el = self.cards[id];
      el.classList.toggle('is-selected', id === self.selected);
      el.classList.toggle('on-path', !!onPath[id] && id !== self.selected);
      if (self.interactive) el.setAttribute('aria-pressed', String(id === self.selected));
    });
    this._pathSet = onPath;
  };

  TreeCanvas.prototype.select = function (id) {
    this.selected = id;
    this._drawLinks();
    this._applySelectionClasses();
    this._renderRail();
  };

  /* ---------- Cột "Đời" ---------- */
  TreeCanvas.prototype._renderRail = function () {
    if (!this.rail || !this.layout) return;
    var self = this;
    var gensOnPath = {};
    if (this._pathSet) {
      Object.keys(this._pathSet).forEach(function (id) {
        var nd = self.layout.nodes[id];
        if (nd) gensOnPath[nd.gen] = true;
      });
    }
    var html = '';
    this.layout.rows.forEach(function (r) {
      var name = CN.store.genName(r.gen);
      html += '<div class="gen-label' + (gensOnPath[r.gen] ? ' on-path' : '') + '" data-gen-y="' + r.y + '">' +
        '<i class="dot"></i><b>Đời ' + r.gen + '</b>' + (name ? '<span>' + name + '</span>' : '') + '</div>';
    });
    this.rail.innerHTML = html;
    this._positionRail();
  };

  TreeCanvas.prototype._positionRail = function () {
    if (!this.rail) return;
    var v = this.view, h = this.el.clientHeight;
    CN.$$('.gen-label', this.rail).forEach(function (lab) {
      var y = v.y + Number(lab.dataset.genY) * v.s;
      lab.style.top = y + 'px';
      lab.style.visibility = (y < 16 || y > h - 16) ? 'hidden' : 'visible';
    });
  };

  /* ---------- Biến đổi khung nhìn ---------- */
  TreeCanvas.prototype.apply = function (animate) {
    var st = this.stage;
    if (animate) {
      st.classList.add('animate');
      clearTimeout(this._animT);
      this._animT = setTimeout(function () { st.classList.remove('animate'); }, 480);
    }
    st.style.transform = 'translate(' + this.view.x + 'px,' + this.view.y + 'px) scale(' + this.view.s + ')';
    if (this.rail) {
      if (animate) {
        var self = this;
        CN.$$('.gen-label', this.rail).forEach(function (l) { l.style.transition = 'top .45s cubic-bezier(.2,.7,.2,1)'; });
        setTimeout(function () { CN.$$('.gen-label', self.rail).forEach(function (l) { l.style.transition = 'none'; }); }, 480);
      } else {
        CN.$$('.gen-label', this.rail).forEach(function (l) { l.style.transition = 'none'; });
      }
    }
    this._positionRail();
    this.onView(this.view);
  };

  TreeCanvas.prototype.clampScale = function (s) { return Math.max(0.3, Math.min(1.6, s)); };

  TreeCanvas.prototype.fit = function (animate) {
    if (!this.layout || !this.layout.width) return;
    var ins = this.getInsets();
    var cw = this.el.clientWidth, ch = this.el.clientHeight;
    var aw = Math.max(120, cw - ins.left - ins.right), ah = Math.max(120, ch - ins.top - ins.bottom);
    var s = Math.min(1, aw / this.layout.width, ah / (this.layout.height + 30));
    s = this.clampScale(s);
    this.view.s = s;
    this.view.x = ins.left + (aw - this.layout.width * s) / 2;
    var contentH = (this.layout.height + 30) * s;
    this.view.y = ins.top + Math.max(0, (ah - contentH) / 2) + 12 * s;
    this.apply(animate);
  };

  TreeCanvas.prototype.focus = function (id, animate) {
    var nd = this.layout && this.layout.nodes[id];
    if (!nd) return;
    var ins = this.getInsets();
    var cw = this.el.clientWidth, ch = this.el.clientHeight;
    var s = Math.max(this.view.s, 0.8);
    s = this.clampScale(Math.min(s, 1.1));
    var aw = cw - ins.left - ins.right, ah = ch - ins.top - ins.bottom;
    this.view.s = s;
    this.view.x = ins.left + aw / 2 - (nd.x + L.W / 2) * s;
    this.view.y = ins.top + ah * 0.45 - (nd.y + L.H / 2) * s;
    this.apply(animate);
  };

  /** Đảm bảo thẻ nằm trong vùng nhìn thấy; chỉ dịch khi cần. */
  TreeCanvas.prototype.ensureVisible = function (id) {
    var nd = this.layout && this.layout.nodes[id];
    if (!nd) return;
    var ins = this.getInsets();
    var v = this.view;
    var cw = this.el.clientWidth, ch = this.el.clientHeight;
    var x1 = v.x + nd.x * v.s, x2 = v.x + (nd.x + L.W) * v.s;
    var y1 = v.y + nd.y * v.s, y2 = v.y + (nd.y + L.H) * v.s;
    var dx = 0, dy = 0;
    if (x2 > cw - ins.right - 16) dx = (cw - ins.right - 16) - x2;
    if (x1 + dx < ins.left + 16) dx = ins.left + 16 - x1;
    if (y2 > ch - ins.bottom - 16) dy = (ch - ins.bottom - 16) - y2;
    if (y1 + dy < ins.top + 16) dy = ins.top + 16 - y1;
    if (dx || dy) { v.x += dx; v.y += dy; this.apply(true); }
  };

  TreeCanvas.prototype.zoomAt = function (factor, cx, cy, animate) {
    var v = this.view;
    var ns = this.clampScale(v.s * factor);
    var k = ns / v.s;
    v.x = cx - (cx - v.x) * k;
    v.y = cy - (cy - v.y) * k;
    v.s = ns;
    this.apply(animate);
  };

  TreeCanvas.prototype.zoomBy = function (factor) {
    var ins = this.getInsets();
    var cx = ins.left + (this.el.clientWidth - ins.left - ins.right) / 2;
    var cy = this.el.clientHeight / 2;
    this.zoomAt(factor, cx, cy, true);
  };

  TreeCanvas.prototype.toggleCollapse = function (id) {
    var before = this.layout && this.layout.nodes[id] ? { x: this.layout.nodes[id].x, y: this.layout.nodes[id].y } : null;
    if (this.collapsed[id]) delete this.collapsed[id]; else this.collapsed[id] = true;
    this.render();
    // giữ thẻ vừa bấm đứng yên trên màn hình, chỉ các nhánh xung quanh dịch chuyển
    var after = this.layout.nodes[id];
    if (before && after) {
      this.view.x -= (after.x - before.x) * this.view.s;
      this.view.y -= (after.y - before.y) * this.view.s;
      this.apply(true);
    }
    // nếu người đang chọn bị ẩn thì bỏ chọn
    if (this.selected && !this.layout.nodes[this.selected]) this.onBackground();
  };

  /* ---------- Sự kiện chuột / cảm ứng ---------- */
  TreeCanvas.prototype._bindEvents = function () {
    var self = this, el = this.el;
    var pointers = {}, drag = null, pinch = null;

    el.addEventListener('click', function (e) {
      var cb = e.target.closest('.collapse-btn');
      if (cb) { e.stopPropagation(); self.toggleCollapse(cb.dataset.collapse); return; }
      var card = e.target.closest('.pcard');
      if (card && !self._dragged) { self.onSelect(card.dataset.id); }
    });

    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      self._dragged = false;
      if (ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: self.view.s };
        drag = null;
      } else if (ids.length === 1) {
        drag = { x: e.clientX, y: e.clientY, vx: self.view.x, vy: self.view.y, onCard: !!e.target.closest('.pcard, .collapse-btn') };
      }
    });

    el.addEventListener('pointermove', function (e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (pinch && ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        var rect = el.getBoundingClientRect();
        var cx = (a.x + b.x) / 2 - rect.left, cy = (a.y + b.y) / 2 - rect.top;
        self.zoomAt((pinch.s * d / pinch.d) / self.view.s, cx, cy, false);
        self._dragged = true;
        return;
      }
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!self._dragged && Math.hypot(dx, dy) < 5) return;
      if (!self._dragged) {
        self._dragged = true;
        el.classList.add('dragging');
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* bỏ qua */ }
      }
      self.view.x = drag.vx + dx;
      self.view.y = drag.vy + dy;
      self.apply(false);
    });

    function end(e) {
      var wasDrag = self._dragged;
      var started = drag;
      delete pointers[e.pointerId];
      if (Object.keys(pointers).length < 2) pinch = null;
      if (!Object.keys(pointers).length) {
        el.classList.remove('dragging');
        if (started && !wasDrag && !started.onCard && e.type === 'pointerup') self.onBackground();
        drag = null;
        setTimeout(function () { self._dragged = false; }, 0);
      }
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);

    el.addEventListener('wheel', function (e) {
      if (e.target.closest('.empty-ws')) return;
      e.preventDefault();
      var rect = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        self.zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - rect.left, e.clientY - rect.top, false);
      } else {
        self.view.x -= e.deltaX;
        self.view.y -= e.deltaY;
        self.apply(false);
      }
    }, { passive: false });

    this._onResize = function () { self._positionRail(); self.onView(self.view); };
    global.addEventListener('resize', this._onResize);
  };

  TreeCanvas.prototype.destroy = function () {
    if (this._onResize) global.removeEventListener('resize', this._onResize);
  };

  CN.TreeCanvas = TreeCanvas;
})(window);
