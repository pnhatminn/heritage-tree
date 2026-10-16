/*
 * Kho dữ liệu của bản demo: đọc/ghi localStorage, đăng nhập, truy vấn và chỉnh sửa cây.
 * Khi làm server, thay các hàm trong file này bằng lời gọi API là đủ — giao diện không phải đổi.
 */
(function (global) {
  'use strict';
  var CN = global.CN = global.CN || {};

  var KEY = 'coinguon.demo.v1';
  var SESSION_KEY = 'coinguon.session.v1';
  var memory = {};           // dùng khi trình duyệt chặn localStorage
  var db = null;

  function storageGet(store, key) {
    try { return global[store].getItem(key); } catch (e) { return memory[store + key] || null; }
  }
  function storageSet(store, key, val) {
    try { global[store].setItem(key, val); } catch (e) { memory[store + key] = val; }
  }
  function storageDel(store, key) {
    try { global[store].removeItem(key); } catch (e) { delete memory[store + key]; }
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function load() {
    var raw = storageGet('localStorage', KEY);
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.version === CN.SEED.version) { db = parsed; return; }
      } catch (e) { /* dữ liệu hỏng → nạp lại mẫu */ }
    }
    db = clone(CN.SEED);
  }
  function save() { storageSet('localStorage', KEY, JSON.stringify(db)); }

  var S = CN.store = {};

  S.init = function () { load(); };
  S.resetDemo = function () { db = clone(CN.SEED); save(); };

  /* ---------- Phiên đăng nhập ---------- */
  S.currentUser = function () {
    var raw = storageGet('localStorage', SESSION_KEY) || storageGet('sessionStorage', SESSION_KEY);
    if (!raw) return null;
    try {
      var s = JSON.parse(raw);
      return db.users.find(function (u) { return u.id === s.userId; }) || null;
    } catch (e) { return null; }
  };

  S.login = function (email, password, remember) {
    var e = String(email || '').trim().toLowerCase();
    var u = db.users.find(function (x) { return x.email.toLowerCase() === e; });
    if (!u || u.password !== password) return null;
    var val = JSON.stringify({ userId: u.id, at: Date.now() });
    storageDel('localStorage', SESSION_KEY); storageDel('sessionStorage', SESSION_KEY);
    storageSet(remember ? 'localStorage' : 'sessionStorage', SESSION_KEY, val);
    return u;
  };

  S.logout = function () {
    storageDel('localStorage', SESSION_KEY);
    storageDel('sessionStorage', SESSION_KEY);
  };

  S.emailTaken = function (email) {
    var e = String(email || '').trim().toLowerCase();
    return db.users.some(function (u) { return u.email.toLowerCase() === e; });
  };

  S.register = function (name, email, password) {
    var u = { id: CN.uid('u'), name: name.trim(), email: email.trim(), password: password, createdAt: new Date().toISOString() };
    db.users.push(u);
    save();
    S.login(u.email, password, true);
    return u;
  };

  /* ---------- Cây ---------- */
  S.treesOf = function (userId) {
    return db.trees.filter(function (t) { return t.ownerId === userId; })
      .sort(function (a, b) { return String(b.updatedAt).localeCompare(String(a.updatedAt)); });
  };
  S.tree = function (id) { return db.trees.find(function (t) { return t.id === id; }) || null; };

  function touch(treeId) {
    var t = S.tree(treeId);
    if (t) t.updatedAt = new Date().toISOString();
  }

  S.createTree = function (userId, data) {
    var t = {
      id: CN.uid('t'), ownerId: userId, name: data.name.trim(), kind: data.kind || 'noi',
      description: (data.description || '').trim(), rootId: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    db.trees.push(t);
    if (data.founder && data.founder.name) {
      var p = S._newPerson(t.id, data.founder);
      t.rootId = p.id;
    }
    save();
    return t;
  };

  S.updateTree = function (id, patch) {
    var t = S.tree(id);
    if (!t) return;
    Object.assign(t, patch);
    touch(id);
    save();
  };

  S.deleteTree = function (id) {
    db.trees = db.trees.filter(function (t) { return t.id !== id; });
    db.people = db.people.filter(function (p) { return p.treeId !== id; });
    save();
  };

  /* ---------- Người ---------- */
  S.people = function (treeId) { return db.people.filter(function (p) { return p.treeId === treeId; }); };
  S.person = function (id) { return db.people.find(function (p) { return p.id === id; }) || null; };

  S._newPerson = function (treeId, data) {
    var p = Object.assign({
      id: CN.uid('p'), treeId: treeId, name: '', alias: '', gender: 'nam',
      birth: null, death: null, deceased: false, gio: null,
      hometown: '', burial: '', residence: '', bio: '', photo: '',
      fatherId: null, motherId: null, spouseIds: []
    }, data);
    db.people.push(p);
    return p;
  };

  /**
   * Thêm người. rel = { type: 'first' | 'child' | 'spouse' | 'parent', of: personId, otherParentId }
   */
  S.addPerson = function (treeId, data, rel) {
    var t = S.tree(treeId);
    var p = S._newPerson(treeId, data);
    rel = rel || { type: 'first' };
    var anchor = rel.of ? S.person(rel.of) : null;

    if (rel.type === 'first' || !anchor) {
      if (!t.rootId) t.rootId = p.id;
    } else if (rel.type === 'child') {
      var other = rel.otherParentId ? S.person(rel.otherParentId) : null;
      if (anchor.gender === 'nu') { p.motherId = anchor.id; if (other) p.fatherId = other.id; }
      else { p.fatherId = anchor.id; if (other) p.motherId = other.id; }
    } else if (rel.type === 'spouse') {
      p.spouseIds = [anchor.id];
      anchor.spouseIds = (anchor.spouseIds || []).concat(p.id);
    } else if (rel.type === 'parent') {
      var asFather = p.gender !== 'nu';
      var existing = asFather ? S.person(anchor.motherId) : S.person(anchor.fatherId);
      if (asFather) anchor.fatherId = p.id; else anchor.motherId = p.id;
      if (existing) {
        existing.spouseIds = (existing.spouseIds || []).concat(p.id);
        p.spouseIds = [existing.id];
      }
      // Thêm cha/mẹ cho thủy tổ → người mới (ưu tiên cha) thành thủy tổ
      if (t.rootId === anchor.id || (existing && t.rootId === existing.id)) {
        t.rootId = asFather ? p.id : (existing ? existing.id : p.id);
      }
    }
    touch(treeId);
    save();
    return p;
  };

  S.updatePerson = function (id, patch) {
    var p = S.person(id);
    if (!p) return null;
    Object.assign(p, patch);
    touch(p.treeId);
    save();
    return p;
  };

  /** Xóa được khi người đó không còn con trong cây (con phải xóa trước). */
  S.canDelete = function (id) {
    var p = S.person(id);
    if (!p) return { ok: false, reason: 'Không tìm thấy người này.' };
    var kids = S.children(id);
    if (kids.length) {
      return { ok: false, reason: p.name + ' còn ' + kids.length + ' người con trong cây. Hãy xóa các con trước, hoặc sửa thông tin thay vì xóa.' };
    }
    return { ok: true };
  };

  S.deletePerson = function (id) {
    var p = S.person(id);
    if (!p) return;
    var t = S.tree(p.treeId);
    db.people.forEach(function (o) {
      if (o.spouseIds) o.spouseIds = o.spouseIds.filter(function (s) { return s !== id; });
      if (o.fatherId === id) o.fatherId = null;
      if (o.motherId === id) o.motherId = null;
    });
    db.people = db.people.filter(function (o) { return o.id !== id; });
    if (t && t.rootId === id) {
      var rest = S.people(t.id);
      t.rootId = rest.length ? (rest.find(function (o) { return !o.fatherId && !o.motherId && (o.spouseIds || []).length; }) || rest[0]).id : null;
    }
    touch(p.treeId);
    save();
  };

  /* ---------- Quan hệ ---------- */
  function byBirth(a, b) {
    var ya = CN.yearOf(a.birth) || 9999, yb = CN.yearOf(b.birth) || 9999;
    return ya - yb;
  }
  S.children = function (id) {
    return db.people.filter(function (o) { return o.fatherId === id || o.motherId === id; }).sort(byBirth);
  };
  S.spouses = function (id) {
    var p = S.person(id);
    if (!p) return [];
    return (p.spouseIds || []).map(S.person).filter(Boolean);
  };
  S.father = function (id) { var p = S.person(id); return p && p.fatherId ? S.person(p.fatherId) : null; };
  S.mother = function (id) { var p = S.person(id); return p && p.motherId ? S.person(p.motherId) : null; };

  /**
   * Phân tích cây từ thủy tổ: đời của từng người, ai là người trong họ (huyết thống)
   * và ai là dâu/rể. Trả về { gen: {id: n}, blood: {id: true}, maxGen }.
   */
  S.analyze = function (treeId) {
    var t = S.tree(treeId);
    var gen = {}, blood = {}, maxGen = 0;
    if (!t || !t.rootId || !S.person(t.rootId)) return { gen: gen, blood: blood, maxGen: 0 };
    var queue = [t.rootId];
    gen[t.rootId] = 1; blood[t.rootId] = true;
    while (queue.length) {
      var id = queue.shift();
      var g = gen[id];
      if (g > maxGen) maxGen = g;
      S.spouses(id).forEach(function (s) {
        if (gen[s.id] == null) { gen[s.id] = g; queue.push(s.id); }
      });
      S.children(id).forEach(function (c) {
        if (gen[c.id] == null) {
          gen[c.id] = g + 1;
          blood[c.id] = true; // con cháu luôn là người trong họ, kể cả con của dâu/rể
          queue.push(c.id);
        }
      });
    }
    return { gen: gen, blood: blood, maxGen: maxGen };
  };

  /** Chuỗi tổ tiên từ một người lên thủy tổ (dùng để tô đường huyết thống). */
  S.lineage = function (treeId, id) {
    var a = S.analyze(treeId);
    var path = [];
    var cur = S.person(id);
    if (cur && !a.blood[cur.id]) {
      // dâu/rể: đi theo người phối ngẫu trong họ
      var sp = S.spouses(cur.id).find(function (s) { return a.blood[s.id]; });
      path.push(cur.id);
      cur = sp || null;
    }
    var guard = 0;
    while (cur && guard++ < 64) {
      path.push(cur.id);
      var f = cur.fatherId && a.blood[cur.fatherId] ? cur.fatherId : null;
      var m = cur.motherId && a.blood[cur.motherId] ? cur.motherId : null;
      cur = S.person(f || m);
    }
    return path;
  };

  var GEN_NAMES = { 1: 'Thủy tổ', 2: 'Con', 3: 'Cháu', 4: 'Chắt', 5: 'Chít' };
  S.genName = function (n) { return GEN_NAMES[n] || ''; };

  /** Mô tả vai trò ngắn gọn cho một người. */
  S.role = function (treeId, id) {
    var t = S.tree(treeId);
    var p = S.person(id);
    var a = S.analyze(treeId);
    if (!p) return '';
    if (t && t.rootId === id) return 'Thủy tổ của ' + t.name.replace(/\s*–.*$/, '');
    if (!a.blood[id]) {
      var sp = S.spouses(id).find(function (s) { return a.blood[s.id]; }) || S.spouses(id)[0];
      if (!sp) return '';
      return (p.gender === 'nu' ? 'Vợ của ' : 'Chồng của ') + sp.name;
    }
    var parent = S.father(id) && a.blood[p.fatherId] ? S.father(id) : (S.mother(id) || S.father(id));
    if (!parent) return '';
    var sibs = S.children(parent.id);
    var idx = sibs.findIndex(function (s) { return s.id === id; }) + 1;
    var kind = p.gender === 'nu' ? 'Con gái' : 'Con trai';
    var order = idx === 1 ? ' trưởng' : ' thứ ' + idx;
    if (sibs.length === 1) order = ' duy nhất';
    return kind + order + ' của ' + parent.name;
  };

  /** Ngày giỗ kế tiếp của một người (null nếu còn sống/không có ngày giỗ). */
  S.nextGio = function (p) {
    if (!p || !p.deceased || !p.gio || !p.gio.d || !p.gio.m) return null;
    return global.Lunar.nextAnniversary(p.gio.d, p.gio.m, CN.today());
  };

  S.treeStats = function (treeId) {
    var ps = S.people(treeId);
    var a = S.analyze(treeId);
    return { count: ps.length, generations: a.maxGen };
  };

  /** Ngày giỗ sắp tới trong các cây của một tài khoản */
  S.upcomingGio = function (userId) {
    var best = null;
    S.treesOf(userId).forEach(function (t) {
      S.people(t.id).forEach(function (p) {
        var n = S.nextGio(p);
        if (n && (!best || n.daysLeft < best.next.daysLeft)) best = { person: p, tree: t, next: n };
      });
    });
    return best;
  };
})(window);
