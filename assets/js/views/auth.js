/* Đăng nhập & Đăng ký */
(function (global) {
  'use strict';
  var CN = global.CN;
  var DEMO_EMAIL = 'khanhlinh@gmail.com';
  var DEMO_PASS = '123456';

  /* Cây đa đầu làng: tán rộng, rễ phụ buông xuống */
  function banyanSVG() {
    var roots = '';
    [96, 120, 146, 170, 232, 256, 282, 306].forEach(function (x, i) {
      var top = 160 + (i % 3) * 5, len = 64 + (i % 4) * 14;
      roots += '<path d="M' + x + ' ' + top + 'C' + (x + 2) + ' ' + (top + len * .4) + ' ' + (x - 3) + ' ' + (top + len * .7) + ' ' + x + ' ' + (top + len) + '" stroke="#8A6E58" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>';
    });
    return '<svg viewBox="0 0 400 330" aria-hidden="true">' +
      '<ellipse cx="200" cy="300" rx="170" ry="14" fill="#E9DDC8"/>' +
      '<g fill="#BFD3C5"><circle cx="118" cy="108" r="50"/><circle cx="200" cy="78" r="64"/><circle cx="284" cy="104" r="52"/><circle cx="334" cy="130" r="38"/><circle cx="72" cy="132" r="38"/></g>' +
      '<g fill="#7FA08E"><circle cx="140" cy="120" r="44"/><circle cx="200" cy="102" r="52"/><circle cx="262" cy="118" r="46"/><circle cx="98" cy="140" r="32"/><circle cx="306" cy="142" r="34"/></g>' +
      '<g fill="#4F7562"><ellipse cx="200" cy="152" rx="150" ry="26"/><circle cx="150" cy="146" r="28"/><circle cx="252" cy="146" r="28"/></g>' +
      roots +
      '<path d="M184 300C188 250 186 196 192 160h18c6 40 4 100 8 140Z" fill="#4A3527"/>' +
      '<path d="M184 300c-14 2-26 6-36 10M218 300c14 2 28 6 38 10" stroke="#4A3527" stroke-width="7" stroke-linecap="round" fill="none"/>' +
      '<path d="M198 162c-14-14-30-20-52-22M204 162c14-16 32-22 54-22" stroke="#4A3527" stroke-width="6" stroke-linecap="round" fill="none"/>' +
      '</svg>';
  }

  function artPanel(kind) {
    var top = '<div class="art-top"><span class="seal-mark">CỘI<br>NGUỒN</span><div><span class="art-kicker">Gia phả dòng họ Việt</span><b>Cây có cội, nước có nguồn</b></div></div>';
    var tree = '<div class="art-tree">' + banyanSVG() + '</div>';
    var bottom;
    if (kind === 'login') {
      bottom = '<div class="art-quote"><q>Chim có tổ, người có tông</q>' +
        '<p>Mỗi cái tên trong gia phả là một người đã sống, đã thương yêu và để lại điều gì đó cho con cháu.</p></div>';
    } else {
      bottom = '<ul>' +
        '<li><span class="li-icon">' + CN.icon('lock') + '</span><div><b>Cây của bạn, chỉ bạn xem</b><span>Không ai khác mở được gia phả trong tài khoản của bạn.</span></div></li>' +
        '<li><span class="li-icon">' + CN.icon('calendar') + '</span><div><b>Ngày giỗ theo âm lịch</b><span>Tự đổi sang dương lịch mỗi năm, có cả tháng nhuận.</span></div></li>' +
        '<li><span class="li-icon">' + CN.icon('family') + '</span><div><b>Bên nội, bên ngoại</b><span>Lập nhiều cây cho từng dòng họ trong một tài khoản.</span></div></li>' +
        '</ul>';
    }
    return '<div class="auth-art">' +
      '<div class="cloud" style="width:180px;right:-40px;top:24px;color:#EADCCB">' + CN.cloudSVG() + '</div>' +
      top + tree + bottom + '</div>';
  }

  function fieldError(input, msg) {
    var f = input.closest('.field');
    var old = CN.$('.error-text', f);
    if (old) old.remove();
    if (msg) {
      input.setAttribute('aria-invalid', 'true');
      var id = input.id + '-err';
      var p = document.createElement('p');
      p.className = 'error-text'; p.id = id;
      p.innerHTML = CN.icon('alert') + '<span>' + CN.esc(msg) + '</span>';
      f.appendChild(p);
      input.setAttribute('aria-describedby', id);
    } else {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
    return !msg;
  }
  CN.fieldError = fieldError;

  function validEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s); }

  function pwToggle(id) {
    return '<button type="button" class="icon-btn trail-btn" data-toggle-pw="' + id + '" aria-label="Hiện mật khẩu">' + CN.icon('eye') + '</button>';
  }
  function bindPwToggles(root) {
    CN.$$('[data-toggle-pw]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var inp = CN.$('#' + b.dataset.togglePw, root);
        var show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        b.innerHTML = CN.icon(show ? 'eyeOff' : 'eye');
        b.setAttribute('aria-label', show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
      });
    });
  }

  function googleNotice() {
    CN.toast('Bản demo chưa kết nối Google. Hãy dùng tài khoản dùng thử.', 'info');
  }

  /* ---------- Đăng nhập ---------- */
  CN.views.login = {
    render: function (app) {
      if (CN.store.currentUser()) { CN.go(CN.takeNext() || 'cay-cua-toi'); return; }
      app.innerHTML = CN.headerHTML('auth') +
        '<main class="auth-page"><div class="wrap"><div class="auth-card">' + artPanel('login') +
        '<div class="auth-form">' +
          '<div><span class="chip chip-red">' + CN.icon('tree') + 'Cây gia phả của bạn</span></div>' +
          '<h1>Đăng nhập</h1>' +
          '<p class="sub">Chào mừng bạn trở lại với gia phả của dòng họ.</p>' +
          '<div class="demo-box">' +
            '<span class="db-icon">' + CN.icon('sparkle') + '</span>' +
            '<div class="db-text"><b>Tài khoản dùng thử <span class="chip chip-solid-red" style="height:20px;font-size:11px">DEMO</span></b>' +
            '<span class="db-sub">Email <code>' + DEMO_EMAIL + '</code> · Mật khẩu <code>' + DEMO_PASS + '</code></span></div>' +
            '<button type="button" class="btn btn-secondary btn-sm" id="fill-demo">Điền tự động</button>' +
          '</div>' +
          '<div id="login-alert" role="alert"></div>' +
          '<form id="login-form" novalidate>' +
            '<div class="field"><label class="label" for="login-email">Email</label>' +
              '<div class="input-wrap">' + CN.icon('mail', 'lead-icon') + '<input class="input" id="login-email" type="email" autocomplete="username" placeholder="ten@gmail.com"></div></div>' +
            '<div class="field"><label class="label" for="login-pass">Mật khẩu</label>' +
              '<div class="input-wrap">' + CN.icon('lock', 'lead-icon') + '<input class="input" id="login-pass" type="password" autocomplete="current-password" placeholder="Mật khẩu của bạn" style="padding-right:52px">' + pwToggle('login-pass') + '</div></div>' +
            '<div class="row-between"><label class="check"><input type="checkbox" id="login-remember" checked> Ghi nhớ đăng nhập</label>' +
              '<button type="button" class="link-btn" id="forgot">Quên mật khẩu?</button></div>' +
            '<button type="submit" class="btn btn-primary btn-lg btn-block">Đăng nhập</button>' +
          '</form>' +
          '<div class="or-sep">hoặc</div>' +
          '<button type="button" class="btn btn-secondary btn-lg btn-block" id="google-btn">' + CN.googleG + 'Đăng nhập với Google</button>' +
          '<p class="auth-switch">Chưa có tài khoản? <a href="#dang-ky">Đăng ký</a></p>' +
        '</div></div></div></main>' + CN.footerHTML();

      CN.bindHeader(app);
      bindPwToggles(app);
      var email = CN.$('#login-email', app), pass = CN.$('#login-pass', app), alertBox = CN.$('#login-alert', app);

      CN.$('#fill-demo', app).addEventListener('click', function () {
        email.value = DEMO_EMAIL; pass.value = DEMO_PASS;
        fieldError(email, ''); fieldError(pass, ''); alertBox.innerHTML = '';
        CN.$('button[type="submit"]', app).focus();
      });
      CN.$('#forgot', app).addEventListener('click', function () {
        alertBox.innerHTML = '<div class="form-alert info">' + CN.icon('info') + '<span>Bản demo chưa có chức năng đặt lại mật khẩu. Hãy dùng tài khoản dùng thử ở trên.</span></div>';
      });
      CN.$('#google-btn', app).addEventListener('click', googleNotice);
      email.addEventListener('input', function () { fieldError(email, ''); });
      pass.addEventListener('input', function () { fieldError(pass, ''); });

      CN.$('#login-form', app).addEventListener('submit', function (e) {
        e.preventDefault();
        alertBox.innerHTML = '';
        var ok = true;
        var ev = email.value.trim();
        if (!ev) ok = fieldError(email, 'Hãy nhập email.') && ok;
        else if (!validEmail(ev)) ok = fieldError(email, 'Email chưa đúng định dạng, ví dụ: ten@gmail.com') && ok;
        if (!pass.value) ok = fieldError(pass, 'Hãy nhập mật khẩu.') && ok;
        if (!ok) { (CN.$('[aria-invalid="true"]', app) || email).focus(); return; }
        var u = CN.store.login(ev, pass.value, CN.$('#login-remember', app).checked);
        if (!u) {
          alertBox.innerHTML = '<div class="form-alert">' + CN.icon('alert') + '<span>Email hoặc mật khẩu chưa đúng. Kiểm tra lại, hoặc dùng tài khoản dùng thử ở trên.</span></div>';
          pass.select();
          return;
        }
        CN.toast('Chào mừng ' + u.name + ' trở lại.');
        CN.go(CN.takeNext() || 'cay-cua-toi');
      });
    }
  };

  /* ---------- Đăng ký ---------- */
  CN.views.register = {
    render: function (app) {
      if (CN.store.currentUser()) { CN.go('cay-cua-toi'); return; }
      app.innerHTML = CN.headerHTML('auth') +
        '<main class="auth-page"><div class="wrap"><div class="auth-card">' + artPanel('register') +
        '<div class="auth-form">' +
          '<div><span class="chip chip-red">' + CN.icon('sapling') + 'Tài khoản mới</span></div>' +
          '<h1>Tạo tài khoản</h1>' +
          '<p class="sub">Chưa tới một phút, rồi bạn có thể dựng cây gia phả đầu tiên.</p>' +
          '<form id="reg-form" novalidate>' +
            '<div class="field"><label class="label" for="reg-name">Họ và tên</label>' +
              '<div class="input-wrap">' + CN.icon('user', 'lead-icon') + '<input class="input" id="reg-name" autocomplete="name" placeholder="Ví dụ: Nguyễn Văn A"></div></div>' +
            '<div class="field"><label class="label" for="reg-email">Email</label>' +
              '<div class="input-wrap">' + CN.icon('mail', 'lead-icon') + '<input class="input" id="reg-email" type="email" autocomplete="email" placeholder="ten@gmail.com"></div></div>' +
            '<div class="grid-2">' +
              '<div class="field"><label class="label" for="reg-pass">Mật khẩu</label>' +
                '<div class="input-wrap">' + CN.icon('lock', 'lead-icon') + '<input class="input" id="reg-pass" type="password" autocomplete="new-password" placeholder="Ít nhất 6 ký tự" style="padding-right:52px">' + pwToggle('reg-pass') + '</div></div>' +
              '<div class="field"><label class="label" for="reg-pass2">Nhập lại mật khẩu</label>' +
                '<div class="input-wrap">' + CN.icon('lock', 'lead-icon') + '<input class="input" id="reg-pass2" type="password" autocomplete="new-password" placeholder="Nhập lại" style="padding-right:52px">' + pwToggle('reg-pass2') + '</div></div>' +
            '</div>' +
            '<div class="form-alert info">' + CN.icon('info') + '<span>Đây là bản demo: tài khoản và gia phả chỉ lưu trên trình duyệt này.</span></div>' +
            '<button type="submit" class="btn btn-primary btn-lg btn-block">Tạo tài khoản</button>' +
          '</form>' +
          '<div class="or-sep">hoặc</div>' +
          '<button type="button" class="btn btn-secondary btn-lg btn-block" id="google-btn">' + CN.googleG + 'Đăng ký với Google</button>' +
          '<p class="auth-switch">Đã có tài khoản? <a href="#dang-nhap">Đăng nhập</a></p>' +
        '</div></div></div></main>' + CN.footerHTML();

      CN.bindHeader(app);
      bindPwToggles(app);
      CN.$('#google-btn', app).addEventListener('click', googleNotice);
      var f = {
        name: CN.$('#reg-name', app), email: CN.$('#reg-email', app),
        pass: CN.$('#reg-pass', app), pass2: CN.$('#reg-pass2', app)
      };
      Object.keys(f).forEach(function (k) { f[k].addEventListener('input', function () { fieldError(f[k], ''); }); });

      CN.$('#reg-form', app).addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true;
        var name = f.name.value.trim(), em = f.email.value.trim();
        if (name.length < 2) ok = fieldError(f.name, 'Hãy nhập họ và tên của bạn.') && ok;
        if (!em) ok = fieldError(f.email, 'Hãy nhập email.') && ok;
        else if (!validEmail(em)) ok = fieldError(f.email, 'Email chưa đúng định dạng, ví dụ: ten@gmail.com') && ok;
        else if (CN.store.emailTaken(em)) ok = fieldError(f.email, 'Email này đã có tài khoản. Hãy đăng nhập.') && ok;
        if (f.pass.value.length < 6) ok = fieldError(f.pass, 'Mật khẩu cần ít nhất 6 ký tự.') && ok;
        if (f.pass2.value !== f.pass.value || !f.pass2.value) ok = fieldError(f.pass2, 'Hai mật khẩu chưa khớp nhau.') && ok;
        if (!ok) { CN.$('[aria-invalid="true"]', app).focus(); return; }
        var u = CN.store.register(name, em, f.pass.value);
        CN.toast('Đã tạo tài khoản. Chào ' + u.name + '!');
        CN.go('cay-cua-toi');
      });
    }
  };
})(window);
