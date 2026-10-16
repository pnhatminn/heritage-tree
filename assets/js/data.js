/*
 * Dữ liệu mẫu cho bản demo.
 * Cấu trúc này cũng là gợi ý cho bảng dữ liệu khi làm server (xem CLAUDE.md):
 *   users  : tài khoản
 *   trees  : mỗi cây là một dòng họ, thuộc về một tài khoản
 *   people : mỗi người thuộc một cây; quan hệ lưu bằng fatherId / motherId / spouseIds
 * Ngày tháng: { d, m, y, cal: 'duong' | 'am', leap } — được phép thiếu ngày/tháng.
 * Ngày giỗ (gio): { d, m } theo âm lịch.
 */
(function (global) {
  'use strict';
  var CN = global.CN = global.CN || {};

  var NAM_DINH = 'Xã Yên Phong, huyện Ý Yên, tỉnh Nam Định';
  var THANH_OAI = 'Xã Bình Minh, huyện Thanh Oai, Hà Nội';

  function person(o) {
    return Object.assign({
      alias: '', gender: 'nam', birth: null, death: null, deceased: false, gio: null,
      hometown: '', burial: '', residence: '', bio: '', photo: '',
      fatherId: null, motherId: null, spouseIds: []
    }, o);
  }

  CN.SEED = {
    version: 1,
    users: [
      { id: 'u-khanhlinh', name: 'Khánh Linh', email: 'khanhlinh@gmail.com', password: '123456', createdAt: '2026-09-02T08:00:00+07:00' }
    ],
    trees: [
      {
        id: 'ho-nguyen', ownerId: 'u-khanhlinh', name: 'Họ Nguyễn – bên nội', kind: 'noi',
        description: 'Chi họ Nguyễn lập nghiệp tại xã Yên Phong, huyện Ý Yên, tỉnh Nam Định từ đầu thế kỷ XX. Nhà thờ họ ở xóm Đình.',
        rootId: 'n-a', createdAt: '2026-09-02T08:10:00+07:00', updatedAt: '2026-10-14T20:15:00+07:00'
      },
      {
        id: 'ho-do', ownerId: 'u-khanhlinh', name: 'Họ Đỗ – bên ngoại', kind: 'ngoai',
        description: 'Nhà ông bà ngoại ở Thanh Oai, Hà Nội. Đang hỏi thêm các bác để bổ sung tiểu sử.',
        rootId: 'd-t', createdAt: '2026-09-20T19:00:00+07:00', updatedAt: '2026-10-11T21:40:00+07:00'
      }
    ],
    people: [
      /* ---------- Họ Nguyễn – bên nội (15 người, 4 đời) ---------- */
      person({
        id: 'n-a', treeId: 'ho-nguyen', name: 'Nguyễn Văn A', alias: 'Cụ Đồ A', gender: 'nam',
        birth: { d: 15, m: 8, y: 1920, cal: 'duong' }, death: { d: 12, m: 3, y: 1995, cal: 'am' }, deceased: true, gio: { d: 12, m: 3 },
        hometown: NAM_DINH, burial: 'Nghĩa trang dòng họ Nguyễn, cánh đồng Mả Tổ, xã Yên Phong',
        bio: 'Cụ là người đầu tiên của chi họ lập nghiệp tại làng, làm nghề dạy chữ và bốc thuốc. Cụ dạy con cháu giữ nếp chăm học, sống hiền hòa với xóm giềng.',
        spouseIds: ['n-b']
      }),
      person({
        id: 'n-b', treeId: 'ho-nguyen', name: 'Trần Thị B', gender: 'nu',
        birth: { y: 1924, cal: 'duong' }, death: { d: 8, m: 10, y: 2001, cal: 'am' }, deceased: true, gio: { d: 8, m: 10 },
        hometown: 'Xã Kim Thái, huyện Vụ Bản, tỉnh Nam Định', burial: 'Nghĩa trang dòng họ Nguyễn, cạnh mộ cụ ông',
        bio: 'Cụ bà làm nghề dệt vải, một mình tần tảo nuôi ba người con những năm cụ ông đi dạy học xa nhà.',
        spouseIds: ['n-a']
      }),
      person({
        id: 'n-c', treeId: 'ho-nguyen', name: 'Nguyễn Văn C', gender: 'nam',
        birth: { y: 1945, cal: 'duong' }, death: { d: 23, m: 7, y: 2018, cal: 'am' }, deceased: true, gio: { d: 23, m: 7 },
        hometown: NAM_DINH, burial: 'Nghĩa trang dòng họ Nguyễn',
        bio: 'Con trưởng của cụ A. Đi bộ đội năm 1965, phục viên năm 1976 rồi làm kế toán hợp tác xã. Là người giữ cuốn gia phả chữ Nho của cụ.',
        fatherId: 'n-a', motherId: 'n-b', spouseIds: ['n-d']
      }),
      person({
        id: 'n-d', treeId: 'ho-nguyen', name: 'Lê Thị D', gender: 'nu',
        birth: { y: 1948, cal: 'duong' }, hometown: 'Xã Yên Ninh, huyện Ý Yên, tỉnh Nam Định', residence: NAM_DINH,
        spouseIds: ['n-c']
      }),
      person({
        id: 'n-e', treeId: 'ho-nguyen', name: 'Nguyễn Thị E', gender: 'nu',
        birth: { y: 1950, cal: 'duong' }, hometown: NAM_DINH, residence: 'Thành phố Nam Định',
        bio: 'Giáo viên tiểu học, nghỉ hưu năm 2005.',
        fatherId: 'n-a', motherId: 'n-b', spouseIds: ['n-g']
      }),
      person({
        id: 'n-g', treeId: 'ho-nguyen', name: 'Phạm Văn G', gender: 'nam',
        birth: { y: 1947, cal: 'duong' }, death: { d: 2, m: 1, y: 2020, cal: 'am' }, deceased: true, gio: { d: 2, m: 1 },
        hometown: 'Huyện Hải Hậu, tỉnh Nam Định', burial: 'Nghĩa trang quê nhà, Hải Hậu',
        spouseIds: ['n-e']
      }),
      person({
        id: 'n-h', treeId: 'ho-nguyen', name: 'Nguyễn Văn H', gender: 'nam',
        birth: { d: 4, m: 6, y: 1955, cal: 'duong' }, hometown: NAM_DINH, residence: 'Phường Dịch Vọng, Cầu Giấy, Hà Nội',
        bio: 'Kỹ sư cầu đường, chuyển lên Hà Nội từ năm 1980.',
        fatherId: 'n-a', motherId: 'n-b', spouseIds: ['n-k']
      }),
      person({
        id: 'n-k', treeId: 'ho-nguyen', name: 'Đỗ Thị K', gender: 'nu',
        birth: { y: 1958, cal: 'duong' }, hometown: THANH_OAI, residence: 'Phường Dịch Vọng, Cầu Giấy, Hà Nội',
        spouseIds: ['n-h']
      }),
      person({
        id: 'n-l', treeId: 'ho-nguyen', name: 'Nguyễn Văn L', gender: 'nam',
        birth: { y: 1970, cal: 'duong' }, hometown: NAM_DINH, residence: NAM_DINH,
        fatherId: 'n-c', motherId: 'n-d'
      }),
      person({
        id: 'n-m', treeId: 'ho-nguyen', name: 'Nguyễn Thị M', gender: 'nu',
        birth: { y: 1973, cal: 'duong' }, hometown: NAM_DINH, residence: 'Quận Hà Đông, Hà Nội',
        fatherId: 'n-c', motherId: 'n-d'
      }),
      person({
        id: 'n-n', treeId: 'ho-nguyen', name: 'Phạm Văn N', gender: 'nam',
        birth: { y: 1975, cal: 'duong' }, hometown: 'Huyện Hải Hậu, tỉnh Nam Định', residence: 'Thành phố Nam Định',
        fatherId: 'n-g', motherId: 'n-e'
      }),
      person({
        id: 'n-p', treeId: 'ho-nguyen', name: 'Nguyễn Văn P', gender: 'nam',
        birth: { d: 20, m: 11, y: 1982, cal: 'duong' }, hometown: NAM_DINH, residence: 'Phường Dịch Vọng, Cầu Giấy, Hà Nội',
        fatherId: 'n-h', motherId: 'n-k'
      }),
      person({
        id: 'n-q', treeId: 'ho-nguyen', name: 'Nguyễn Văn Q', gender: 'nam',
        birth: { y: 2000, cal: 'duong' }, hometown: NAM_DINH, fatherId: 'n-l'
      }),
      person({
        id: 'n-r', treeId: 'ho-nguyen', name: 'Nguyễn Thị R', gender: 'nu',
        birth: { y: 2004, cal: 'duong' }, hometown: NAM_DINH, fatherId: 'n-l'
      }),
      person({
        id: 'n-s', treeId: 'ho-nguyen', name: 'Nguyễn Văn S', gender: 'nam',
        birth: { d: 5, m: 9, y: 2012, cal: 'duong' }, hometown: NAM_DINH, fatherId: 'n-p'
      }),

      /* ---------- Họ Đỗ – bên ngoại (6 người, 3 đời) ---------- */
      person({
        id: 'd-t', treeId: 'ho-do', name: 'Đỗ Văn T', gender: 'nam',
        birth: { y: 1928, cal: 'duong' }, death: { d: 19, m: 11, y: 2005, cal: 'am' }, deceased: true, gio: { d: 19, m: 11 },
        hometown: THANH_OAI, burial: 'Nghĩa trang xã Bình Minh, Thanh Oai',
        bio: 'Làm nghề mộc, đóng đồ cho cả làng. Bộ sập gụ cụ đóng vẫn còn ở nhà thờ.',
        spouseIds: ['d-u']
      }),
      person({
        id: 'd-u', treeId: 'ho-do', name: 'Vũ Thị U', gender: 'nu',
        birth: { y: 1932, cal: 'duong' }, death: { d: 4, m: 6, y: 2010, cal: 'am' }, deceased: true, gio: { d: 4, m: 6 },
        hometown: 'Huyện Chương Mỹ, Hà Nội', burial: 'Nghĩa trang xã Bình Minh, Thanh Oai',
        spouseIds: ['d-t']
      }),
      person({
        id: 'd-v', treeId: 'ho-do', name: 'Đỗ Văn V', gender: 'nam',
        birth: { y: 1956, cal: 'duong' }, hometown: THANH_OAI, residence: THANH_OAI,
        fatherId: 'd-t', motherId: 'd-u', spouseIds: ['d-x']
      }),
      person({
        id: 'd-x', treeId: 'ho-do', name: 'Hoàng Thị X', gender: 'nu',
        birth: { y: 1960, cal: 'duong' }, hometown: 'Huyện Ứng Hòa, Hà Nội', residence: THANH_OAI,
        spouseIds: ['d-v']
      }),
      person({
        id: 'd-k', treeId: 'ho-do', name: 'Đỗ Thị K', gender: 'nu',
        birth: { y: 1958, cal: 'duong' }, hometown: THANH_OAI, residence: 'Phường Dịch Vọng, Cầu Giấy, Hà Nội',
        bio: 'Lấy chồng họ Nguyễn ở Ý Yên, Nam Định (ông Nguyễn Văn H).',
        fatherId: 'd-t', motherId: 'd-u'
      }),
      person({
        id: 'd-y', treeId: 'ho-do', name: 'Đỗ Văn Y', gender: 'nam',
        birth: { y: 1985, cal: 'duong' }, hometown: THANH_OAI, residence: 'Quận Thanh Xuân, Hà Nội',
        fatherId: 'd-v', motherId: 'd-x'
      })
    ]
  };
})(window);
