/* Màn hình cây gia phả: vẽ cây, khung chi tiết, thêm/sửa/xóa người, cây trống */
(function (global) {
  'use strict';
  var CN = global.CN;
  var S, L;
  CN._collapsed = CN._collapsed || {};

  function norm(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  }
  function isMobile() { return global.matchMedia('(max-width: 720px)').matches; }

  CN.views.tree = {
    render: function (app, treeId) {
      S = CN.store; L = CN.LAYOUT;
      var u = CN.requireAuth('cay.' + treeId);
      if (!u) return;
      var tree = S.tree(treeId);
      if (!tree || tree.ownerId !== u.id) {
        document.body.className = 'route-trees';
        app.innerHTML = CN.headerHTML('app') +
          '<main class="trees-page"><div class="wrap"><div class="empty-trees">' +
          '<h1 class="h2">Không tìm thấy cây gia phả này</h1><p class="muted">Cây có thể đã bị xóa, hoặc không thuộc tài khoản của bạn.</p>' +
          '<a class="btn btn-primary" href="#cay-cua-toi">' + CN.icon('arrowLeft') + 'Về danh sách cây</a></div></div></main>' + CN.footerHTML();
        CN.bindHeader(app);
        return;
      }
      return new Workspace(app, tree, u).cleanup;
    }
  };

  function Workspace(app, tree, user) {
    var self = this;
    this.app = app; this.tree = tree; this.user = user;
    this.selected = null;
    this.collapsed = CN._collapsed[tree.id] = CN._collapsed[tree.id] || {};

    app.innerHTML = CN.headerHTML('app') +
      '<div class="ws" id="ws">' +
        '<div class="ws-bar">' +
          '<div class="dropdown" data-dropdown id="tree-switch-dd"></div>' +
          '<div class="search" role="search">' + CN.icon('search') +
            '<label class="sr-only" for="search">Tìm người trong cây</label>' +
            '<input class="input" id="search" type="search" placeholder="Tìm người trong cây" autocomplete="off" aria-controls="search-results" aria-expanded="false">' +
            '<kbd aria-hidden="true">/</kbd>' +
            '<div class="search-results" id="search-results" role="listbox" hidden></div></div>' +
          '<div class="ws-tools">' +
            '<div class="zoom" role="group" aria-label="Thu phóng">' +
              '<button type="button" class="icon-btn" id="zoom-out" aria-label="Thu nhỏ" title="Thu nhỏ (−)">' + CN.icon('minus') + '</button>' +
              '<output id="zoom-val" aria-live="polite">100%</output>' +
              '<button type="button" class="icon-btn" id="zoom-in" aria-label="Phóng to" title="Phóng to (+)">' + CN.icon('plus') + '</button>' +
              '<span class="sep" aria-hidden="true"></span>' +
              '<button type="button" class="icon-btn" id="zoom-fit" aria-label="Vừa màn hình" title="Vừa màn hình (0)">' + CN.icon('fit') + '</button>' +
            '</div>' +
            '<button type="button" class="btn btn-primary" id="add-member">' + CN.icon('userPlus') + '<span class="btn-label">Thêm thành viên</span></button>' +
          '</div>' +
        '</div>' +
        '<div class="ws-main">' +
        '<div class="canvas" id="canvas" aria-label="Cây gia phả ' + CN.esc(tree.name) + '"></div>' +
        '<div class="minimap" id="minimap"><div class="minimap-head">Sơ đồ thu nhỏ <span id="mm-count"></span></div><svg id="mm-svg" role="img" aria-label="Sơ đồ thu nhỏ, bấm để di chuyển tới vị trí đó"></svg></div>' +
        '<div class="canvas-hint">Kéo để di chuyển · Ctrl + cuộn để phóng to</div>' +
        '<aside class="panel" id="panel" aria-label="Thông tin chi tiết" aria-hidden="true"></aside>' +
        '</div>' +
      '</div>';

    CN.bindHeader(app);
    this.ws = CN.$('#ws', app);
    this.canvasEl = CN.$('#canvas', app);
    this.panel = CN.$('#panel', app);

    this.canvas = new CN.TreeCanvas({
      el: this.canvasEl, treeId: tree.id, collapsed: this.collapsed,
      onSelect: function (id) { self.select(id); },
      onBackground: function () { self.closePanel(); },
      onView: function (v) { self.onView(v); },
      onRender: function () { self.renderMinimap(); },
      getInsets: function () { return self.insets(); }
    });

    this.renderSwitcher();
    this.refresh(true);
    this.bindBar();

    this._key = function (e) { self.onKey(e); };
    document.addEventListener('keydown', this._key);
    this.cleanup = function () {
      document.removeEventListener('keydown', self._key);
      self.canvas.destroy();
    };
  }

  var W = Workspace.prototype;

  W.insets = function () {
    var open = this.ws.classList.contains('panel-open');
    var ch = this.canvasEl.clientHeight;
    if (isMobile()) return { left: 64, right: 16, top: 28, bottom: open ? ch * 0.8 : 24 };
    var mm = CN.$('#minimap', this.app);
    var mmH = mm && !mm.hidden ? mm.offsetHeight + 24 : 32;
    return { left: 168, right: open ? 420 + 28 : 32, top: 40, bottom: mmH };
  };

  /** Vẽ lại toàn bộ (sau khi thêm/sửa/xóa) */
  W.refresh = function (fit) {
    var empty = !this.tree.rootId || !S.person(this.tree.rootId);
    CN.$('#minimap', this.app).hidden = empty;
    CN.$('.search', this.app).hidden = empty;
    CN.$('.zoom', this.app).hidden = empty;
    CN.$('.canvas-hint', this.app).hidden = empty;
    var oldEmpty = CN.$('.empty-ws', this.canvasEl);
    if (empty) {
      this.closePanel();
      this.canvas.cards = {};
      this.canvasEl.innerHTML = '';
      this.canvasEl.appendChild(this.emptyEl());
      this.renderSwitcher();
      return;
    }
    if (oldEmpty || !this.canvas.stage.isConnected) { this.canvas._build(); this.canvas.cards = {}; }
    this.canvas.render();
    if (this.selected && this.canvas.layout.nodes[this.selected]) this.canvas.select(this.selected);
    if (fit) this.canvas.fit(false);
    this.renderMinimap();
    this.renderSwitcher();
  };

  W.emptyEl = function () {
    var self = this;
    var div = document.createElement('div');
    div.className = 'empty-ws';
    div.innerHTML =
      '<div class="empty-rail" aria-hidden="true"><div>Đời 1 · Thủy tổ</div><div>Đời 2</div><div>Đời 3</div></div>' +
      '<div class="empty-inner">' +
        '<div class="empty-art">' + CN.icon('sapling') + '<span class="seal-mark">KHAI PHẢ</span></div>' +
        '<span class="eyebrow">Cây mới</span>' +
        '<h2>Cây gia phả này chưa có ai</h2>' +
        '<p class="quote">Bắt đầu từ người bạn biết rõ nhất, thường là ông bà nội.</p>' +
        '<p>Sau đó bạn có thể thêm đời trên (cha mẹ của ông bà), vợ chồng và con cháu. Thông tin chưa chắc chắn cứ để trống, bổ sung sau.</p>' +
        '<button type="button" class="btn btn-primary btn-lg" id="add-first">' + CN.icon('plus') + 'Thêm người đầu tiên</button>' +
        '<a class="link-btn" href="#cay.ho-nguyen">Xem cây mẫu Họ Nguyễn</a>' +
      '</div>';
    CN.$('#add-first', div).addEventListener('click', function () { self.openForm({ mode: 'add', rel: { type: 'first' } }); });
    if (!S.tree('ho-nguyen') || S.tree('ho-nguyen').ownerId !== this.user.id) CN.$('.link-btn', div).remove();
    return div;
  };

  /* ---------- Thanh công cụ ---------- */
  W.renderSwitcher = function () {
    var self = this;
    var dd = CN.$('#tree-switch-dd', this.app);
    var st = S.treeStats(this.tree.id);
    var others = S.treesOf(this.user.id);
    dd.innerHTML =
      '<button type="button" class="tree-switch" data-dropdown-toggle aria-haspopup="menu" aria-expanded="false">' +
        '<span class="crest">' + CN.icon('tree') + '</span>' +
        '<span><b>' + CN.esc(this.tree.name) + '</b><span>' + (st.count ? st.count + ' thành viên · ' + st.generations + ' đời' : 'Chưa có thành viên') + '</span></span>' +
        CN.icon('chevronDown') +
      '</button>' +
      '<div class="dropdown-menu" role="menu" hidden>' +
        others.map(function (t) {
          var s = S.treeStats(t.id);
          return '<a class="menu-item" role="menuitem" href="#cay.' + t.id + '">' + CN.icon(t.id === self.tree.id ? 'check' : 'tree') +
            '<span>' + CN.esc(t.name) + '<small>' + s.count + ' thành viên · ' + s.generations + ' đời</small></span></a>';
        }).join('') +
        '<div class="menu-sep"></div>' +
        '<button type="button" class="menu-item" role="menuitem" id="rename-tree">' + CN.icon('edit') + 'Đổi tên, mô tả cây này</button>' +
        '<a class="menu-item" role="menuitem" href="#cay-cua-toi">' + CN.icon('arrowLeft') + 'Tất cả cây của tôi</a>' +
      '</div>';
    dd.classList.remove('open');
    // gắn lại sự kiện cho dropdown này
    var fresh = dd.cloneNode(true);
    dd.parentNode.replaceChild(fresh, dd);
    CN.bindDropdowns(fresh.parentNode);
    CN.$('#rename-tree', fresh).addEventListener('click', function () {
      CN.openEditTree(self.tree, function () { self.tree = S.tree(self.tree.id); self.renderSwitcher(); self.canvas.render(); });
    });
  };

  W.bindBar = function () {
    var self = this, app = this.app;
    CN.$('#zoom-in', app).addEventListener('click', function () { self.canvas.zoomBy(1.2); });
    CN.$('#zoom-out', app).addEventListener('click', function () { self.canvas.zoomBy(1 / 1.2); });
    CN.$('#zoom-fit', app).addEventListener('click', function () { self.canvas.fit(true); });
    CN.$('#add-member', app).addEventListener('click', function () {
      if (!self.tree.rootId) { self.openForm({ mode: 'add', rel: { type: 'first' } }); return; }
      self.openForm({ mode: 'add', rel: { type: 'child', of: self.selected || self.tree.rootId }, pickRelation: true });
    });

    // Tìm kiếm
    var input = CN.$('#search', app), box = CN.$('#search-results', app);
    var active = 0, results = [];
    function show() {
      var q = norm(input.value.trim());
      if (!q) { box.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
      var a = S.analyze(self.tree.id);
      results = S.people(self.tree.id).filter(function (p) { return norm(p.name + ' ' + p.alias).indexOf(q) >= 0; }).slice(0, 8);
      active = 0;
      box.innerHTML = results.length ? results.map(function (p, i) {
        return '<button type="button" class="menu-item' + (i === 0 ? ' active' : '') + '" role="option" data-pick="' + p.id + '">' + CN.avatarHTML(p) +
          '<span>' + CN.esc(p.name) + '<small>' + CN.esc(CN.yearsText(p)) + (a.gen[p.id] ? ' · Đời ' + a.gen[p.id] : '') + '</small></span></button>';
      }).join('') : '<div class="search-empty">Không có ai tên “' + CN.esc(input.value.trim()) + '” trong cây này.</div>';
      box.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }
    function pick(id) {
      input.value = '';
      box.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      self.goTo(id);
    }
    input.addEventListener('input', show);
    input.addEventListener('focus', show);
    input.addEventListener('keydown', function (e) {
      var items = CN.$$('[data-pick]', box);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!items.length) return;
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach(function (it, i) { it.classList.toggle('active', i === active); });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[active]) pick(results[active].id);
      } else if (e.key === 'Escape') {
        input.value = ''; box.hidden = true; input.blur();
      }
    });
    box.addEventListener('mousedown', function (e) { e.preventDefault(); });
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pick]');
      if (b) pick(b.dataset.pick);
    });
    input.addEventListener('blur', function () { setTimeout(function () { box.hidden = true; }, 120); });

    // Minimap
    CN.$('#mm-svg', app).addEventListener('click', function (e) {
      var svg = e.currentTarget;
      if (!svg.getScreenCTM) return;
      var pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      var p = pt.matrixTransform(svg.getScreenCTM().inverse());
      var ins = self.insets(), v = self.canvas.view;
      var cw = self.canvasEl.clientWidth, ch = self.canvasEl.clientHeight;
      v.x = ins.left + (cw - ins.left - ins.right) / 2 - p.x * v.s;
      v.y = ins.top + (ch - ins.top - ins.bottom) / 2 - p.y * v.s;
      self.canvas.apply(true);
    });
  };

  W.onKey = function (e) {
    if (CN.isModalOpen()) return;
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
    if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
      var s = CN.$('#search', this.app);
      if (s && !s.closest('[hidden]')) { e.preventDefault(); s.focus(); }
      return;
    }
    if (typing) return;
    if (e.key === 'Escape' && this.selected) { this.closePanel(); return; }
    if (e.key === '+' || e.key === '=') this.canvas.zoomBy(1.2);
    else if (e.key === '-' || e.key === '_') this.canvas.zoomBy(1 / 1.2);
    else if (e.key === '0') this.canvas.fit(true);
  };

  W.onView = function (v) {
    var out = CN.$('#zoom-val', this.app);
    if (out) out.textContent = Math.round(v.s * 100) + '%';
    this.updateMinimapView();
  };

  /* ---------- Minimap ---------- */
  W.renderMinimap = function () {
    var lay = this.canvas.layout;
    var svg = CN.$('#mm-svg', this.app);
    if (!lay || !svg) return;
    var pad = 60;
    svg.setAttribute('viewBox', (-pad) + ' ' + (-pad) + ' ' + (lay.width + pad * 2) + ' ' + (lay.height + pad * 2));
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    var path = this.selected ? S.lineage(this.tree.id, this.selected) : [];
    var html = '';
    var self = this;
    Object.keys(lay.nodes).forEach(function (id) {
      var nd = lay.nodes[id], p = S.person(id);
      var cls = 'node' + (p && p.deceased ? ' mourn' : '') + (id === self.selected ? ' sel' : (path.indexOf(id) >= 0 ? ' path' : ''));
      html += '<rect class="' + cls + '" x="' + nd.x + '" y="' + nd.y + '" width="' + L.W + '" height="' + L.H + '" rx="18"/>';
    });
    html += '<rect class="view" id="mm-view" x="0" y="0" width="10" height="10" rx="10"/>';
    svg.innerHTML = html;
    CN.$('#mm-count', this.app).textContent = Object.keys(lay.nodes).length + ' / ' + S.people(this.tree.id).length + ' người';
    this.updateMinimapView();
  };

  W.updateMinimapView = function () {
    var r = CN.$('#mm-view', this.app);
    if (!r) return;
    var v = this.canvas.view;
    var cw = this.canvasEl.clientWidth, ch = this.canvasEl.clientHeight;
    r.setAttribute('x', -v.x / v.s);
    r.setAttribute('y', -v.y / v.s);
    r.setAttribute('width', cw / v.s);
    r.setAttribute('height', ch / v.s);
  };

  /* ---------- Chọn người & khung chi tiết ---------- */
  W.select = function (id) {
    if (!S.person(id)) return;
    this.selected = id;
    this.ws.classList.add('panel-open');
    this.panel.setAttribute('aria-hidden', 'false');
    this.renderPanel(id);
    this.canvas.select(id);
    this.canvas.ensureVisible(id);
    this.renderMinimap();
  };

  /** Đi tới một người (mở nhánh nếu đang thu gọn) */
  W.goTo = function (id) {
    var lay = this.canvas.layout;
    if (!lay.nodes[id]) {
      // mở các nhánh tổ tiên đang thu gọn
      var path = S.lineage(this.tree.id, id);
      var self = this;
      path.forEach(function (pid) { delete self.collapsed[pid]; });
      this.canvas.render();
    }
    this.select(id);
    this.canvas.focus(id, true);
    var el = this.canvas.cards[id];
    if (el) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
  };

  W.closePanel = function () {
    if (!this.selected && !this.ws.classList.contains('panel-open')) return;
    this.selected = null;
    this.ws.classList.remove('panel-open');
    this.panel.setAttribute('aria-hidden', 'true');
    if (this.canvas.layout) { this.canvas.select(null); this.renderMinimap(); }
  };

  W.renderPanel = function (id) {
    var self = this;
    var p = S.person(id);
    var a = S.analyze(this.tree.id);
    var inlaw = !a.blood[id];
    var g = a.gen[id];
    var chips = (g ? '<span class="chip chip-red"><i class="dot"></i>Đời ' + g + (S.genName(g) ? ' · ' + S.genName(g) : '') + '</span>' : '') +
      (inlaw ? '<span class="chip chip-gold">' + (p.gender === 'nu' ? 'Dâu' : 'Rể') + '</span>' : '') +
      (p.deceased ? '<span class="chip chip-mourn">' + CN.icon('lotus') + 'Đã mất</span>' : '<span class="chip chip-jade"><i class="dot"></i>Còn sống</span>');

    var age = CN.ageText(p);
    var head =
      '<div class="p-head"><div class="p-photo">' + CN.avatarHTML(p) +
        '<span class="chip ' + (p.gender === 'nu' ? 'chip-red' : 'chip-gold') + '">' + (p.gender === 'nu' ? 'Nữ' : 'Nam') + '</span></div>' +
        '<div style="min-width:0"><h2 id="panel-name">' + CN.esc(p.name) + '</h2>' +
          (p.alias ? '<p class="p-alias">' + CN.esc(p.alias) + '</p>' : '') +
          '<p class="p-role">' + CN.esc(S.role(this.tree.id, id)) + '</p>' +
          '<div class="p-years"><span class="chip chip-gold tnum">' + CN.esc(CN.yearsText(p)) + '</span>' + (age ? '<span class="muted" style="font-size:14px">' + age + '</span>' : '') + '</div>' +
        '</div></div>';

    var gio = '';
    if (p.deceased) {
      var n = S.nextGio(p);
      if (n) {
        var soon = n.daysLeft <= 45;
        gio = '<div class="gio-card"><span class="gio-ic">' + CN.icon('incense') + '</span><div>' +
          '<div class="gio-label">Ngày giỗ <span class="chip ' + (soon ? 'chip-solid-red' : 'chip-red') + '" style="height:22px">' + CN.daysLeftText(n.daysLeft) + '</span></div>' +
          '<div class="gio-date">Ngày ' + p.gio.d + ' tháng ' + p.gio.m + ' âm lịch</div>' +
          '<div class="gio-solar">Lần tới: ' + global.Lunar.weekday(n.date) + ', ' + CN.fmtSolar(n.date) + ' (năm ' + global.Lunar.canChiYear(n.lunarYear) + ')</div>' +
          '</div></div>';
      } else {
        gio = '<div class="gio-card" style="background:var(--paper);border-color:var(--line)"><span class="gio-ic" style="background:var(--mourn)">' + CN.icon('incense') + '</span><div>' +
          '<div class="gio-label" style="color:var(--ink-2)">Chưa ghi ngày giỗ</div>' +
          '<div class="gio-solar">Thêm ngày giỗ âm lịch để biết mỗi năm rơi vào ngày nào.</div>' +
          '<button type="button" class="link-btn" data-act="edit">Thêm ngày giỗ</button></div></div>';
      }
    }

    var rows = [];
    function row(icon, label, value, sub) {
      if (!value) return;
      rows.push('<div class="info-row">' + CN.icon(icon) + '<div><dt>' + label + '</dt><dd>' + CN.esc(value) + (sub ? '<small>' + CN.esc(sub) + '</small>' : '') + '</dd></div></div>');
    }
    row('gift', 'Ngày sinh', CN.fmtDate(p.birth), p.birth && p.birth.d ? CN.convHint(p.birth) : (p.birth && p.birth.y ? CN.convHint(p.birth) : ''));
    if (p.deceased) row('lotus', 'Ngày mất', CN.fmtDate(p.death), p.death && p.death.y ? CN.convHint(p.death) : '');
    row('pin', 'Quê quán', p.hometown);
    if (!p.deceased) row('home', 'Nơi ở hiện nay', p.residence);
    if (p.deceased) row('grave', 'Nơi an táng', p.burial);
    var info = rows.length ? '<dl class="info-list" style="margin:0">' + rows.join('') + '</dl>' : '';

    var bio = '<div class="p-section-title"><span>Tiểu sử</span><button type="button" class="link-btn" data-act="edit">' + (p.bio ? 'Sửa' : 'Thêm') + '</button></div>' +
      (p.bio ? '<blockquote class="bio">' + CN.esc(p.bio) + '</blockquote>'
        : '<p class="bio empty">Chưa có tiểu sử. Có thể ghi vài dòng về nghề nghiệp, tính cách, kỷ niệm hay lời dặn dò.</p>');

    // Quan hệ
    function relItem(o, label) {
      return '<button type="button" class="rel-item" data-goto="' + o.id + '">' + CN.avatarHTML(o) +
        '<span class="ri-body"><b>' + CN.esc(o.name) + '</b><span>' + (label ? label + ' · ' : '') + CN.esc(CN.yearsText(o)) + '</span></span>' +
        '<span class="ri-go">Xem ' + CN.icon('chevronRight') + '</span></button>';
    }
    var groups = '';
    var father = S.father(id), mother = S.mother(id);
    if (father || mother) {
      groups += '<div class="rel-group"><span class="rel-label">Cha mẹ</span>' +
        (father ? relItem(father, 'Cha') : '') + (mother ? relItem(mother, 'Mẹ') : '') + '</div>';
    }
    var sps = S.spouses(id);
    if (sps.length) {
      groups += '<div class="rel-group"><span class="rel-label">' + (p.gender === 'nu' ? 'Chồng' : 'Vợ') + '</span>' +
        sps.map(function (s) { return relItem(s, ''); }).join('') + '</div>';
    }
    var kids = S.children(id);
    if (kids.length) {
      groups += '<div class="rel-group"><span class="rel-label">Các con (' + kids.length + ')</span>' +
        kids.map(function (k) { return relItem(k, k.gender === 'nu' ? 'Con gái' : 'Con trai'); }).join('') + '</div>';
    }
    var rel = '<div class="p-section-title"><span>Người thân trong cây</span></div>' +
      (groups || '<p class="rel-empty">Chưa có người thân nào được nối với người này.</p>');

    // Hành động
    var parentLabel = null;
    if (!inlaw) {
      if (!father && !mother) parentLabel = 'Thêm cha/mẹ';
      else if (!father) parentLabel = 'Thêm cha';
      else if (!mother) parentLabel = 'Thêm mẹ';
    }
    var actions = '<div class="p-actions">' +
      '<button type="button" class="btn btn-primary wide" data-act="edit">' + CN.icon('edit') + 'Sửa thông tin</button>' +
      '<button type="button" class="btn btn-secondary" data-act="child">' + CN.icon('userPlus') + 'Thêm con</button>' +
      '<button type="button" class="btn btn-secondary" data-act="spouse">' + CN.icon('heart') + (p.gender === 'nu' ? 'Thêm chồng' : 'Thêm vợ') + '</button>' +
      (parentLabel ? '<button type="button" class="btn btn-secondary wide" data-act="parent">' + CN.icon('users') + parentLabel + '</button>' : '') +
      '</div>' +
      '<div class="p-danger" id="danger-zone"><button type="button" class="btn btn-danger-ghost btn-sm" data-act="delete">' + CN.icon('trash') + 'Xóa khỏi cây</button></div>';

    this.panel.innerHTML =
      '<div class="panel-top"><div class="chips">' + chips + '</div>' +
        '<button type="button" class="icon-btn" data-act="close" aria-label="Đóng khung chi tiết">' + CN.icon('close') + '</button></div>' +
      '<div class="panel-scroll">' + head + gio + info + '<div style="display:flex;flex-direction:column;gap:12px">' + bio + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:12px">' + rel + '</div>' + actions + '</div>';
    this.panel.setAttribute('aria-labelledby', 'panel-name');

    CN.$$('[data-goto]', this.panel).forEach(function (b) {
      b.addEventListener('click', function () { self.goTo(b.dataset.goto); });
    });
    CN.$$('[data-act]', this.panel).forEach(function (b) {
      b.addEventListener('click', function () {
        var act = b.dataset.act;
        if (act === 'close') self.closePanel();
        else if (act === 'edit') self.openForm({ mode: 'edit', personId: id });
        else if (act === 'child') self.openForm({ mode: 'add', rel: { type: 'child', of: id } });
        else if (act === 'spouse') self.openForm({ mode: 'add', rel: { type: 'spouse', of: id } });
        else if (act === 'parent') self.openForm({ mode: 'add', rel: { type: 'parent', of: id } });
        else if (act === 'delete') self.confirmDelete(id);
      });
    });
    CN.$('.panel-scroll', this.panel).scrollTop = 0;
  };

  W.confirmDelete = function (id) {
    var self = this;
    var p = S.person(id);
    var zone = CN.$('#danger-zone', this.panel);
    var check = S.canDelete(id);
    if (!check.ok) {
      zone.innerHTML = '<div class="confirm-box"><p>' + CN.esc(check.reason) + '</p><div class="row"><button type="button" class="btn btn-ghost btn-sm" id="cd-ok">Đã hiểu</button></div></div>';
      CN.$('#cd-ok', zone).addEventListener('click', function () { self.renderPanel(id); });
      return;
    }
    zone.innerHTML = '<div class="confirm-box" role="alertdialog" aria-label="Xác nhận xóa"><p>Xóa <b>' + CN.esc(p.name) + '</b> khỏi cây? Thao tác này không hoàn tác được.</p>' +
      '<div class="row"><button type="button" class="btn btn-ghost btn-sm" id="cd-cancel">Giữ lại</button>' +
      '<button type="button" class="btn btn-danger btn-sm" id="cd-del">' + CN.icon('trash') + 'Xóa</button></div></div>';
    CN.$('#cd-cancel', zone).addEventListener('click', function () { self.renderPanel(id); });
    CN.$('#cd-del', zone).addEventListener('click', function () {
      var name = p.name;
      S.deletePerson(id);
      self.tree = S.tree(self.tree.id);
      self.closePanel();
      self.refresh(false);
      CN.toast('Đã xóa ' + name + ' khỏi cây.', 'trash');
    });
    CN.$('#cd-del', zone).focus();
  };

  /* ---------- Biểu mẫu thêm / sửa người ---------- */
  function dateGroup(key, label, dt) {
    dt = dt || {};
    var am = dt.cal === 'am';
    return '<div class="field" data-date="' + key + '">' +
      '<div class="date-head"><span class="label" id="' + key + '-label">' + label + '</span>' +
        '<div class="seg seg-sm" role="group" aria-label="Loại lịch cho ' + label.toLowerCase() + '">' +
          '<button type="button" data-cal="duong" aria-pressed="' + !am + '">Dương lịch</button>' +
          '<button type="button" data-cal="am" aria-pressed="' + am + '">Âm lịch</button></div></div>' +
      '<div class="date-row">' +
        '<input class="input tnum" data-part="d" inputmode="numeric" maxlength="2" placeholder="Ngày" aria-label="Ngày" value="' + (dt.d || '') + '">' +
        '<input class="input tnum" data-part="m" inputmode="numeric" maxlength="2" placeholder="Tháng" aria-label="Tháng" value="' + (dt.m || '') + '">' +
        '<input class="input tnum" data-part="y" inputmode="numeric" maxlength="4" placeholder="Năm" aria-label="Năm" value="' + (dt.y || '') + '">' +
      '</div>' +
      '<label class="check" data-leap' + (am ? '' : ' hidden') + ' style="min-height:32px;font-size:14px"><input type="checkbox" data-part="leap"' + (dt.leap ? ' checked' : '') + '> Tháng nhuận</label>' +
      '<p class="hint hint-conv" data-conv></p>' +
      '</div>';
  }

  function readDate(root, key) {
    var g = CN.$('[data-date="' + key + '"]', root);
    var val = function (part) { var v = CN.$('[data-part="' + part + '"]', g).value.trim(); return v ? Number(v) : null; };
    var cal = CN.$('[data-cal][aria-pressed="true"]', g).dataset.cal;
    var d = { d: val('d'), m: val('m'), y: val('y'), cal: cal };
    if (cal === 'am' && CN.$('[data-part="leap"]', g).checked) d.leap = true;
    if (!d.d && !d.m && !d.y) return null;
    return d;
  }

  function validateDate(dt) {
    if (!dt) return '';
    var now = new Date().getFullYear();
    if (!dt.y) return 'Hãy nhập năm (ngày và tháng có thể để trống).';
    if (!Number.isInteger(dt.y) || dt.y < 1000 || dt.y > now) return 'Năm phải từ 1000 đến ' + now + '.';
    if (dt.m != null && (!Number.isInteger(dt.m) || dt.m < 1 || dt.m > 12)) return 'Tháng phải từ 1 đến 12.';
    if (dt.d != null && !dt.m) return 'Có ngày thì cần thêm tháng.';
    if (dt.d != null) {
      var max = dt.cal === 'am' ? 30 : new Date(dt.y, dt.m, 0).getDate();
      if (!Number.isInteger(dt.d) || dt.d < 1 || dt.d > max) return 'Ngày phải từ 1 đến ' + max + '.';
      if (dt.cal === 'am' && !global.Lunar.lunarToSolar(dt.d, dt.m, dt.y, !!dt.leap)) return 'Năm ' + dt.y + ' không có tháng ' + dt.m + ' nhuận.';
      var sd = CN.toSolarDate(dt);
      if (sd && sd > CN.today()) return 'Ngày này chưa tới.';
    }
    return '';
  }

  function relTitle(rel, anchor, mode) {
    if (mode === 'edit') return 'Sửa thông tin';
    if (!rel || rel.type === 'first' || !anchor) return 'Thêm người đầu tiên';
    if (rel.type === 'child') return 'Thêm con cho ' + CN.esc(anchor.name);
    if (rel.type === 'spouse') return (anchor.gender === 'nu' ? 'Thêm chồng cho ' : 'Thêm vợ cho ') + CN.esc(anchor.name);
    if (rel.type === 'parent') return 'Thêm cha mẹ cho ' + CN.esc(anchor.name);
    return 'Thêm thành viên';
  }

  W.openForm = function (opts) {
    var self = this;
    var tree = this.tree;
    var editing = opts.mode === 'edit';
    var p = editing ? S.person(opts.personId) : null;
    var rel = opts.rel || { type: 'first' };
    var anchor = rel.of ? S.person(rel.of) : null;
    var photo = p ? p.photo : '';
    var a = S.analyze(tree.id);

    // Giới tính mặc định
    var gender = p ? p.gender : 'nam';
    var genderLock = null;
    if (!editing && anchor) {
      if (rel.type === 'spouse') gender = anchor.gender === 'nu' ? 'nam' : 'nu';
      if (rel.type === 'parent') {
        if (anchor.fatherId && !anchor.motherId) { gender = 'nu'; genderLock = 'nu'; }
        else if (anchor.motherId && !anchor.fatherId) { gender = 'nam'; genderLock = 'nam'; }
      }
    }
    var deceased = p ? p.deceased : false;
    // Cha mẹ của người sinh đã lâu thường đã mất: chọn sẵn "Đã mất"
    if (!editing && anchor && rel.type === 'parent') {
      var ay = CN.yearOf(anchor.birth);
      if (anchor.deceased || (ay && new Date().getFullYear() - ay > 55)) deceased = true;
    }
    var defaultHome = !editing && anchor && rel.type !== 'spouse' ? (anchor.hometown || '') : '';

    // Chọn quan hệ (khi bấm "Thêm thành viên" ở thanh công cụ)
    var relPicker = '';
    if (opts.pickRelation) {
      var everyone = S.people(tree.id).slice().sort(function (x, y) { return (a.gen[x.id] || 99) - (a.gen[y.id] || 99) || (CN.yearOf(x.birth) || 0) - (CN.yearOf(y.birth) || 0); });
      relPicker = '<div class="form-section tint-red"><div class="form-section-title">' + CN.icon('family') + 'Người này là ai trong cây?</div>' +
        '<div class="grid-2">' +
          '<div class="field"><label class="label" for="f-reltype">Quan hệ</label><select class="select" id="f-reltype">' +
            '<option value="child">Là con của</option><option value="spouse">Là vợ/chồng của</option><option value="parent">Là cha/mẹ của</option></select></div>' +
          '<div class="field"><label class="label" for="f-relof">Người trong cây</label><select class="select" id="f-relof">' +
            everyone.map(function (o) { return '<option value="' + o.id + '"' + (anchor && o.id === anchor.id ? ' selected' : '') + '>' + CN.esc(o.name) + ' · Đời ' + (a.gen[o.id] || '?') + '</option>'; }).join('') +
          '</select></div>' +
        '</div><div id="f-other-wrap"></div></div>';
    }

    function otherParentHTML(anc) {
      if (!anc) return '';
      var sps = S.spouses(anc.id);
      if (!sps.length) return '';
      return '<div class="field"><span class="label">' + (anc.gender === 'nu' ? 'Cha của đứa trẻ' : 'Mẹ của đứa trẻ') + '</span>' +
        '<div class="seg" id="f-other" style="flex-wrap:wrap">' +
          sps.map(function (s, i) { return '<button type="button" data-other="' + s.id + '" aria-pressed="' + (i === 0) + '">' + CN.esc(s.name) + '</button>'; }).join('') +
          '<button type="button" data-other="" aria-pressed="false">Chưa rõ</button></div></div>';
    }
    var otherBlock = (!opts.pickRelation && rel.type === 'child') ? otherParentHTML(anchor) : '';

    var body =
      relPicker +
      (otherBlock ? '<div class="form-section tint-red">' + otherBlock + '</div>' : '') +
      '<div class="form-section">' +
        '<div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap">' +
          '<div style="display:flex;flex-direction:column;align-items:center;gap:8px">' +
            '<span id="f-photo-prev"></span>' +
            '<label class="btn btn-secondary btn-sm" style="cursor:pointer">' + CN.icon('camera') + 'Tải ảnh<input type="file" id="f-photo" accept="image/*" class="sr-only"></label>' +
            '<button type="button" class="link-btn" id="f-photo-clear" style="font-size:13px"' + (photo ? '' : ' hidden') + '>Bỏ ảnh</button>' +
          '</div>' +
          '<div class="grid-2" style="flex:1;min-width:240px">' +
            '<div class="field span-2"><label class="label" for="f-name">Họ và tên <span class="aside">Bắt buộc</span></label><input class="input" id="f-name" value="' + CN.esc(p ? p.name : '') + '" placeholder="Ví dụ: Nguyễn Văn A" autofocus></div>' +
            '<div class="field"><label class="label" for="f-alias">Tên tự / tên gọi khác</label><input class="input" id="f-alias" value="' + CN.esc(p ? p.alias : '') + '" placeholder="Ví dụ: Cụ Đồ, ông Hai"></div>' +
            '<div class="field"><span class="label">Giới tính</span><div class="seg" id="f-gender">' +
              '<button type="button" data-g="nam" aria-pressed="' + (gender === 'nam') + '"' + (genderLock === 'nu' ? ' disabled' : '') + '>Nam</button>' +
              '<button type="button" data-g="nu" aria-pressed="' + (gender === 'nu') + '"' + (genderLock === 'nam' ? ' disabled' : '') + '>Nữ</button></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="field"><span class="label">Trạng thái</span><div class="seg seg-strong" id="f-status" style="width:100%">' +
          '<button type="button" data-dead="0" aria-pressed="' + !deceased + '" style="flex:1;justify-content:center">Còn sống</button>' +
          '<button type="button" data-dead="1" aria-pressed="' + deceased + '" style="flex:1;justify-content:center">' + CN.icon('lotus') + 'Đã mất</button></div></div>' +
      '</div>' +
      '<div class="form-section">' +
        '<div class="form-section-title">' + CN.icon('calendar') + 'Ngày sinh, ngày mất</div>' +
        '<p class="hint" style="margin-top:-8px">Không nhớ ngày thì chỉ cần ghi năm. Chọn “Âm lịch” nếu gia đình ghi theo lịch âm.</p>' +
        '<div class="grid-2">' + dateGroup('birth', 'Ngày sinh', p && p.birth) +
          '<div id="death-wrap"' + (deceased ? '' : ' hidden') + '>' + dateGroup('death', 'Ngày mất', p && p.death) + '</div></div>' +
      '</div>' +
      '<div class="form-section tint-red" id="gio-wrap"' + (deceased ? '' : ' hidden') + '>' +
        '<div class="form-section-title">' + CN.icon('incense') + 'Ngày giỗ hằng năm (âm lịch)</div>' +
        '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">' +
          '<div class="field" style="width:110px"><label class="label" for="f-gio-d">Ngày</label><input class="input tnum" id="f-gio-d" inputmode="numeric" maxlength="2" value="' + (p && p.gio ? p.gio.d : '') + '"></div>' +
          '<div class="field" style="width:110px"><label class="label" for="f-gio-m">Tháng</label><input class="input tnum" id="f-gio-m" inputmode="numeric" maxlength="2" value="' + (p && p.gio ? p.gio.m : '') + '"></div>' +
          '<button type="button" class="btn btn-ghost btn-sm" id="f-gio-auto" style="margin-bottom:5px">' + CN.icon('refresh') + 'Lấy theo ngày mất</button>' +
        '</div><p class="hint hint-conv" id="f-gio-hint"></p></div>' +
      '<div class="form-section">' +
        '<div class="form-section-title">' + CN.icon('pin') + 'Quê quán, nơi ở</div>' +
        '<div class="grid-2">' +
          '<div class="field span-2"><label class="label" for="f-home">Quê quán / nguyên quán</label><input class="input" id="f-home" value="' + CN.esc(p ? p.hometown : defaultHome) + '" placeholder="Xã, huyện, tỉnh"></div>' +
          '<div class="field span-2" id="res-wrap"' + (deceased ? ' hidden' : '') + '><label class="label" for="f-res">Nơi ở hiện nay</label><input class="input" id="f-res" value="' + CN.esc(p ? p.residence : '') + '"></div>' +
          '<div class="field span-2" id="burial-wrap"' + (deceased ? '' : ' hidden') + '><label class="label" for="f-burial">Nơi an táng</label><input class="input" id="f-burial" value="' + CN.esc(p ? p.burial : '') + '" placeholder="Nghĩa trang, khu mộ"></div>' +
        '</div></div>' +
      '<div class="field"><label class="label" for="f-bio">Tiểu sử <span class="aside">Không bắt buộc</span></label>' +
        '<textarea class="textarea" id="f-bio" placeholder="Nghề nghiệp, tính cách, kỷ niệm, lời dặn dò…">' + CN.esc(p ? p.bio : '') + '</textarea></div>';

    var subtitle = editing ? CN.esc(p.name) + ' · ' + CN.esc(S.role(tree.id, p.id) || CN.yearsText(p))
      : (rel.type === 'first' ? 'Người này sẽ là thủy tổ (Đời 1) của cây. Sau này vẫn thêm được đời trên.' : 'Điền những gì bạn biết, phần còn lại có thể bổ sung sau.');

    CN.modal({
      title: opts.pickRelation ? 'Thêm thành viên' : relTitle(rel, anchor, opts.mode),
      subtitle: opts.pickRelation ? 'Chọn người này nối với ai trong cây, rồi điền thông tin.' : subtitle,
      body: body,
      foot: '<button type="button" class="btn btn-ghost" data-close>Hủy</button>' +
        '<button type="button" class="btn btn-primary" id="f-save">' + CN.icon(editing ? 'check' : 'userPlus') + (editing ? 'Lưu thay đổi' : 'Thêm vào cây') + '</button>',
      onMount: function (m) {
        var gioTouched = !!(p && p.gio);
        function photoPrev() {
          var fake = { name: CN.$('#f-name', m).value || (p && p.name) || '?', gender: CN.$('#f-gender [aria-pressed="true"]', m).dataset.g, deceased: CN.$('#f-status [aria-pressed="true"]', m).dataset.dead === '1', photo: photo };
          CN.$('#f-photo-prev', m).innerHTML = CN.avatarHTML(fake, '', 84).replace('class="avatar', 'style="border-radius:20px;--size:84px;font-size:28px" class="avatar');
          CN.$('#f-photo-clear', m).hidden = !photo;
        }
        function segBind(sel, cb) {
          CN.$$(sel + ' button', m).forEach(function (b) {
            b.addEventListener('click', function () {
              if (b.disabled) return;
              CN.$$(sel + ' button', m).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
              if (cb) cb(b);
            });
          });
        }
        segBind('#f-gender', photoPrev);
        segBind('#f-other');
        segBind('#f-status', function (b) {
          var dead = b.dataset.dead === '1';
          CN.$('#death-wrap', m).hidden = !dead;
          CN.$('#gio-wrap', m).hidden = !dead;
          CN.$('#burial-wrap', m).hidden = !dead;
          CN.$('#res-wrap', m).hidden = dead;
          photoPrev();
          updateGioHint();
        });
        CN.$('#f-name', m).addEventListener('input', photoPrev);

        // Chọn quan hệ
        if (opts.pickRelation) {
          var typeSel = CN.$('#f-reltype', m), ofSel = CN.$('#f-relof', m);
          var syncRel = function () {
            var anc = S.person(ofSel.value);
            var tp = typeSel.value;
            CN.$('#f-other-wrap', m).innerHTML = tp === 'child' ? otherParentHTML(anc) : '';
            segBind('#f-other');
            var gBtns = CN.$$('#f-gender button', m);
            gBtns.forEach(function (b) { b.disabled = false; });
            if (tp === 'spouse') {
              var want = anc.gender === 'nu' ? 'nam' : 'nu';
              gBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.g === want)); });
            }
            if (tp === 'parent') {
              var lock = anc.fatherId && !anc.motherId ? 'nu' : (anc.motherId && !anc.fatherId ? 'nam' : null);
              if (lock) gBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.g === lock)); b.disabled = b.dataset.g !== lock; });
            }
            if (tp !== 'spouse' && !CN.$('#f-home', m).value) CN.$('#f-home', m).value = anc.hometown || '';
            photoPrev();
          };
          typeSel.addEventListener('change', syncRel);
          ofSel.addEventListener('change', syncRel);
          syncRel();
        }

        // Ảnh đại diện: thu nhỏ còn 160px để lưu gọn
        CN.$('#f-photo', m).addEventListener('change', function (e) {
          var file = e.target.files && e.target.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function () {
            var img = new Image();
            img.onload = function () {
              var c = document.createElement('canvas');
              c.width = c.height = 160;
              var s = Math.min(img.width, img.height);
              c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 160, 160);
              photo = c.toDataURL('image/jpeg', 0.85);
              photoPrev();
            };
            img.src = reader.result;
          };
          reader.readAsDataURL(file);
        });
        CN.$('#f-photo-clear', m).addEventListener('click', function () { photo = ''; photoPrev(); });

        // Ngày tháng: đổi lịch, gợi ý quy đổi
        function updateConv(key) {
          var g = CN.$('[data-date="' + key + '"]', m);
          var dt = readDate(m, key);
          var err = validateDate(dt);
          var hint = CN.$('[data-conv]', g);
          if (!dt) { hint.innerHTML = ''; return; }
          hint.innerHTML = err ? '' : CN.icon('swap') + '<span>' + CN.esc(CN.convHint(dt)) + '</span>';
        }
        ['birth', 'death'].forEach(function (key) {
          var g = CN.$('[data-date="' + key + '"]', m);
          CN.$$('[data-cal]', g).forEach(function (b) {
            b.addEventListener('click', function () {
              CN.$$('[data-cal]', g).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
              CN.$('[data-leap]', g).hidden = b.dataset.cal !== 'am';
              updateConv(key);
              if (key === 'death') autoGio(false);
            });
          });
          CN.$$('input', g).forEach(function (inp) {
            inp.addEventListener('input', function () {
              var err = g.querySelector('.error-text'); if (err) err.remove();
              CN.$$('input', g).forEach(function (i) { i.removeAttribute('aria-invalid'); });
              updateConv(key);
              if (key === 'death') autoGio(false);
            });
          });
          updateConv(key);
        });

        function autoGio(force) {
          if (gioTouched && !force) return;
          var dt = readDate(m, 'death');
          if (!dt || validateDate(dt)) return;
          var l = CN.toLunar(dt);
          if (!l) return;
          CN.$('#f-gio-d', m).value = l.day;
          CN.$('#f-gio-m', m).value = l.month;
          updateGioHint();
        }
        function updateGioHint() {
          var d = Number(CN.$('#f-gio-d', m).value), mo = Number(CN.$('#f-gio-m', m).value);
          var h = CN.$('#f-gio-hint', m);
          if (d >= 1 && d <= 30 && mo >= 1 && mo <= 12) {
            var n = global.Lunar.nextAnniversary(d, mo, CN.today());
            h.innerHTML = n ? CN.icon('calendar') + '<span>Lần tới: ' + global.Lunar.weekday(n.date) + ', ' + CN.fmtSolar(n.date) + ' · ' + CN.daysLeftText(n.daysLeft).toLowerCase() + '</span>' : '';
          } else {
            var dt = readDate(m, 'death');
            h.innerHTML = dt && !(dt.d && dt.m) ? '<span>Ghi đủ ngày, tháng mất để tự tính ngày giỗ, hoặc nhập ngày giỗ gia đình vẫn cúng.</span>' : '';
          }
        }
        ['#f-gio-d', '#f-gio-m'].forEach(function (sel) {
          CN.$(sel, m).addEventListener('input', function () { gioTouched = true; CN.fieldError(CN.$(sel, m), ''); updateGioHint(); });
        });
        CN.$('#f-gio-auto', m).addEventListener('click', function () {
          var dt = readDate(m, 'death');
          if (!dt || !dt.d || !dt.m) { CN.$('#f-gio-hint', m).innerHTML = CN.icon('info') + '<span>Hãy nhập đủ ngày và tháng mất trước.</span>'; return; }
          gioTouched = false; autoGio(true);
        });
        updateGioHint();
        photoPrev();

        // Lưu
        CN.$('#f-save', m).addEventListener('click', function () {
          var ok = true;
          var nameEl = CN.$('#f-name', m);
          var name = nameEl.value.trim().replace(/\s+/g, ' ');
          if (!name) ok = CN.fieldError(nameEl, 'Hãy nhập họ và tên.') && ok;
          var dead = CN.$('#f-status [aria-pressed="true"]', m).dataset.dead === '1';
          var birth = readDate(m, 'birth');
          var death = dead ? readDate(m, 'death') : null;
          [['birth', birth], ['death', death]].forEach(function (pair) {
            var g = CN.$('[data-date="' + pair[0] + '"]', m);
            var old = g.querySelector('.error-text'); if (old) old.remove();
            var err = validateDate(pair[1]);
            if (err) {
              ok = false;
              var pe = document.createElement('p'); pe.className = 'error-text'; pe.innerHTML = CN.icon('alert') + '<span>' + CN.esc(err) + '</span>';
              g.appendChild(pe);
              CN.$$('input', g).forEach(function (i) { i.setAttribute('aria-invalid', 'true'); });
            }
          });
          if (ok && birth && death) {
            var by = CN.yearOf(birth), dy = CN.yearOf(death);
            var bs = CN.toSolarDate(birth), ds = CN.toSolarDate(death);
            if (dy < by || (bs && ds && ds < bs)) {
              ok = false;
              var g2 = CN.$('[data-date="death"]', m);
              var pe2 = document.createElement('p'); pe2.className = 'error-text'; pe2.innerHTML = CN.icon('alert') + '<span>Ngày mất không thể trước ngày sinh.</span>';
              g2.appendChild(pe2);
            }
          }
          var gio = null;
          if (dead) {
            var gdEl = CN.$('#f-gio-d', m), gmEl = CN.$('#f-gio-m', m);
            var gd = gdEl.value.trim(), gm = gmEl.value.trim();
            if (gd || gm) {
              var gdn = Number(gd), gmn = Number(gm);
              if (!gd || !Number.isInteger(gdn) || gdn < 1 || gdn > 30) ok = CN.fieldError(gdEl, 'Ngày 1–30') && ok;
              if (!gm || !Number.isInteger(gmn) || gmn < 1 || gmn > 12) ok = CN.fieldError(gmEl, 'Tháng 1–12') && ok;
              if (ok) gio = { d: gdn, m: gmn };
            }
          }
          if (!ok) {
            var firstBad = CN.$('[aria-invalid="true"]', m);
            if (firstBad) firstBad.focus();
            return;
          }
          var data = {
            name: name,
            alias: CN.$('#f-alias', m).value.trim(),
            gender: CN.$('#f-gender [aria-pressed="true"]', m).dataset.g,
            deceased: dead, birth: birth, death: death, gio: gio,
            hometown: CN.$('#f-home', m).value.trim(),
            residence: dead ? (p ? p.residence : '') : CN.$('#f-res', m).value.trim(),
            burial: dead ? CN.$('#f-burial', m).value.trim() : (p ? p.burial : ''),
            bio: CN.$('#f-bio', m).value.trim(),
            photo: photo
          };
          var target;
          if (editing) {
            S.updatePerson(p.id, data);
            target = p.id;
            CN.toast('Đã lưu thông tin ' + name + '.');
          } else {
            var r = rel;
            if (opts.pickRelation) r = { type: CN.$('#f-reltype', m).value, of: CN.$('#f-relof', m).value };
            if (r.type === 'child') {
              var ob = CN.$('#f-other [aria-pressed="true"]', m);
              r.otherParentId = ob ? (ob.dataset.other || null) : null;
            }
            var np = S.addPerson(tree.id, data, r);
            target = np.id;
            CN.toast('Đã thêm ' + name + ' vào cây.');
          }
          CN.closeModal();
          self.tree = S.tree(tree.id);
          var wasEmpty = !CN.$('.canvas .stage', self.app) || !!CN.$('.empty-ws', self.canvasEl);
          // mở nhánh để thấy người vừa thêm
          if (!editing && rel.type !== 'first') {
            S.lineage(tree.id, target).forEach(function (pid) { delete self.collapsed[pid]; });
          }
          self.refresh(wasEmpty);
          self.select(target);
          var el = self.canvas.cards[target];
          if (el && !editing) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
        });
      }
    });
  };
})(window);
