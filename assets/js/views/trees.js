/* Cây gia phả của tôi */
(function (global) {
  'use strict';
  var CN = global.CN;
  var KIND = {
    noi: { label: 'Bên nội', chip: 'chip-red' },
    ngoai: { label: 'Bên ngoại', chip: 'chip-jade' },
    khac: { label: 'Dòng họ khác', chip: 'chip-gold' }
  };
  var filter = 'all';

  function treeCardHTML(t) {
    var S = CN.store;
    var st = S.treeStats(t.id);
    var root = t.rootId ? S.person(t.rootId) : null;
    var k = KIND[t.kind] || KIND.khac;
    var rootBlock = root
      ? '<div class="tc-root">' +
          '<div>' + CN.icon('user') + '<span>Thủy tổ: <b>' + CN.esc(root.name) + '</b> (' + CN.esc(CN.yearsText(root)) + ')</span></div>' +
          (root.hometown ? '<div>' + CN.icon('pin') + '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + CN.esc(root.hometown) + '</span></div>' : '') +
        '</div>'
      : '<div class="tc-root"><div>' + CN.icon('sapling') + '<span>Cây mới, chưa có thành viên</span></div></div>';
    return '<article class="tree-card" data-open="' + t.id + '" tabindex="0" aria-label="Mở cây ' + CN.esc(t.name) + '">' +
      '<div class="tc-top"><span class="chip ' + k.chip + '">' + k.label + '</span>' +
        '<div class="dropdown tc-menu" data-dropdown>' +
          '<button type="button" class="icon-btn" data-dropdown-toggle aria-haspopup="menu" aria-expanded="false" aria-label="Tùy chọn cho ' + CN.esc(t.name) + '">' + CN.icon('more') + '</button>' +
          '<div class="dropdown-menu right" role="menu" hidden>' +
            '<button type="button" class="menu-item" role="menuitem" data-rename="' + t.id + '">' + CN.icon('edit') + 'Đổi tên, mô tả</button>' +
            '<button type="button" class="menu-item danger" role="menuitem" data-delete="' + t.id + '">' + CN.icon('trash') + 'Xóa cây</button>' +
          '</div></div></div>' +
      '<div class="tc-crest"><span class="crest">' + CN.icon('tree') + '</span><div><h3>' + CN.esc(t.name) + '</h3></div></div>' +
      (t.description ? '<p class="tc-desc">' + CN.esc(t.description) + '</p>' : '') +
      '<div class="tc-stats"><span class="chip">' + CN.icon('users') + st.count + ' thành viên</span>' +
        '<span class="chip">' + CN.icon('layers') + st.generations + ' đời</span></div>' +
      rootBlock +
      '<div class="tc-foot"><span class="tc-updated">Cập nhật ' + CN.relTime(t.updatedAt) + '</span>' +
        '<span class="btn btn-secondary btn-sm" aria-hidden="true">Mở cây ' + CN.icon('arrowRight') + '</span></div>' +
      '</article>';
  }

  function statsHTML(u, trees) {
    var S = CN.store;
    var people = 0, maxGen = 0;
    trees.forEach(function (t) { var s = S.treeStats(t.id); people += s.count; maxGen = Math.max(maxGen, s.generations); });
    var up = S.upcomingGio(u.id);
    var gio = up
      ? '<div class="stat gio"><span class="stat-icon">' + CN.icon('incense') + '</span><div style="min-width:0">' +
          '<span class="gio-title">Ngày giỗ sắp tới</span>' +
          '<span class="gio-name">' + CN.esc(up.person.name) + ' · giỗ ' + up.person.gio.d + '/' + up.person.gio.m + ' âm lịch</span>' +
          '<span class="gio-when">' + global.Lunar.weekday(up.next.date) + ', ' + CN.fmtSolar(up.next.date) + ' · ' + CN.esc(up.tree.name) + '</span></div>' +
          '<span class="chip chip-solid-red">' + CN.daysLeftText(up.next.daysLeft) + '</span></div>'
      : '<div class="stat gio"><span class="stat-icon">' + CN.icon('incense') + '</span><div><span class="gio-title">Ngày giỗ sắp tới</span><span class="gio-when">Chưa có ngày giỗ nào được ghi.</span></div></div>';
    return '<div class="stats">' +
      '<div class="stat"><span class="stat-icon">' + CN.icon('tree') + '</span><div><b>' + trees.length + '</b><span class="stat-label">cây gia phả</span></div></div>' +
      '<div class="stat"><span class="stat-icon">' + CN.icon('users') + '</span><div><b>' + people + '</b><span class="stat-label">người đã ghi</span></div></div>' +
      '<div class="stat"><span class="stat-icon">' + CN.icon('layers') + '</span><div><b>' + maxGen + '</b><span class="stat-label">đời sâu nhất</span></div></div>' +
      gio + '</div>';
  }

  function render(app) {
    var u = CN.requireAuth('cay-cua-toi');
    if (!u) return;
    var trees = CN.store.treesOf(u.id);
    var counts = { all: trees.length, noi: 0, ngoai: 0, khac: 0 };
    trees.forEach(function (t) { counts[t.kind] = (counts[t.kind] || 0) + 1; });
    if (filter !== 'all' && !counts[filter]) filter = 'all';
    var shown = trees.filter(function (t) { return filter === 'all' || t.kind === filter; });

    var tabs = '<div class="tabs" role="group" aria-label="Lọc theo loại">' +
      tabHTML('all', 'Tất cả', counts.all) + tabHTML('noi', 'Bên nội', counts.noi) + tabHTML('ngoai', 'Bên ngoại', counts.ngoai) +
      (counts.khac ? tabHTML('khac', 'Dòng họ khác', counts.khac) : '') + '</div>';

    var grid = shown.map(treeCardHTML).join('');
    if (!trees.length) {
      grid = '<div class="empty-trees"><span class="crest" style="width:64px;height:64px;border-radius:16px;display:grid;place-items:center;background:var(--gold-bg);color:var(--jade-2)">' + CN.icon('sapling') + '</span>' +
        '<h2 class="h3">Bạn chưa có cây gia phả nào</h2><p class="muted">Tạo cây đầu tiên, thường là cây bên nội, rồi thêm dần ông bà, cha mẹ, con cháu.</p></div>';
    }
    grid += '<button type="button" class="tree-card tree-card-new" data-create>' +
      '<span class="plus">' + CN.icon('plus') + '</span><h3>Tạo cây mới</h3><p>Lập thêm cây cho bên ngoại, bên vợ/chồng hoặc một chi họ khác.</p></button>';

    app.innerHTML = CN.headerHTML('app', 'trees') +
      '<main class="trees-page"><div class="wrap">' +
        '<div class="page-head"><div><span class="eyebrow">Không gian của ' + CN.esc(u.name) + '</span>' +
          '<h1>Cây gia phả của tôi</h1><p>Mỗi cây là một dòng họ. Chỉ bạn xem và chỉnh sửa được các cây này.</p></div>' +
          '<button type="button" class="btn btn-primary btn-lg" data-create>' + CN.icon('plus') + 'Tạo cây mới</button></div>' +
        (trees.length ? statsHTML(u, trees) + tabs : '') +
        '<div class="tree-grid">' + grid + '</div>' +
      '</div></main>' + CN.footerHTML();

    CN.bindHeader(app);

    CN.$$('[data-filter]', app).forEach(function (b) {
      b.addEventListener('click', function () { filter = b.dataset.filter; render(app); });
    });
    CN.$$('[data-create]', app).forEach(function (b) { b.addEventListener('click', function () { openCreateTree(u); }); });
    CN.$$('[data-open]', app).forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.tc-menu')) return;
        CN.go('cay.' + card.dataset.open);
      });
      card.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); CN.go('cay.' + card.dataset.open); }
      });
    });
    CN.$$('[data-rename]', app).forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); openEditTree(CN.store.tree(b.dataset.rename), function () { render(app); }); });
    });
    CN.$$('[data-delete]', app).forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); confirmDeleteTree(CN.store.tree(b.dataset.delete), function () { render(app); }); });
    });
  }

  function tabHTML(key, label, count) {
    return '<button type="button" class="tab" data-filter="' + key + '" aria-pressed="' + (filter === key) + '">' + label + ' <span class="count">' + count + '</span></button>';
  }

  function kindPicker(current) {
    return '<div class="kind-options" role="group" aria-label="Loại cây">' +
      ['noi', 'ngoai', 'khac'].map(function (k) {
        var sub = k === 'noi' ? 'Họ của cha' : k === 'ngoai' ? 'Họ của mẹ' : 'Bên vợ/chồng, chi khác';
        return '<button type="button" class="kind-opt" data-kind="' + k + '" aria-pressed="' + (current === k) + '"><b>' + KIND[k].label + '</b><span>' + sub + '</span></button>';
      }).join('') + '</div>';
  }
  function bindKindPicker(root) {
    CN.$$('[data-kind]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        CN.$$('[data-kind]', root).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      });
    });
  }
  function pickedKind(root) {
    var b = CN.$('[data-kind][aria-pressed="true"]', root);
    return b ? b.dataset.kind : 'noi';
  }

  function openCreateTree(u) {
    CN.modal({
      title: 'Tạo cây gia phả mới',
      subtitle: 'Đặt tên cây, rồi ghi người đầu tiên nếu bạn đã biết. Có thể để trống và thêm sau.',
      body:
        '<div class="field"><label class="label" for="ct-name">Tên cây <span class="aside">Bắt buộc</span></label>' +
          '<input class="input" id="ct-name" placeholder="Ví dụ: Họ Trần – bên ngoại" autofocus></div>' +
        '<div class="field"><span class="label">Loại cây</span>' + kindPicker('noi') + '</div>' +
        '<div class="field"><label class="label" for="ct-desc">Mô tả <span class="aside">Không bắt buộc</span></label>' +
          '<textarea class="textarea" id="ct-desc" style="min-height:84px" placeholder="Quê gốc, nhà thờ họ, ai đang giữ gia phả giấy…"></textarea></div>' +
        '<div class="form-section">' +
          '<div class="form-section-title">' + CN.icon('user') + 'Thủy tổ (người đầu tiên của cây)</div>' +
          '<p class="hint" style="margin-top:-8px">Bắt đầu từ người bạn biết rõ nhất, thường là ông bà nội. Sau này vẫn thêm được đời trên.</p>' +
          '<div class="grid-2">' +
            '<div class="field span-2"><label class="label" for="ct-fname">Họ và tên</label><input class="input" id="ct-fname" placeholder="Ví dụ: Nguyễn Văn A"></div>' +
            '<div class="field"><span class="label">Giới tính</span><div class="seg" id="ct-gender"><button type="button" data-g="nam" aria-pressed="true">Nam</button><button type="button" data-g="nu" aria-pressed="false">Nữ</button></div></div>' +
            '<div class="field"><label class="label" for="ct-home">Quê quán</label><input class="input" id="ct-home" placeholder="Xã, huyện, tỉnh"></div>' +
            '<div class="field"><label class="label" for="ct-born">Năm sinh</label><input class="input tnum" id="ct-born" inputmode="numeric" maxlength="4" placeholder="Ví dụ: 1930"></div>' +
            '<div class="field"><label class="label" for="ct-died">Năm mất <span class="aside">Để trống nếu còn sống</span></label><input class="input tnum" id="ct-died" inputmode="numeric" maxlength="4" placeholder="Ví dụ: 2001"></div>' +
          '</div>' +
        '</div>',
      foot: '<button type="button" class="btn btn-ghost" data-close>Hủy</button><button type="button" class="btn btn-primary" id="ct-submit">' + CN.icon('tree') + 'Tạo cây</button>',
      onMount: function (m) {
        bindKindPicker(m);
        CN.$$('#ct-gender button', m).forEach(function (b) {
          b.addEventListener('click', function () { CN.$$('#ct-gender button', m).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); }); });
        });
        CN.$('#ct-submit', m).addEventListener('click', function () {
          var name = CN.$('#ct-name', m), born = CN.$('#ct-born', m), died = CN.$('#ct-died', m);
          var ok = true;
          var now = new Date().getFullYear();
          if (!name.value.trim()) ok = CN.fieldError(name, 'Hãy đặt tên cho cây, ví dụ “Họ Trần – bên ngoại”.') && ok;
          var by = born.value.trim() ? Number(born.value) : null, dy = died.value.trim() ? Number(died.value) : null;
          if (by !== null && (!Number.isInteger(by) || by < 1000 || by > now)) ok = CN.fieldError(born, 'Năm sinh từ 1000 đến ' + now + '.') && ok; else CN.fieldError(born, '');
          if (dy !== null && (!Number.isInteger(dy) || dy < 1000 || dy > now)) ok = CN.fieldError(died, 'Năm mất từ 1000 đến ' + now + '.') && ok;
          else if (dy !== null && by !== null && dy < by) ok = CN.fieldError(died, 'Năm mất không thể trước năm sinh.') && ok;
          else CN.fieldError(died, '');
          if (!ok) { CN.$('[aria-invalid="true"]', m).focus(); return; }
          var fname = CN.$('#ct-fname', m).value.trim();
          var founder = fname ? {
            name: fname,
            gender: CN.$('#ct-gender [aria-pressed="true"]', m).dataset.g,
            hometown: CN.$('#ct-home', m).value.trim(),
            birth: by ? { y: by, cal: 'duong' } : null,
            death: dy ? { y: dy, cal: 'duong' } : null,
            deceased: !!dy
          } : null;
          var t = CN.store.createTree(u.id, { name: name.value, kind: pickedKind(m), description: CN.$('#ct-desc', m).value, founder: founder });
          CN.closeModal();
          CN.toast('Đã tạo cây “' + t.name + '”.');
          CN.go('cay.' + t.id);
        });
      }
    });
  }

  function openEditTree(t, done) {
    if (!t) return;
    CN.modal({
      size: 'sm', title: 'Đổi tên, mô tả',
      body: '<div class="field"><label class="label" for="et-name">Tên cây</label><input class="input" id="et-name" value="' + CN.esc(t.name) + '" autofocus></div>' +
        '<div class="field"><span class="label">Loại cây</span>' + kindPicker(t.kind) + '</div>' +
        '<div class="field"><label class="label" for="et-desc">Mô tả</label><textarea class="textarea" id="et-desc" style="min-height:96px">' + CN.esc(t.description || '') + '</textarea></div>',
      foot: '<button type="button" class="btn btn-ghost" data-close>Hủy</button><button type="button" class="btn btn-primary" id="et-save">Lưu</button>',
      onMount: function (m) {
        bindKindPicker(m);
        CN.$('#et-save', m).addEventListener('click', function () {
          var name = CN.$('#et-name', m);
          if (!name.value.trim()) { CN.fieldError(name, 'Tên cây không được để trống.'); name.focus(); return; }
          CN.store.updateTree(t.id, { name: name.value.trim(), description: CN.$('#et-desc', m).value.trim(), kind: pickedKind(m) });
          CN.closeModal();
          CN.toast('Đã lưu thay đổi.');
          done();
        });
      }
    });
  }
  CN.openEditTree = openEditTree;

  function confirmDeleteTree(t, done) {
    if (!t) return;
    var n = CN.store.people(t.id).length;
    CN.modal({
      size: 'sm', title: 'Xóa cây “' + CN.esc(t.name) + '”?',
      body: '<p>Cây và ' + n + ' người trong cây sẽ bị xóa khỏi tài khoản. Thao tác này không hoàn tác được.</p>',
      foot: '<button type="button" class="btn btn-ghost" data-close>Giữ lại</button><button type="button" class="btn btn-danger" id="dt-ok">' + CN.icon('trash') + 'Xóa cây</button>',
      onMount: function (m) {
        CN.$('#dt-ok', m).addEventListener('click', function () {
          CN.store.deleteTree(t.id);
          CN.closeModal();
          CN.toast('Đã xóa cây “' + t.name + '”.', 'trash');
          done();
        });
      }
    });
  }

  CN.views.trees = { render: render };
})(window);
