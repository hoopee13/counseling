/**
 * 청년마음이음상담소 — 상담 신청 접수 백엔드
 * ---------------------------------------------------------------
 * 서버 없이 무료로 운영할 수 있는 방법입니다.
 * 신청이 들어오면 구글 시트에 한 줄씩 쌓이고, 담당자에게 메일이 갑니다.
 *
 * [설치 방법]
 *  1. 구글 시트를 새로 만듭니다. (예: "상담 신청 접수")
 *  2. 상단 메뉴 → 확장 프로그램 → Apps Script 를 엽니다.
 *  3. 기본 코드를 지우고 이 파일 내용을 통째로 붙여넣습니다.
 *  4. 아래 NOTIFY_EMAIL 을 실제 담당자 메일로 바꿉니다.
 *  5. 오른쪽 위 "배포" → "새 배포" → 유형에서 "웹 앱" 선택
 *       - 실행 계정: 나
 *       - 액세스 권한: 모든 사용자   ← 반드시 이 값이어야 합니다
 *  6. 배포 후 나오는 웹 앱 URL(.../exec 로 끝남)을 복사합니다.
 *  7. assets/js/main.js 의 FORM_CONFIG 를 아래처럼 채웁니다.
 *
 *       endpoint: "복사한 웹 앱 URL",
 *       format:   "formdata"      ← Apps Script 는 반드시 formdata
 *
 * [주의]
 *  · 코드를 수정하면 반드시 "새 배포"를 다시 해야 반영됩니다.
 *  · 신청서에는 개인정보가 담기므로 시트 공유 범위를 최소로 유지하세요.
 */

/** 접수 알림을 받을 메일 주소 — 실제 담당자 주소로 바꾸세요 */
var NOTIFY_EMAIL = 'hello@maeum-eum.kr';

/**
 * 신청 내용을 저장할 스프레드시트 ID.
 * 시트 주소에서 /d/ 와 /edit 사이에 있는 값입니다.
 *   https://docs.google.com/spreadsheets/d/[여기가 ID]/edit
 *
 * 시트 메뉴의 확장 프로그램 → Apps Script 로 만든 경우에는
 * 빈 값('')으로 두어도 현재 시트에 자동으로 기록됩니다.
 */
var SPREADSHEET_ID = '1_L20HorVydpcA363ak9svaX4prHR6hblPgOSewXp0TQ';

/** 신청 내용이 쌓일 탭 이름 (없으면 자동으로 만듭니다) */
var SHEET_NAME = '상담신청';

/** 시트에 기록할 항목 순서 — 웹사이트가 보내는 항목명과 같아야 합니다 */
var COLUMNS = [
  '신청 시각',
  '이름/닉네임',
  '연락처',
  '연령대',
  '현재 상황',
  '관심 주제',
  '상담 방식',
  '편한 시간대',
  '하고 싶은 이야기',
  '청년 할인 안내',
  '개인정보 동의'
];

function doPost(e) {
  try {
    var data = (e && e.parameter) ? e.parameter : {};

    // 이름과 연락처가 없으면 정상적인 신청으로 보지 않는다
    if (!data['이름/닉네임'] || !data['연락처']) {
      return json({ ok: false, error: '필수 항목이 비어 있습니다.' });
    }

    appendRow_(data);
    notify_(data);

    return json({ ok: true });
  } catch (err) {
    // 실패해도 신청 내용이 사라지지 않도록 로그를 남긴다
    console.error(err);
    return json({ ok: false, error: String(err) });
  }
}

/** 배포가 살아 있는지 브라우저에서 확인할 때 사용합니다 */
function doGet() {
  return json({ ok: true, message: '청년마음이음상담소 신청 접수 서버가 동작 중입니다.' });
}

function appendRow_(data) {
  var sheet = getSheet_();
  var row = COLUMNS.map(function (name) {
    if (name === '신청 시각') {
      // 브라우저가 보낸 시각이 없으면 서버 시각을 쓴다
      return data[name] || new Date().toLocaleString('ko-KR');
    }
    return data[name] || '';
  });
  sheet.appendRow(row);
}

function getSheet_() {
  // ID 를 지정했으면 그 시트에, 아니면 스크립트가 붙어 있는 시트에 기록한다
  var book = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!book) {
    throw new Error('스프레드시트를 열 수 없습니다. SPREADSHEET_ID 를 확인하세요.');
  }

  var sheet = book.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
  }

  // 첫 줄이 비어 있으면 머리글을 만들고 고정한다
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    var header = sheet.getRange(1, 1, 1, COLUMNS.length);
    header.setFontWeight('bold').setBackground('#FFE7DA');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(COLUMNS.indexOf('하고 싶은 이야기') + 1, 420);
  }

  return sheet;
}

function notify_(data) {
  if (!NOTIFY_EMAIL) return;

  var lines = COLUMNS.map(function (name) {
    return name + ': ' + (data[name] || '-');
  });

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: '[상담 신청] ' + data['이름/닉네임'] + ' 님',
    body: [
      '새 상담 신청이 접수되었습니다.',
      '',
      lines.join('\n'),
      '',
      '— 청년마음이음상담소 신청 폼'
    ].join('\n')
  });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 배포 전 점검용.
 * Apps Script 편집기 위쪽에서 함수 목록을 testWrite 로 고르고 실행하면
 * 시트에 예시 한 줄이 기록되고 알림 메일이 갑니다.
 * (처음 실행할 때 구글 권한 승인 창이 뜹니다. 승인해야 배포 후에도 동작합니다.)
 *
 * 확인이 끝나면 시트에서 그 줄을 지우면 됩니다.
 */
function testWrite() {
  var sample = {
    '이름/닉네임': '테스트',
    '연락처': 'test@example.com',
    '연령대': '만 27-30세',
    '현재 상황': '직장인 1-3년 차',
    '관심 주제': '번아웃 회복',
    '상담 방식': '화상',
    '편한 시간대': '평일 저녁',
    '하고 싶은 이야기': '설치가 잘 되었는지 확인하는 예시 줄입니다.',
    '청년 할인 안내': '해당 없음',
    '개인정보 동의': '동의',
    '신청 시각': new Date().toLocaleString('ko-KR')
  };

  appendRow_(sample);
  notify_(sample);

  Logger.log('시트 기록과 메일 발송을 마쳤습니다. 시트와 메일함을 확인하세요.');
}
