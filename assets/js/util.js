/* Tiện ích dùng chung: DOM, icon, định dạng ngày tháng, toast, modal. */
(function (global) {
  'use strict';
  var CN = global.CN = global.CN || {};

  /* ---------- DOM ---------- */
  CN.$ = function (sel, root) { return (root || document).querySelector(sel); };
  CN.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  CN.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); };

  CN.uid = function (prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  };

  /* ---------- Icons (SVG nội tuyến, nét 1.8) ---------- */
  var P = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    fit: '<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
    userPlus: '<circle cx="9.5" cy="8" r="3.5"/><path d="M3 19.5c.8-3.3 3.4-5 6.5-5s5.7 1.7 6.5 5M18.5 8v6M15.5 11h6"/>',
    user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20c1-3.6 4-5.6 7.5-5.6s6.5 2 7.5 5.6"/>',
    users: '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.8-3.2 3.3-4.9 6.2-4.9s5.4 1.7 6.2 4.9"/><path d="M16 4.8a3.4 3.4 0 0 1 0 6.4M17.6 14.8c2 .6 3.3 2.2 3.8 4.7"/>',
    edit: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m14 7 3 3"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
    heart: '<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.5 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M10.6 5.6A9.8 9.8 0 0 1 12 5.5C18 5.5 21.5 12 21.5 12a17 17 0 0 1-2.9 3.7M6.6 6.6C3.9 8.4 2.5 12 2.5 12S6 18.5 12 18.5a9.4 9.4 0 0 0 4.4-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8.5 14.5h3"/>',
    bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16ZM10 20.5a2.2 2.2 0 0 0 4 0"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
    home: '<path d="M4 11 12 4l8 7v8.5a1 1 0 0 1-1 1h-4.5V15h-5v5.5H5a1 1 0 0 1-1-1V11Z"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M8 7h8M8 10.5h6"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.5" r="1.3"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m4 7.5 8 6 8-6"/>',
    tree: '<path d="M12 21v-7"/><path d="M12 14c-3.6 0-6.5-2.4-6.5-5.5S8.4 3 12 3s6.5 2.4 6.5 5.5S15.6 14 12 14Z"/><path d="M12 14 9 11M12 12.5l3-2.5M8.5 21h7"/>',
    sapling: '<path d="M12 21v-9"/><path d="M12 12C12 8 9 6 5 6c0 4 3 6 7 6ZM12 10c0-3.5 2.6-6 7-6 0 3.8-2.6 6-7 6Z"/><path d="M7.5 21h9"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    logout: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"/>',
    refresh: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    checkCircle: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.3 2.4 2.4 4.8-5"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.1"/>',
    alert: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16.2v.1"/>',
    camera: '<path d="M4 8.5A2 2 0 0 1 6 6.5h2l1.5-2h5L16 6.5h2a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5Z"/><circle cx="12" cy="13" r="3.5"/>',
    swap: '<path d="M7 5 3.5 8.5 7 12M3.5 8.5h13M17 12l3.5 3.5L17 19M20.5 15.5h-13"/>',
    more: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    map: '<path d="m9 4.5-5 2v13l5-2 6 2 5-2v-13l-5 2-6-2Z"/><path d="M9 4.5v13M15 6.5v13"/>',
    shield: '<path d="M12 3.5 5 6v5.5c0 4.4 3 7.9 7 9 4-1.1 7-4.6 7-9V6l-7-2.5Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    scroll: '<path d="M7 4h11a2 2 0 0 1 2 2v1h-4M7 4a2 2 0 0 0-2 2v12a2 2 0 0 1-2 2h11a2 2 0 0 0 2-2V7M7 4a2 2 0 0 1 2 2v1"/><path d="M8.5 11h5M8.5 14.5h5"/>',
    family: '<circle cx="7" cy="6.5" r="2.5"/><circle cx="17" cy="6.5" r="2.5"/><circle cx="12" cy="14" r="2"/><path d="M3 14.5c.4-2.5 2-4 4-4s3 .9 3.6 2M21 14.5c-.4-2.5-2-4-4-4s-3 .9-3.6 2M8.5 21c.4-2 1.8-3.3 3.5-3.3s3.1 1.3 3.5 3.3"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4.5 15v3.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15"/>',
    sparkle: '<path d="M12 3.5 13.8 9 19.5 10.8 13.8 12.6 12 18.3 10.2 12.6 4.5 10.8 10.2 9 12 3.5Z"/>',
    lotus: '<path d="M12 19.5c-3.9 0-7.5-2.2-8.5-5.6 2.4-.4 4.6.4 6 1.8"/><path d="M12 19.5c3.9 0 7.5-2.2 8.5-5.6-2.4-.4-4.6.4-6 1.8"/><path d="M12 19.5c-2.4-1.6-3.6-4-3.6-6.8 0-2.3 1.4-4.6 3.6-6.6 2.2 2 3.6 4.3 3.6 6.6 0 2.8-1.2 5.2-3.6 6.8Z"/>',
    incense: '<path d="M4.5 14.5h15l-1.6 4.6a2 2 0 0 1-1.9 1.4H8a2 2 0 0 1-1.9-1.4l-1.6-4.6Z"/><path d="M8.5 14.5V8M12 14.5V6M15.5 14.5V8"/><path d="M12 3.6c.8-.6.8-1.3.2-2"/>',
    grave: '<path d="M6 20.5V10a6 6 0 0 1 12 0v10.5"/><path d="M4 20.5h16M12 9v6M9.5 11.5h5"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-1.8 0-4-1-4-3a2 2 0 0 1 4 0c0 1.5 0 3 0 3Zm0 0c1.8 0 4-1 4-3a2 2 0 0 0-4 0"/>',
    star: '<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6L12 4Z"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>'
  };

  CN.icon = function (name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  };

  CN.googleG = '<svg class="google-g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.8 6C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.8A14.6 14.6 0 0 1 9.5 24c0-1.7.3-3.3.9-4.8l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.2-8.5 2.2-6.3 0-11.6-4.2-13.5-9.9l-7.9 6C6.6 42.6 14.6 48 24 48z"/></svg>';

  /* Ấn triện logo "Cội Nguồn" */
  CN.sealLogo = function (cls) {
    return '<svg class="' + (cls || 'brand-seal') + '" viewBox="0 0 48 48" aria-hidden="true">' +
      '<rect x="1" y="1" width="46" height="46" rx="9" fill="#B22222"/>' +
      '<rect x="4.5" y="4.5" width="39" height="39" rx="6" fill="none" stroke="#FFE9DD" stroke-opacity=".75" stroke-width="1.3"/>' +
      '<g fill="#FFF4EC"><circle cx="24" cy="15.5" r="7"/><circle cx="16.2" cy="20.5" r="5.6"/><circle cx="31.8" cy="20.5" r="5.6"/></g>' +
      '<g fill="none" stroke="#FFF4EC" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M24 21v15"/><path d="M24 36c-2.6 0-5.4.7-7.6 1.9M24 36c2.6 0 5.4.7 7.6 1.9"/></g>' +
      '<path d="M24 24.5l-4-3M24 26.5l4-3.2" stroke="#B22222" stroke-width="1.6" stroke-linecap="round"/></svg>';
  };

  /* Hoa văn mây (vân mây cuộn) */
  CN.cloudSVG = function () {
    return '<svg viewBox="0 0 220 90" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M8 70c20 0 26-14 18-22-6-6-17-2-15 6 2 6 10 5 10 0"/>' +
      '<path d="M26 70h150"/>' +
      '<path d="M60 70c-6-22 10-40 32-36 6-18 34-24 46-6 14-10 36-2 36 16 16 0 26 12 22 26"/>' +
      '<path d="M138 28c-8 2-12 10-8 17 4 6 13 4 13-2 0-5-6-6-8-3"/>' +
      '<path d="M92 34c-7 4-9 12-4 18 4 4 11 2 11-3 0-4-5-5-7-2"/>' +
      '<path d="M196 70c12 0 18-8 14-15-3-5-11-4-11 2 0 4 5 5 7 2"/></svg>';
  };

  /* ---------- Tên & avatar ---------- */
  /* Chữ viết tắt: chữ đầu của họ + tên (Nguyễn Văn A → NA) */
  CN.initials = function (name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  CN.avatarHTML = function (person, extraCls, size) {
    var cls = 'avatar' + (person.gender === 'nu' ? ' is-female' : '') + (person.deceased ? ' is-mourn' : '') + (extraCls ? ' ' + extraCls : '');
    var style = size ? ' style="--size:' + size + 'px"' : '';
    var inner = person.photo ? '<img src="' + CN.esc(person.photo) + '" alt="">' : CN.esc(CN.initials(person.name));
    return '<span class="' + cls + '"' + style + ' aria-hidden="true">' + inner + '</span>';
  };

  /* ---------- Ngày tháng ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  CN.pad = pad;

  /** date: {d?, m?, y?, cal:'duong'|'am', leap?} → chuỗi hiển thị */
  CN.fmtDate = function (dt) {
    if (!dt || !dt.y) return '';
    var s;
    if (dt.d && dt.m) s = pad(dt.d) + '/' + pad(dt.m) + '/' + dt.y;
    else if (dt.m) s = 'tháng ' + dt.m + '/' + dt.y;
    else s = 'năm ' + dt.y;
    if (dt.cal === 'am') s += ' (âm lịch' + (dt.leap ? ', tháng nhuận' : '') + ')';
    return s;
  };

  /** Quy đổi sang lịch còn lại, trả về chuỗi gợi ý hoặc '' */
  CN.convHint = function (dt) {
    if (!dt || !dt.y) return '';
    var L = global.Lunar;
    if (dt.d && dt.m) {
      if (dt.cal === 'am') {
        var s = L.lunarToSolar(dt.d, dt.m, dt.y, !!dt.leap);
        if (!s) return 'Năm ' + dt.y + ' không có tháng ' + dt.m + ' nhuận.';
        return 'Tức ngày ' + pad(s.day) + '/' + pad(s.month) + '/' + s.year + ' dương lịch';
      }
      var l = L.solarToLunar(dt.d, dt.m, dt.y);
      return 'Tức ngày ' + l.day + ' tháng ' + l.month + (l.leap ? ' nhuận' : '') + ' năm ' + L.canChiYear(l.year) + ' (âm lịch)';
    }
    return 'Năm ' + L.canChiYear(dt.y);
  };

  /** Ngày dương (Date) của một mốc nếu có đủ ngày/tháng */
  CN.toSolarDate = function (dt) {
    if (!dt || !dt.y || !dt.m || !dt.d) return null;
    if (dt.cal === 'am') {
      var s = global.Lunar.lunarToSolar(dt.d, dt.m, dt.y, !!dt.leap);
      return s ? new Date(s.year, s.month - 1, s.day) : null;
    }
    return new Date(dt.y, dt.m - 1, dt.d);
  };

  /** Ngày âm của một mốc (để tính ngày giỗ mặc định) */
  CN.toLunar = function (dt) {
    if (!dt || !dt.y || !dt.m || !dt.d) return null;
    if (dt.cal === 'am') return { day: dt.d, month: dt.m, year: dt.y, leap: !!dt.leap };
    return global.Lunar.solarToLunar(dt.d, dt.m, dt.y);
  };

  /** Năm dương lịch của một mốc (năm âm gần đúng năm dương với mục đích hiển thị năm) */
  CN.yearOf = function (dt) {
    if (!dt || !dt.y) return null;
    var s = CN.toSolarDate(dt);
    return s ? s.getFullYear() : dt.y;
  };

  CN.yearsText = function (p) {
    var b = CN.yearOf(p.birth);
    var d = p.deceased ? CN.yearOf(p.death) : null;
    if (p.deceased) return (b || '?') + ' – ' + (d || '?');
    return b ? String(b) : 'Chưa rõ năm sinh';
  };

  CN.today = function () {
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  };

  /** Tuổi: người sống tính tuổi dương; người đã mất tính tuổi âm (cách ghi gia phả). */
  CN.ageText = function (p) {
    var b = CN.yearOf(p.birth);
    if (!b) return '';
    if (p.deceased) {
      var d = CN.yearOf(p.death);
      if (!d) return '';
      var age = d - b + 1;
      return (age < 60 ? 'Hưởng dương ' : 'Hưởng thọ ') + age + ' tuổi';
    }
    var t = CN.today();
    var bd = CN.toSolarDate(p.birth);
    var a = t.getFullYear() - b;
    if (bd && (t.getMonth() < bd.getMonth() || (t.getMonth() === bd.getMonth() && t.getDate() < bd.getDate()))) a -= 1;
    return a + ' tuổi';
  };

  CN.fmtSolar = function (date) {
    return pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + '/' + date.getFullYear();
  };

  CN.daysLeftText = function (n) {
    if (n === 0) return 'Hôm nay';
    if (n === 1) return 'Ngày mai';
    return 'Còn ' + n + ' ngày';
  };

  CN.relTime = function (iso) {
    if (!iso) return '';
    var then = new Date(iso);
    var diff = (Date.now() - then.getTime()) / 1000;
    if (diff < 60) return 'vừa xong';
    if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
    if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
    var days = Math.floor(diff / 86400);
    if (days === 1) return 'hôm qua';
    if (days < 30) return days + ' ngày trước';
    return 'ngày ' + CN.fmtSolar(then);
  };

  /* ---------- Toast ---------- */
  CN.toast = function (msg, icon) {
    var box = CN.$('#toasts');
    if (!box) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = CN.icon(icon || 'checkCircle') + '<span>' + CN.esc(msg) + '</span>';
    box.appendChild(el);
    setTimeout(function () {
      el.classList.add('leaving');
      setTimeout(function () { el.remove(); }, 260);
    }, 3200);
  };

  /* ---------- Modal ---------- */
  var openModal = null;
  CN.modal = function (opts) {
    CN.closeModal();
    var root = CN.$('#modal-root');
    var wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML =
      '<div class="modal ' + (opts.size || '') + '" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
        '<div class="modal-head"><div><h2 id="modal-title">' + opts.title + '</h2>' + (opts.subtitle ? '<p>' + opts.subtitle + '</p>' : '') + '</div>' +
        '<button type="button" class="icon-btn" data-close aria-label="Đóng">' + CN.icon('close') + '</button></div>' +
        '<div class="modal-body">' + opts.body + '</div>' +
        (opts.foot ? '<div class="modal-foot">' + opts.foot + '</div>' : '') +
      '</div>';
    root.appendChild(wrap);
    var prevFocus = document.activeElement;
    openModal = { el: wrap, onClose: opts.onClose, prevFocus: prevFocus };
    wrap.addEventListener('mousedown', function (e) { if (e.target === wrap) CN.closeModal(); });
    CN.$$('[data-close]', wrap).forEach(function (b) { b.addEventListener('click', CN.closeModal); });
    setTimeout(function () {
      var f = CN.$('[autofocus]', wrap) || CN.$('input, select, textarea, button:not([data-close])', wrap);
      if (f) f.focus();
    }, 30);
    if (opts.onMount) opts.onMount(wrap);
    return wrap;
  };
  CN.closeModal = function () {
    if (!openModal) return;
    var m = openModal;
    openModal = null;
    m.el.remove();
    if (m.onClose) m.onClose();
    if (m.prevFocus && m.prevFocus.focus && document.contains(m.prevFocus)) m.prevFocus.focus();
  };
  CN.isModalOpen = function () { return !!openModal; };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openModal) { e.preventDefault(); CN.closeModal(); }
  });

  /* Đóng mọi dropdown khi bấm ra ngoài */
  document.addEventListener('click', function (e) {
    CN.$$('[data-dropdown].open').forEach(function (dd) {
      if (!dd.contains(e.target)) {
        dd.classList.remove('open');
        var m = CN.$('.dropdown-menu', dd);
        if (m) m.hidden = true;
        var t = CN.$('[aria-expanded]', dd);
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
  });
  CN.bindDropdowns = function (root) {
    CN.$$('[data-dropdown]', root).forEach(function (dd) {
      var btn = CN.$('[data-dropdown-toggle]', dd);
      var menu = CN.$('.dropdown-menu', dd);
      if (!btn || !menu) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.hidden;
        CN.$$('[data-dropdown].open').forEach(function (o) { if (o !== dd) { o.classList.remove('open'); CN.$('.dropdown-menu', o).hidden = true; } });
        menu.hidden = !open;
        dd.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
      });
      menu.addEventListener('click', function (e) {
        if (e.target.closest('.menu-item')) { menu.hidden = true; dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
      });
    });
  };
})(window);
