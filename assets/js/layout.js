/*
 * Tính vị trí các thẻ trên cây gia phả.
 * Mỗi "đơn vị" là một người trong họ + vợ/chồng (đứng bên phải).
 * Con cái xếp ở hàng dưới, đơn vị cha mẹ căn giữa phía trên các con.
 */
(function (global) {
  'use strict';
  var CN = global.CN = global.CN || {};

  var L = CN.LAYOUT = {
    W: 212,      // rộng thẻ
    H: 104,      // cao thẻ
    SG: 48,      // khoảng cách vợ – chồng
    XG: 40,      // khoảng cách giữa các nhánh anh em
    ROW: 200     // khoảng cách giữa hai đời
  };

  CN.computeLayout = function (treeId, collapsed) {
    var S = CN.store;
    var t = S.tree(treeId);
    var out = { nodes: {}, units: [], rows: [], width: 0, height: 0, rootId: t && t.rootId };
    if (!t || !t.rootId || !S.person(t.rootId)) return out;
    var a = S.analyze(treeId);
    collapsed = collapsed || {};

    function countDesc(id, seen) {
      seen = seen || {};
      var n = 0;
      kidsOf(id).forEach(function (k) {
        if (seen[k.id]) return;
        seen[k.id] = true;
        n += 1 + spousesOf(k.id).length + countDesc(k.id, seen);
      });
      return n;
    }
    function spousesOf(id) {
      return S.spouses(id).filter(function (s) { return !a.blood[s.id]; });
    }
    function kidsOf(id) {
      var members = [id].concat(spousesOf(id).map(function (s) { return s.id; }));
      var seen = {}, list = [];
      members.forEach(function (m) {
        S.children(m).forEach(function (c) {
          if (seen[c.id] || !a.blood[c.id] || a.gen[c.id] !== a.gen[id] + 1) return;
          seen[c.id] = true; list.push(c);
        });
      });
      return list.sort(function (x, y) { return (CN.yearOf(x.birth) || 9999) - (CN.yearOf(y.birth) || 9999); });
    }

    var visited = {};
    function build(id, depth) {
      visited[id] = true;
      var sp = spousesOf(id);
      var all = kidsOf(id).filter(function (k) { return !visited[k.id]; });
      var isCollapsed = !!collapsed[id] && all.length > 0;
      var kids = isCollapsed ? [] : all.map(function (k) { return build(k.id, depth + 1); });
      var unitW = L.W * (1 + sp.length) + L.SG * sp.length;
      var kidsW = kids.reduce(function (s, k) { return s + k.w; }, 0) + L.XG * Math.max(0, kids.length - 1);
      return {
        id: id, sp: sp, kids: kids, depth: depth, unitW: unitW, kidsW: kidsW,
        w: Math.max(unitW, kidsW), hasKids: all.length > 0, collapsed: isCollapsed,
        hidden: isCollapsed ? countDesc(id) : 0
      };
    }

    function place(n, left) {
      var y = n.depth * L.ROW;
      var cx = left + (n.w - n.kidsW) / 2;
      n.kids.forEach(function (k) { place(k, cx); cx += k.w + L.XG; });
      var anchorOff = n.sp.length ? L.W + L.SG / 2 : L.W / 2;
      var unitLeft;
      if (n.kids.length) {
        var first = n.kids[0], last = n.kids[n.kids.length - 1];
        var target = (first.x + L.W / 2 + last.x + L.W / 2) / 2;
        unitLeft = target - anchorOff;
        unitLeft = Math.max(left, Math.min(left + n.w - n.unitW, unitLeft));
      } else {
        unitLeft = left + (n.w - n.unitW) / 2;
      }
      n.x = unitLeft;
      n.y = y;
      out.nodes[n.id] = { x: unitLeft, y: y, gen: a.gen[n.id], inlaw: false };
      n.sp.forEach(function (s, i) {
        out.nodes[s.id] = { x: unitLeft + (i + 1) * (L.W + L.SG), y: y, gen: a.gen[s.id], inlaw: true, spouseOf: n.id };
      });
      var anchor = n.sp.length
        ? { x: unitLeft + L.W + L.SG / 2, y: y + L.H / 2 }
        : { x: unitLeft + L.W / 2, y: y + L.H };
      out.units.push({
        id: n.id, spouseIds: n.sp.map(function (s) { return s.id; }), anchor: anchor,
        kids: n.kids.map(function (k) { return k.id; }), depth: n.depth,
        hasKids: n.hasKids, collapsed: n.collapsed, hidden: n.hidden,
        bottom: { x: unitLeft + L.W / 2, y: y + L.H }
      });
    }

    var rootNode = build(t.rootId, 0);
    place(rootNode, 0);

    var maxX = 0, maxY = 0, maxDepth = 0;
    Object.keys(out.nodes).forEach(function (id) {
      var nd = out.nodes[id];
      maxX = Math.max(maxX, nd.x + L.W);
      maxY = Math.max(maxY, nd.y + L.H);
    });
    out.units.forEach(function (u) { maxDepth = Math.max(maxDepth, u.depth); });
    for (var d = 0; d <= maxDepth; d++) out.rows.push({ gen: d + 1, y: d * L.ROW + L.H / 2 });
    out.width = maxX;
    out.height = maxY;
    return out;
  };
})(window);
