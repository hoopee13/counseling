# 🌱 청년마음이음상담소

20·30 청년을 위한 **성장 중심 상담소** 웹사이트입니다.
정신질환 치료가 아니라 번아웃, 취업·진로, 퍼스널 브랜딩, 자기 이해처럼
&ldquo;아프지는 않지만 방향이 흐릿한&rdquo; 시기를 함께 정리하는 곳으로 기획했습니다.

빌드 도구도 의존성도 없는 정적 사이트입니다. 파일을 그대로 올리면 동작합니다.

---

## 사이트 보기

### 1. 로컬에서 바로

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

`index.html`을 더블클릭해 `file://`로 열어도 동작합니다.

### 2. GitHub Pages로 공개하기

이 저장소에 이미 배포 가능한 형태로 들어 있습니다. 아래만 한 번 설정하면 됩니다.

1. GitHub 저장소 → **Settings** → 왼쪽 메뉴 **Pages**
2. **Source** → `Deploy from a branch`
3. **Branch** → `claude/youth-counseling-site-wlf0pw` / `(root)` 선택 후 **Save**
4. 1-2분 뒤 아래 주소로 접속

```
https://hoopee13.github.io/counseling/
```

`sitemap.xml`, `robots.txt`, 각 페이지의 `canonical`·`og:image` 주소가
모두 이 URL 기준으로 맞춰져 있습니다. 다른 도메인을 쓰신다면 그 값들만 바꿔주세요.

---

## 페이지 구성

| 파일 | 내용 |
| --- | --- |
| `index.html` | 히어로, 고민 체크리스트, **프로그램 추천 진단**, 프로그램 4종, 진행 4단계, 후기, FAQ |
| `programs.html` | 프로그램별 주차 커리큘럼, 단회 세션, 이용료, 환불 규정 |
| `about.html` | 상담소 이야기, 네 가지 약속, 상담사 소개, 오시는 길 |
| `apply.html` | 무료 첫 상담 신청 폼 (인라인 검증 + 완료 화면) |
| `privacy.html` | 개인정보처리방침 |
| `404.html` | 없는 페이지 안내 |

## 파일 구조

```
index.html  programs.html  about.html  apply.html  privacy.html  404.html
robots.txt  sitemap.xml
assets/
  css/style.css   — 디자인 토큰과 컴포넌트 (14개 섹션으로 정리)
  js/main.js      — 내비게이션, FAQ, 스크롤 등장, 카운트업, 추천 진단, 폼
  img/favicon.svg — 파비콘
  img/og-image.png— 공유 미리보기 이미지 (1200×630)
```

각 HTML 상단에는 아이콘 SVG 스프라이트가 인라인되어 있습니다.
외부 파일 참조 없이 `file://`에서도 아이콘이 깨지지 않게 하기 위해서입니다.

---

## 디자인

**컨셉** — 크림·살구·버터 톤의 따뜻한 색조. 병원의 파랑·회색을 완전히 배제했습니다.

**핵심 메시지** — &ldquo;아프지 않아도 괜찮아요. 잘 살고 싶어서 오는 곳이니까요.&rdquo;
치료 상담소와 선을 긋는 것이 이 타깃에서 가장 큰 진입 장벽이라 보고,
첫 화면과 FAQ 첫 문항에 모두 배치했습니다.

색상과 간격은 `style.css` 상단 `:root` 토큰만 바꾸면 전체에 반영됩니다.

```css
--apricot: #ff7a45;   /* 메인 포인트 */
--sage:    #5f9b7e;   /* 보조 · 안정감 */
--butter:  #ffc24d;   /* 강조 · 밝음 */
--lilac:   #9c8cd4;   /* 보조 · 부드러움 */
```

폰트는 [Pretendard](https://github.com/orioncactus/pretendard)를 CDN으로 불러오며,
네트워크가 없으면 시스템 폰트로 자동 대체됩니다.

## 접근성 · 품질

- 스킵 링크, `aria-current`, `aria-expanded`, `aria-live`, 스크린리더 전용 텍스트
- 모바일 메뉴: Esc로 닫기, 배경 스크롤 잠금, 스크림 클릭으로 닫기
- 폼: 항목별 인라인 오류 메시지, `aria-invalid`, 첫 오류로 포커스 이동
- `prefers-reduced-motion` 존중 (애니메이션·부드러운 스크롤 비활성화)
- 인쇄 스타일시트 포함
- 반응형 1000px / 760px 브레이크포인트
- SEO: 페이지별 `canonical`·OG 태그, JSON-LD(ProfessionalService), `sitemap.xml`, `robots.txt`

---

## 신청 폼 백엔드 연결

정적 사이트라 서버가 없으므로, **신청서를 받아줄 주소 하나만 지정**하면 전송이 켜집니다.
설정은 `assets/js/main.js` 맨 위 `FORM_CONFIG` 한 곳뿐입니다.

```js
var FORM_CONFIG = {
  endpoint: "",          // 여기에 주소를 넣으면 전송이 켜집니다
  format: "json",        // "json" 또는 "formdata"
  accessKey: "",         // Web3Forms 를 쓸 때만
  timeout: 15000
};
```

`endpoint`가 비어 있으면 **미리보기 모드**입니다. 전송하지 않고 완료 화면만 보여주며,
개발자 콘솔에 안내 경고가 찍힙니다. 그래서 지금 상태로도 사이트는 정상 동작합니다.

### 선택지 비교

| 방법 | 비용 | 데이터가 쌓이는 곳 | `format` |
| --- | --- | --- | --- |
| **Google Apps Script** | 무료 | 내 구글 시트 + 메일 알림 | `"form"` |
| **Formspree** | 무료 50건/월 | 메일 + 대시보드 | `"json"` |
| **Web3Forms** | 무료 250건/월 | 메일 | `"json"` |
| **직접 만든 API** | 서버 비용 | 내 DB | `"json"` |

개인정보가 담긴 신청서라 데이터를 직접 보유하고 싶다면 **Apps Script**를 권합니다.
가장 빨리 붙이려면 Formspree가 편합니다.

### 1. Google Apps Script (무료, 데이터 직접 보유)

`backend/google-apps-script.gs` 의 `SPREADSHEET_ID` 는 이미
운영용 시트 ID(`1_L20Hor…Xp0TQ`)로 채워져 있습니다. 다른 시트를 쓰려면
그 시트 주소의 `/d/` 와 `/edit` 사이 값으로 바꾸세요.

1. 해당 구글 시트 → 상단 메뉴 **확장 프로그램 → Apps Script**
2. 기본 코드를 지우고 `backend/google-apps-script.gs` 내용을 통째로 붙여넣기
3. `NOTIFY_EMAIL` 을 실제 담당자 메일로 수정 후 저장
4. **배포 전 점검** — 편집기 위쪽 함수 목록에서 `testWrite` 를 골라 실행
   - 처음 실행하면 구글 권한 승인 창이 뜹니다. 승인해야 이후에도 동작합니다.
   - 시트에 예시 한 줄이 생기고 알림 메일이 오면 정상입니다. 확인 후 그 줄은 지우세요.
5. **배포 → 새 배포 → 유형 `웹 앱`** — 순서가 중요합니다
   - **다음 사용자 인증 정보로 실행: `나`** ← 이걸 먼저 바꿔야
   - **액세스 권한이 있는 사용자: `모든 사용자`** ← 이 선택지가 나타납니다

   > 실행 계정을 `웹 앱을 액세스하는 사용자`로 두면 액세스 권한 목록에
   > `모든 사용자`가 아예 표시되지 않고 `Google 계정이 있는 모든 사용자`까지만
   > 고를 수 있습니다. 그 상태로 배포하면 방문자가 로그인 화면으로 밀려나
   > 사이트에서 &ldquo;전송에 실패했어요&rdquo;가 뜹니다.
   >
   > `나`로 두어도 시트가 공개되지는 않습니다. 방문자 대신 스크립트가
   > 내 권한으로 기록할 뿐입니다.
6. 나온 `.../exec` 주소를 아래처럼 설정

```js
endpoint: "https://script.google.com/macros/s/AKfy.../exec",
format:   "form"            // Apps Script 는 반드시 form
```

> **Apps Script 에는 `"form"` 만 쓰세요.** 나머지 두 형식은 이렇게 실패합니다.
>
> - `"json"` — 브라우저가 먼저 OPTIONS 를 보내는데 Apps Script 가 처리하지 못해
>   전송 자체가 실패합니다.
> - `"formdata"` — 전송은 되지만 Apps Script 가 `e.parameter` 로 풀어주지 않아
>   서버가 빈 값을 받습니다. **화면에는 접수된 것처럼 보이는데 시트에는 아무것도
>   남지 않습니다.** 실제로 겪고 고친 문제입니다.
>
> `"form"`(`application/x-www-form-urlencoded`) 은 사전 확인 요청도 없고
> `e.parameter` 로도 정상적으로 들어옵니다.

코드를 수정했다면 **반드시 &lsquo;새 배포&rsquo;를 다시** 해야 반영됩니다.
기존 배포를 수정하면 주소가 유지되고, 새로 만들면 주소가 바뀌므로
`FORM_CONFIG.endpoint` 도 함께 갱신해야 합니다.

### 2. Formspree

[formspree.io](https://formspree.io)에서 폼을 만들면 `https://formspree.io/f/xxxxxxxx` 주소가 나옵니다.

```js
endpoint: "https://formspree.io/f/xxxxxxxx",
format:   "json"
```

메일 제목(`_subject`)과 회신 주소(`_replyto`)를 자동으로 함께 보내므로,
받은 메일에서 바로 답장하면 신청자에게 갑니다.

### 3. Web3Forms

[web3forms.com](https://web3forms.com)에서 받은 액세스 키를 넣습니다.

```js
endpoint:  "https://api.web3forms.com/submit",
format:    "json",
accessKey: "발급받은-키"
```

### 4. 직접 만든 API

`format: "json"`으로 두고 `endpoint`만 바꾸면 됩니다.
서버에서 **CORS 허용**(`Access-Control-Allow-Origin`)만 열어주세요.
전송되는 본문은 아래 형태입니다.

```json
{
  "이름/닉네임": "노을",
  "연락처": "test@example.com",
  "연령대": "만 27-30세",
  "현재 상황": "직장인 1-3년 차",
  "관심 주제": "번아웃 회복, 자기 이해",
  "상담 방식": "화상",
  "편한 시간대": "평일 저녁",
  "하고 싶은 이야기": "요즘 너무 지쳐요.",
  "청년 할인 안내": "희망",
  "개인정보 동의": "동의",
  "신청 시각": "2026. 8. 15. 오전 10:41:21",
  "_subject": "[상담 신청] 노을 님",
  "_replyto": "test@example.com"
}
```

### 전송 중·실패 시 동작

- 전송 중에는 버튼이 비활성화되고 스피너와 함께 &ldquo;보내는 중…&rdquo;으로 바뀝니다.
- 실패하면 입력 내용을 그대로 둔 채 오류 메시지를 보여주고 버튼을 되돌립니다.
  신청자가 다시 누르거나 메일로 보낼 수 있게 안내 문구가 나옵니다.
- 15초 안에 응답이 없으면 요청을 중단하고 같은 방식으로 안내합니다.
- 실패 문구 아래에 원인이 함께 표시됩니다 (`원인: 서버 응답 401` 등).
- **HTTP 200 이 와도 응답 본문을 확인합니다.** 서버가 `{"ok":false}` 를 돌려주면
  저장되지 않은 것으로 보고 실패로 처리합니다. 저장되지 않았는데 접수 화면이
  뜨는 일을 막기 위해서입니다.

---

## 실서비스 전 남은 작업

- [ ] **`FORM_CONFIG.endpoint` 설정** — 위 안내대로 주소를 넣어야 신청이 실제로 전달됩니다
- [ ] 연락처·주소·상담사 정보를 실제 정보로 교체 (현재 `○○로 12`, `02-000-0000` 등 예시)
- [ ] 후기를 실제 동의받은 내용으로 교체 — 지금 문구는 예시입니다
- [ ] `privacy.html`의 개인정보처리방침을 실제 운영 기준으로 검토
      (개인정보를 수집하는 폼이 있으므로 법률 검토를 권합니다)
- [ ] 통계 수치(1,280+ / 94%)를 실제 데이터로 교체

> 본 사이트의 정보는 의료 행위나 진단을 대신하지 않습니다.
> 위급한 상황에는 자살예방상담전화 109 또는 정신건강위기상담 1577-0199로 연락해 주세요.
