/*
 * Khung ứng dụng: điều hướng bằng #hash, đầu trang, chân trang, khởi động.
 * Các route:
 *   #trang-chu (mặc định)   trang giới thiệu   (#gioi-thieu, #tinh-nang, #xem-thu, #huong-dan là các mục trong trang)
 *   #dang-nhap / #dang-ky   đăng nhập / đăng ký
 *   #cay-cua-toi            danh sách cây (cần đăng nhập)
 *   #cay.<id>               màn hình cây  (cần đăng nhập)
 */
(function (global) {
  'use strict';
  var CN = global.CN = global.CN || {};
  CN.views = CN.views || {};

  var LANDING_SECTIONS = ['gioi-thieu', 'tinh-nang', 'xem-thu', 'huong-dan'];
  var NEXT_KEY = 'coinguon.next';
  var current = null;   // { name, cleanup }

  CN.go = function (hash) {
    if (location.hash === '#' + hash) route(); else location.hash = hash;
  };

  CN.requireAuth = function (target) {
    var u = CN.store.currentUser();
    if (u) return u;
    try { sessionStorage.setItem(NEXT_KEY, target || location.hash.slice(1)); } catch (e) { /* bỏ qua */ }
    CN.go('dang-nhap');
    return null;
  };
  CN.takeNext = function () {
    var n = null;
    try { n = sessionStorage.getItem(NEXT_KEY); sessionStorage.removeItem(NEXT_KEY); } catch (e) { /* bỏ qua */ }
    return n;
  };

  /* ---------- Đầu trang ---------- */
  function brandHTML() {
    return '<a class="brand" href="#trang-chu" aria-label="Cội Nguồn – trang chủ">' + CN.sealLogo() +
      '<span class="brand-text"><span class="brand-name">Cội Nguồn</span><span class="brand-tag">Gia phả trực tuyến</span></span></a>';
  }

  function userMenuHTML(u) {
    var initials = CN.initials(u.name);
    return '<div class="dropdown" data-dropdown>' +
      '<button type="button" class="user-btn" data-dropdown-toggle aria-haspopup="menu" aria-expanded="false">' +
        '<span class="avatar is-user" style="--size:38px">' + CN.esc(initials) + '</span>' +
        '<span class="user-text"><span class="user-name">' + CN.esc(u.name) + '</span><span class="user-mail">' + CN.esc(u.email) + '</span></span>' +
        CN.icon('chevronDown') +
      '</button>' +
      '<div class="dropdown-menu right" role="menu" hidden>' +
        '<div class="menu-head"><span class="avatar is-user">' + CN.esc(initials) + '</span><div><b>' + CN.esc(u.name) + '</b><span>' + CN.esc(u.email) + '</span></div></div>' +
        '<div class="menu-sep"></div>' +
        '<a class="menu-item" role="menuitem" href="#cay-cua-toi">' + CN.icon('tree') + 'Cây gia phả của tôi</a>' +
        '<button class="menu-item" role="menuitem" type="button" data-action="reset-demo">' + CN.icon('refresh') + '<span>Khôi phục dữ liệu mẫu<small>Xóa mọi thay đổi trong bản demo</small></span></button>' +
        '<div class="menu-sep"></div>' +
        '<button class="menu-item danger" role="menuitem" type="button" data-action="logout">' + CN.icon('logout') + 'Đăng xuất</button>' +
      '</div></div>';
  }

  CN.headerHTML = function (variant, active) {
    var u = CN.store.currentUser();
    if (variant === 'auth') {
      return '<header class="site-header auth-header"><div class="wrap">' + brandHTML() +
        '<a class="nav-link" href="#trang-chu">' + CN.icon('arrowLeft') + 'Trở về trang chủ</a></div></header>';
    }
    var nav;
    if (variant === 'app') {
      nav = '<a class="nav-link" href="#cay-cua-toi"' + (active === 'trees' ? ' aria-current="page"' : '') + '>Cây gia phả của tôi</a>' +
        '<a class="nav-link" href="#huong-dan">Hướng dẫn</a>';
    } else {
      nav = '<a class="nav-link" href="#trang-chu" aria-current="page">Trang chủ</a>' +
        '<a class="nav-link" href="#gioi-thieu">Giới thiệu</a>' +
        '<a class="nav-link" href="#huong-dan">Hướng dẫn</a>' +
        '<div class="dropdown" data-dropdown>' +
          '<button type="button" class="nav-link" data-dropdown-toggle aria-haspopup="menu" aria-expanded="false">Công cụ ' + CN.icon('chevronDown') + '</button>' +
          '<div class="dropdown-menu" role="menu" hidden>' +
            '<a class="menu-item" role="menuitem" href="#cay-cua-toi">' + CN.icon('tree') + '<span>Tạo cây gia phả<small>Dựng cây cho dòng họ của bạn</small></span></a>' +
          '</div></div>';
    }
    var actions = u
      ? (variant === 'public' ? '<a class="btn btn-secondary btn-sm" href="#cay-cua-toi">Vào cây của tôi</a>' : '') + userMenuHTML(u)
      : '<a class="btn btn-secondary btn-sm" href="#dang-nhap">' + CN.icon('user') + '<span class="btn-login-label">Đăng nhập</span></a>' +
        '<a class="btn btn-primary btn-sm" href="#dang-ky">Đăng ký</a>';
    return '<header class="site-header"><div class="wrap">' + brandHTML() +
      '<nav class="nav" id="main-nav" aria-label="Điều hướng chính">' + nav + '</nav>' +
      '<div class="header-actions">' + actions +
        '<button type="button" class="icon-btn nav-toggle" aria-controls="main-nav" aria-expanded="false" aria-label="Mở menu">' + CN.icon('menu') + '</button>' +
      '</div></div></header>';
  };

  CN.footerHTML = function () {
    return '<footer class="site-footer"><div class="wrap">' +
      '<div class="footer-brand">' + brandHTML() +
        '<p class="footer-proverb">“Cây có cội, nước có nguồn. Chim có tổ, người có tông.”</p></div>' +
      '<div class="footer-col"><h4>Khám phá</h4><a href="#gioi-thieu">Vì sao nên lập gia phả</a><a href="#tinh-nang">Tính năng</a><a href="#huong-dan">Hướng dẫn</a></div>' +
      '<div class="footer-col"><h4>Tài khoản</h4><a href="#dang-nhap">Đăng nhập</a><a href="#dang-ky">Đăng ký</a><a href="#cay-cua-toi">Cây gia phả của tôi</a></div>' +
      '<div class="footer-bottom"><span>© 2026 Cội Nguồn · Dự án cá nhân</span><span>Bản demo: dữ liệu chỉ lưu trên trình duyệt của bạn.</span></div>' +
      '</div></footer>';
  };

  /** Gắn sự kiện chung cho đầu trang (menu, đăng xuất, khôi phục dữ liệu) */
  CN.bindHeader = function (root) {
    CN.bindDropdowns(root);
    var toggle = CN.$('.nav-toggle', root);
    var nav = CN.$('#main-nav', root);
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = !nav.classList.contains('open');
        nav.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
      });
      nav.addEventListener('click', function (e) { if (e.target.closest('a')) nav.classList.remove('open'); });
    }
    CN.$$('[data-action="logout"]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        CN.store.logout();
        CN.toast('Đã đăng xuất.', 'logout');
        CN.go('trang-chu');
      });
    });
    CN.$$('[data-action="reset-demo"]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        CN.modal({
          size: 'sm', title: 'Khôi phục dữ liệu mẫu?',
          body: '<p>Mọi thay đổi bạn đã làm trong bản demo (thêm, sửa, xóa người, tạo cây mới) sẽ bị xóa. Cây Họ Nguyễn và Họ Đỗ trở lại như ban đầu.</p>',
          foot: '<button type="button" class="btn btn-ghost" data-close>Hủy</button><button type="button" class="btn btn-primary" id="confirm-reset">' + CN.icon('refresh') + 'Khôi phục</button>',
          onMount: function (m) {
            CN.$('#confirm-reset', m).addEventListener('click', function () {
              var u = CN.store.currentUser();
              CN.store.resetDemo();
              if (u && !CN.store.currentUser()) CN.store.login('khanhlinh@gmail.com', '123456', true);
              CN.closeModal();
              CN.toast('Đã khôi phục dữ liệu mẫu.');
              CN.go(CN.store.currentUser() ? 'cay-cua-toi' : 'trang-chu');
            });
          }
        });
      });
    });
  };

  /* ---------- Điều hướng ---------- */
  function route() {
    var hash = decodeURIComponent(location.hash.replace(/^#/, ''));
    var name, arg = null;
    if (!hash || hash === 'trang-chu' || LANDING_SECTIONS.indexOf(hash) >= 0) name = 'landing';
    else if (hash === 'dang-nhap') name = 'login';
    else if (hash === 'dang-ky') name = 'register';
    else if (hash === 'cay-cua-toi') name = 'trees';
    else if (hash.indexOf('cay.') === 0) { name = 'tree'; arg = hash.slice(4); }
    else name = 'landing';

    // Đang ở trang chủ mà bấm sang mục khác của trang chủ → chỉ cuộn
    if (name === 'landing' && current && current.name === 'landing') {
      scrollToSection(hash);
      return;
    }
    if (current && current.cleanup) current.cleanup();
    CN.closeModal();
    document.body.className = 'route-' + name;
    var app = CN.$('#app');
    var view = CN.views[name];
    var cleanup = view.render(app, arg) || null;
    current = { name: name, cleanup: cleanup };
    if (name === 'landing') {
      if (LANDING_SECTIONS.indexOf(hash) >= 0) setTimeout(function () { scrollToSection(hash); }, 30);
      else global.scrollTo(0, 0);
    } else {
      global.scrollTo(0, 0);
    }
  }

  function scrollToSection(hash) {
    var target = LANDING_SECTIONS.indexOf(hash) >= 0 ? document.getElementById(hash) : null;
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else global.scrollTo({ top: 0, behavior: 'smooth' });
  }

  CN.start = function () {
    CN.store.init();
    global.addEventListener('hashchange', route);
    route();
  };
})(window);
