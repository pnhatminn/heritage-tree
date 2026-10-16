/* Trang chủ (landing page) */
(function (global) {
  'use strict';
  var CN = global.CN;

  function heroTreeSVG() {
    // viewBox 600 x 540. Thủy tổ ở gốc, các đời toả lên theo cành.
    var d = function (path, cls, delay, dur) {
      return '<path class="' + cls + ' draw" pathLength="1" style="animation-delay:' + delay + 's' + (dur ? ';animation-duration:' + dur + 's' : '') + '" d="' + path + '"/>';
    };
    var leaf = function (cx, cy, r, tone, delay) {
      return '<circle class="leaf ' + tone + '" cx="' + cx + '" cy="' + cy + '" r="' + Math.round(r * 1.22) + '" style="animation-delay:' + delay + 's"/>';
    };
    return '<svg class="tree-svg" viewBox="0 0 600 540" role="img" aria-label="Cây gia phả tự vẽ: thủy tổ ở gốc, con cháu toả lên theo các cành">' +
      '<path class="ground" d="M70 476H530"/>' +
      '<g class="halo-g">' +
        '<circle class="leaf halo" cx="300" cy="140" r="78" style="animation-delay:1.5s"/>' +
        '<circle class="leaf halo" cx="156" cy="232" r="62" style="animation-delay:1.55s"/>' +
        '<circle class="leaf halo" cx="444" cy="230" r="62" style="animation-delay:1.6s"/>' +
      '</g>' +
      d('M300 464C298 404 304 352 300 300', 'trunk', 0, .9) +
      d('M300 458C285 476 255 488 220 492', 'root', .55, .7) +
      d('M300 458C316 478 350 490 386 494', 'root', .6, .7) +
      d('M300 462C298 480 292 494 282 508', 'root', .65, .6) +
      d('M300 334C262 304 220 284 166 262', 'branch', .7) +
      d('M301 322C340 294 386 278 436 254', 'branch', .82) +
      d('M300 304C300 252 296 212 300 166', 'branch', .94) +
      d('M216 284C196 252 168 228 130 208', 'branch thin', 1.25, .8) +
      d('M392 276C412 248 442 224 476 206', 'branch thin', 1.32, .8) +
      d('M299 232C276 208 250 192 222 180', 'branch thin', 1.4, .7) +
      d('M300 216C324 196 350 184 380 174', 'branch thin', 1.46, .7) +
      '<g opacity=".94">' +
        leaf(300, 152, 46, '', 1.62) + leaf(262, 168, 32, 'l2', 1.7) + leaf(340, 164, 34, 'l2', 1.72) +
        leaf(300, 112, 32, 'l3', 1.8) + leaf(274, 130, 20, 'l4', 1.86) + leaf(328, 132, 18, 'l4', 1.9) +
        leaf(160, 250, 38, '', 1.66) + leaf(130, 228, 28, 'l2', 1.74) + leaf(190, 228, 26, 'l2', 1.76) +
        leaf(128, 200, 22, 'l3', 1.84) + leaf(156, 214, 15, 'l4', 1.92) +
        leaf(440, 248, 38, '', 1.68) + leaf(470, 226, 28, 'l2', 1.76) + leaf(410, 228, 26, 'l2', 1.78) +
        leaf(472, 198, 22, 'l3', 1.86) + leaf(446, 212, 15, 'l4', 1.94) +
      '</g>' +
      '</svg>';
  }

  function tag(x, y, initials, name, sub, delay, root) {
    return '<div class="name-tag' + (root ? ' root-tag' : '') + (sub.indexOf('Đời 3') === 0 ? ' t3' : '') + '" style="left:' + x + '%;top:' + y + '%;animation-delay:' + delay + 's">' +
      '<span class="avatar">' + initials + '</span><span class="nt-text"><b>' + name + '</b><small>' + sub + '</small></span></div>';
  }

  function previewCardHTML() {
    var S = CN.store;
    var a = S.person('n-a');
    if (!a) return '';
    var n = S.nextGio(a);
    var when = n ? (CN.Lunar_weekday(n.date) + ', ' + CN.fmtSolar(n.date) + ' · ' + CN.daysLeftText(n.daysLeft).toLowerCase()) : '';
    return '<aside class="preview-card" aria-label="Ví dụ khung chi tiết">' +
      '<div class="pc-head">' + CN.avatarHTML(a) + '<div><span class="chip chip-red">Đời 1 · Thủy tổ</span><h3>' + CN.esc(a.name) + '</h3></div></div>' +
      '<div class="gio">' + CN.icon('incense') + '<div><b>Giỗ ngày 12 tháng 3 âm lịch</b><span>Năm tới: ' + when + '</span></div></div>' +
      '<blockquote>“' + CN.esc(a.bio) + '”</blockquote>' +
      '</aside>';
  }

  CN.Lunar_weekday = function (date) { return global.Lunar.weekday(date); };

  CN.views.landing = {
    render: function (app) {
      var u = CN.store.currentUser();
      var primaryHref = u ? '#cay-cua-toi' : '#dang-ky';
      var trialHref = u ? '#cay.ho-nguyen' : '#dang-nhap';

      app.innerHTML = CN.headerHTML('public') +
        '<main id="main">' +

        /* HERO */
        '<section class="hero">' +
          '<div class="cloud" data-parallax="0.12" style="width:260px;left:-60px;top:40px">' + CN.cloudSVG() + '</div>' +
          '<div class="cloud" data-parallax="-0.08" style="width:200px;right:4%;top:18px;color:#EDE0CB">' + CN.cloudSVG() + '</div>' +
          '<div class="wrap">' +
            '<div class="hero-copy">' +
              '<span class="eyebrow">Gia phả trực tuyến cho gia đình Việt</span>' +
              '<h1 class="h-display">Gìn giữ <em>cội nguồn</em> cho con cháu mai sau</h1>' +
              '<p class="lead">Dựng cây gia phả của dòng họ bạn, lưu lại câu chuyện của từng người.</p>' +
              '<div class="hero-ctas">' +
                '<a class="btn btn-primary btn-lg" href="' + primaryHref + '">' + CN.icon('tree') + 'Dựng cây gia phả</a>' +
                '<a class="btn btn-secondary btn-lg" href="#xem-thu">Xem cây mẫu</a>' +
              '</div>' +
              '<div class="hero-facts">' +
                '<span>' + CN.icon('calendar') + 'Ngày giỗ theo âm lịch</span>' +
                '<span>' + CN.icon('lock') + 'Cây của bạn, chỉ bạn xem</span>' +
                '<span>' + CN.icon('family') + 'Ghi cả bên nội, bên ngoại</span>' +
              '</div>' +
            '</div>' +
            '<div class="hero-art tree-anim">' +
              '<div class="paper-disc"></div>' +
              heroTreeSVG() +
              tag(50, 30, 'NE', 'Nguyễn Thị E', 'Đời 2 · Con', 2.2) +
              tag(23, 53, 'NC', 'Nguyễn Văn C', 'Đời 2 · Con', 2.35) +
              tag(77, 51, 'NH', 'Nguyễn Văn H', 'Đời 2 · Con', 2.5) +
              tag(18, 34, 'NL', 'Nguyễn Văn L', 'Đời 3 · Cháu', 2.65) +
              tag(83, 33, 'NP', 'Nguyễn Văn P', 'Đời 3 · Cháu', 2.8) +
              tag(50, 95, 'NA', 'Nguyễn Văn A', 'Đời 1 · Thủy tổ', 1.2, true) +
              '<div class="seal-mark" style="right:3%;bottom:16%;animation-delay:3.1s">CỘI<br>NGUỒN</div>' +
            '</div>' +
          '</div>' +
        '</section>' +

        /* BĂNG CA DAO */
        '<div class="band"><div class="wrap">' +
          '<q>Cây có cội, nước có nguồn</q><span class="sep" aria-hidden="true"></span><q>Chim có tổ, người có tông</q>' +
        '</div></div>' +

        /* VÌ SAO */
        '<section class="section" id="gioi-thieu"><div class="wrap">' +
          '<div class="section-head center" data-reveal>' +
            '<span class="eyebrow">Vì sao nên lập gia phả</span>' +
            '<h2 class="h2">Hiểu nguồn cội để gắn kết các thế hệ</h2>' +
            '<p class="lead">Gia phả không chỉ là danh sách tên tuổi. Đó là sợi dây nối người đi trước với người đi sau.</p>' +
          '</div>' +
          '<div class="why-grid">' +
            '<article class="why-card" data-reveal><div class="why-icon">' + CN.icon('compass') + '</div><h3>Biết mình từ đâu đến</h3>' +
              '<p>Con cháu biết ông bà, cụ kỵ là ai, quê gốc ở đâu, các chi các nhánh liên hệ với nhau thế nào.</p></article>' +
            '<article class="why-card" data-reveal><div class="why-icon">' + CN.icon('incense') + '</div><h3>Không quên ngày giỗ</h3>' +
              '<p>Ngày giỗ ghi theo âm lịch và được đổi sang dương lịch mỗi năm, để cả nhà sắp xếp về đông đủ.</p></article>' +
            '<article class="why-card" data-reveal><div class="why-icon">' + CN.icon('scroll') + '</div><h3>Giữ lại câu chuyện của từng người</h3>' +
              '<p>Ngoài tên tuổi, mỗi người còn có tiểu sử, nghề nghiệp, lời dặn dò để đời sau còn nhớ.</p></article>' +
          '</div>' +
        '</div></section>' +

        /* TÍNH NĂNG */
        '<section class="section feat-section" id="tinh-nang"><div class="wrap">' +
          '<div class="section-head split" data-reveal>' +
            '<div><span class="eyebrow">Tính năng</span><h2 class="h2">Làm riêng cho nếp nhà người Việt</h2></div>' +
            '<p class="lead">Thủy tổ ở trên cùng, các đời xếp theo hàng như phả đồ treo ở nhà thờ họ, nhưng bấm vào là xem được từng người.</p>' +
          '</div>' +
          '<div class="feat-grid" data-reveal>' +
            '<article class="feat"><div class="feat-icon">' + CN.icon('tree') + '</div><h3>Cây gia phả trực quan</h3>' +
              '<p>Kéo để di chuyển, phóng to thu nhỏ, thu gọn từng nhánh khi cây đông người.</p><span class="feat-foot">' + CN.icon('check') + 'Tự sắp xếp theo đời</span></article>' +
            '<article class="feat"><div class="feat-icon">' + CN.icon('user') + '</div><h3>Xem chi tiết từng người</h3>' +
              '<p>Bấm vào một người để xem năm sinh, ngày giỗ, quê quán, tiểu sử và người thân.</p><span class="feat-foot">' + CN.icon('check') + 'Tô đường huyết thống</span></article>' +
            '<article class="feat"><div class="feat-icon">' + CN.icon('calendar') + '</div><h3>Ngày giỗ theo âm lịch</h3>' +
              '<p>Nhập ngày âm hay dương đều được. Có tính sẵn ngày giỗ năm nay rơi vào thứ mấy.</p><span class="feat-foot">' + CN.icon('check') + 'Có tháng nhuận</span></article>' +
            '<article class="feat"><div class="feat-icon">' + CN.icon('lock') + '</div><h3>Nhiều cây, riêng tư</h3>' +
              '<p>Lập riêng cây bên nội, bên ngoại. Mỗi cây chỉ chủ tài khoản xem được.</p><span class="feat-foot">' + CN.icon('check') + 'Không công khai</span></article>' +
          '</div>' +
        '</div></section>' +

        /* XEM THỬ */
        '<section class="section" id="xem-thu"><div class="wrap">' +
          '<div class="section-head center" data-reveal>' +
            '<span class="eyebrow">Xem thử</span>' +
            '<h2 class="h2">Cây Họ Nguyễn: 15 người, 4 đời</h2>' +
            '<p class="lead">Đây là cây mẫu có sẵn trong tài khoản dùng thử. Đăng nhập để bấm vào từng người, thêm con cháu và sửa thông tin.</p>' +
          '</div>' +
          '<div class="preview-frame" data-reveal>' +
            '<div class="preview-chrome"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
              '<span class="title">Họ Nguyễn – bên nội</span><span class="muted" style="font-size:13.5px">15 thành viên · 4 đời</span>' +
              '<span class="chip chip-gold">' + CN.icon('eye') + 'Chỉ xem</span></div>' +
            '<div class="preview-body"><div class="canvas" id="preview-canvas" style="position:absolute;inset:0;cursor:default;background:transparent"></div>' +
              previewCardHTML() + '</div>' +
          '</div>' +
          '<div class="preview-cta"><a class="btn btn-primary btn-lg" href="' + trialHref + '">Mở cây mẫu ' + CN.icon('arrowRight') + '</a></div>' +
        '</div></section>' +

        /* 3 BƯỚC */
        '<section class="section" id="huong-dan" style="padding-top:24px"><div class="wrap">' +
          '<div class="section-head center" data-reveal>' +
            '<span class="eyebrow">Hướng dẫn</span>' +
            '<h2 class="h2">Bắt đầu trong 3 bước</h2>' +
          '</div>' +
          '<div class="steps">' +
            '<article class="step" data-reveal><span class="step-num">01</span><span class="step-icon">' + CN.icon('user') + '</span><h3>Tạo tài khoản</h3>' +
              '<p>Đăng ký bằng email, mất chưa tới một phút.</p></article>' +
            '<article class="step" data-reveal><span class="step-num">02</span><span class="step-icon">' + CN.icon('userPlus') + '</span><h3>Thêm thành viên</h3>' +
              '<p>Bắt đầu từ người bạn biết rõ nhất, thường là ông bà nội, rồi thêm cha mẹ, vợ chồng, con cháu.</p></article>' +
            '<article class="step" data-reveal><span class="step-num">03</span><span class="step-icon">' + CN.icon('search') + '</span><h3>Khám phá cây</h3>' +
              '<p>Bấm vào từng người để xem chi tiết. Tìm theo tên, thu gọn nhánh, xem đường huyết thống lên tới thủy tổ.</p></article>' +
          '</div>' +
          '<div class="demo-strip" data-reveal>' +
            '<span>' + CN.icon('info', '') + '</span>' +
            '<span>Tài khoản dùng thử:</span><span class="cred">khanhlinh@gmail.com</span><span class="cred">123456</span>' +
            '<a class="btn btn-gold btn-sm" href="#dang-nhap">Đăng nhập dùng thử ' + CN.icon('arrowRight') + '</a>' +
          '</div>' +
        '</div></section>' +

        /* CTA */
        '<section class="section" style="padding-top:8px"><div class="wrap">' +
          '<div class="cta-block" data-reveal>' +
            '<div class="cloud" style="width:240px;left:-40px;bottom:-20px;color:#F2D5CF">' + CN.cloudSVG() + '</div>' +
            '<div class="cloud" style="width:200px;right:-30px;top:10px;color:#F2D5CF">' + CN.cloudSVG() + '</div>' +
            '<span class="seal-mark">CỘI<br>NGUỒN</span>' +
            '<h2 class="h1" style="position:relative">Bắt đầu lưu giữ gia phả nhà bạn</h2>' +
            '<p style="position:relative">Những câu chuyện của ông bà sẽ mất dần nếu không ai ghi lại. Hãy bắt đầu từ một cái tên.</p>' +
            '<div class="hero-ctas" style="justify-content:center;position:relative">' +
              '<a class="btn btn-primary btn-lg" href="' + primaryHref + '">' + CN.icon('tree') + 'Dựng cây gia phả</a>' +
              '<a class="btn btn-secondary btn-lg" href="' + trialHref + '">Dùng thử tài khoản mẫu</a>' +
            '</div>' +
          '</div>' +
        '</div></section>' +

        '</main>' + CN.footerHTML();

      CN.bindHeader(app);

      // Khung xem thử: vẽ cây thật ở chế độ chỉ xem
      var pc = CN.$('#preview-canvas', app);
      var preview = null;
      if (pc && CN.store.tree('ho-nguyen')) {
        preview = new CN.TreeCanvas({
          el: pc, treeId: 'ho-nguyen', interactive: false,
          getInsets: function () {
            var wide = pc.clientWidth > 760;
            return { left: 24, right: wide ? 340 : 24, top: 40, bottom: 24 };
          }
        });
        preview.render();
        requestAnimationFrame(function () { preview.fit(false); });
      }

      // Hiệu ứng khi cuộn: chỉ bật sau lần cuộn đầu tiên để trang luôn đầy đủ khi vừa mở
      var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var io = null, armed = false;
      function arm() {
        if (armed || reduce || !('IntersectionObserver' in global)) return;
        armed = true;
        var vh = global.innerHeight;
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { en.target.classList.remove('reveal-pending'); en.target.classList.add('reveal-in'); io.unobserve(en.target); }
          });
        }, { rootMargin: '0px 0px -8% 0px' });
        CN.$$('[data-reveal]', app).forEach(function (el) {
          if (el.getBoundingClientRect().top > vh) { el.classList.add('reveal-pending'); io.observe(el); }
        });
      }
      var clouds = CN.$$('[data-parallax]', app);
      var ticking = false;
      function onScroll() {
        arm();
        if (reduce || ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = global.scrollY;
          clouds.forEach(function (c) { c.style.transform = 'translateY(' + (y * Number(c.dataset.parallax)) + 'px)'; });
          ticking = false;
        });
      }
      global.addEventListener('scroll', onScroll, { passive: true });
      function onResize() { if (preview) preview.fit(false); }
      global.addEventListener('resize', onResize);

      return function cleanup() {
        global.removeEventListener('scroll', onScroll);
        global.removeEventListener('resize', onResize);
        if (io) io.disconnect();
        if (preview) preview.destroy();
      };
    }
  };
})(window);
