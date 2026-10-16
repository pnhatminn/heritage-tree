/*
 * Âm lịch Việt Nam (múi giờ +7).
 * Thuật toán theo Hồ Ngọc Đức (https://www.informatik.uni-leipzig.de/~duc/amlich/).
 * Dùng cho: quy đổi ngày sinh/mất âm ⇄ dương, tính ngày giỗ hằng năm, tên năm can chi.
 */
(function (global) {
  'use strict';

  var TZ = 7;
  var PI = Math.PI;
  function INT(d) { return Math.floor(d); }

  function jdFromDate(dd, mm, yy) {
    var a = INT((14 - mm) / 12);
    var y = yy + 4800 - a;
    var m = mm + 12 * a - 3;
    var jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) {
      jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    }
    return jd;
  }

  function jdToDate(jd) {
    var a, b, c;
    if (jd > 2299160) {
      a = jd + 32044;
      b = INT((4 * a + 3) / 146097);
      c = a - INT((b * 146097) / 4);
    } else {
      b = 0;
      c = jd + 32082;
    }
    var d = INT((4 * c + 3) / 1461);
    var e = c - INT((1461 * d) / 4);
    var m = INT((5 * e + 2) / 153);
    var day = e - INT((153 * m + 2) / 5) + 1;
    var month = m + 3 - 12 * INT(m / 10);
    var year = b * 100 + d - 4800 + INT(m / 10);
    return [day, month, year];
  }

  function newMoon(k) {
    var T = k / 1236.85;
    var T2 = T * T;
    var T3 = T2 * T;
    var dr = PI / 180;
    var Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    var M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    var Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    var F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    var C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    var deltat;
    if (T < -11) {
      deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
    } else {
      deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    }
    return Jd1 + C1 - deltat;
  }

  function sunLongitude(jdn) {
    var T = (jdn - 2451545.0) / 36525;
    var T2 = T * T;
    var dr = PI / 180;
    var M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    var L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    var DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    var L = (L0 + DL) * dr;
    L = L - PI * 2 * INT(L / (PI * 2));
    return L;
  }

  function getSunLongitude(dayNumber, tz) {
    return INT(sunLongitude(dayNumber - 0.5 - tz / 24) / PI * 6);
  }

  function getNewMoonDay(k, tz) {
    return INT(newMoon(k) + 0.5 + tz / 24);
  }

  function getLunarMonth11(yy, tz) {
    var off = jdFromDate(31, 12, yy) - 2415021;
    var k = INT(off / 29.530588853);
    var nm = getNewMoonDay(k, tz);
    var sunLong = getSunLongitude(nm, tz);
    if (sunLong >= 9) nm = getNewMoonDay(k - 1, tz);
    return nm;
  }

  function getLeapMonthOffset(a11, tz) {
    var k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    var last = 0;
    var i = 1;
    var arc = getSunLongitude(getNewMoonDay(k + i, tz), tz);
    do {
      last = arc;
      i++;
      arc = getSunLongitude(getNewMoonDay(k + i, tz), tz);
    } while (arc !== last && i < 14);
    return i - 1;
  }

  /** Dương → Âm. Trả về {day, month, year, leap}. */
  function solarToLunar(dd, mm, yy) {
    var dayNumber = jdFromDate(dd, mm, yy);
    var k = INT((dayNumber - 2415021.076998695) / 29.530588853);
    var monthStart = getNewMoonDay(k + 1, TZ);
    if (monthStart > dayNumber) monthStart = getNewMoonDay(k, TZ);
    var a11 = getLunarMonth11(yy, TZ);
    var b11 = a11;
    var lunarYear;
    if (a11 >= monthStart) {
      lunarYear = yy;
      a11 = getLunarMonth11(yy - 1, TZ);
    } else {
      lunarYear = yy + 1;
      b11 = getLunarMonth11(yy + 1, TZ);
    }
    var lunarDay = dayNumber - monthStart + 1;
    var diff = INT((monthStart - a11) / 29);
    var lunarLeap = 0;
    var lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      var leapMonthDiff = getLeapMonthOffset(a11, TZ);
      if (diff >= leapMonthDiff) {
        lunarMonth = diff + 10;
        if (diff === leapMonthDiff) lunarLeap = 1;
      }
    }
    if (lunarMonth > 12) lunarMonth = lunarMonth - 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
    return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap === 1 };
  }

  /** Âm → Dương. Trả về {day, month, year} hoặc null nếu tháng nhuận không tồn tại. */
  function lunarToSolar(lunarDay, lunarMonth, lunarYear, leap) {
    var a11, b11;
    if (lunarMonth < 11) {
      a11 = getLunarMonth11(lunarYear - 1, TZ);
      b11 = getLunarMonth11(lunarYear, TZ);
    } else {
      a11 = getLunarMonth11(lunarYear, TZ);
      b11 = getLunarMonth11(lunarYear + 1, TZ);
    }
    var k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    var off = lunarMonth - 11;
    if (off < 0) off += 12;
    if (b11 - a11 > 365) {
      var leapOff = getLeapMonthOffset(a11, TZ);
      var leapMonth = leapOff - 2;
      if (leapMonth < 0) leapMonth += 12;
      if (leap && lunarMonth !== leapMonth) return null;
      else if (leap || off >= leapOff) off += 1;
    } else if (leap) {
      return null;
    }
    var monthStart = getNewMoonDay(k + off, TZ);
    var r = jdToDate(monthStart + lunarDay - 1);
    return { day: r[0], month: r[1], year: r[2] };
  }

  /**
   * Ngày giỗ (âm lịch d/m) rơi vào ngày dương nào trong năm âm lịch `lunarYear`.
   * Tháng thiếu (29 ngày) mà giỗ ngày 30 thì lùi về ngày 29.
   */
  function anniversaryInLunarYear(d, m, lunarYear) {
    var day = d;
    while (day > 0) {
      var s = lunarToSolar(day, m, lunarYear, false);
      if (s) {
        var back = solarToLunar(s.day, s.month, s.year);
        if (back.month === m && back.day === day && !back.leap) return s;
      }
      day -= 1;
    }
    return null;
  }

  function toDate(s) { return new Date(s.year, s.month - 1, s.day); }

  /** Lần giỗ kế tiếp tính từ `from` (Date). Trả về {date: Date, solar, lunarYear, daysLeft}. */
  function nextAnniversary(d, m, from) {
    var today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    var lunarToday = solarToLunar(today.getDate(), today.getMonth() + 1, today.getFullYear());
    for (var y = lunarToday.year - 1; y <= lunarToday.year + 1; y++) {
      var s = anniversaryInLunarYear(d, m, y);
      if (!s) continue;
      var dt = toDate(s);
      if (dt >= today) {
        return { date: dt, solar: s, lunarYear: y, daysLeft: Math.round((dt - today) / 86400000) };
      }
    }
    return null;
  }

  var CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

  function canChiYear(y) {
    return CAN[(y + 6) % 10] + ' ' + CHI[(y + 8) % 12];
  }

  var WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  global.Lunar = {
    solarToLunar: solarToLunar,
    lunarToSolar: lunarToSolar,
    anniversaryInLunarYear: anniversaryInLunarYear,
    nextAnniversary: nextAnniversary,
    canChiYear: canChiYear,
    weekday: function (date) { return WEEKDAYS[date.getDay()]; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
