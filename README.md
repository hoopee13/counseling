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
https://hoopee13.github.io/asdf/
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

## 실서비스 전 남은 작업

- [ ] **신청 폼을 백엔드에 연결** — 현재는 프론트 검증까지만 동작합니다.
      `assets/js/main.js`의 `initForm()` 안 주석 위치에 전송 코드를 넣으세요.
- [ ] 연락처·주소·상담사 정보를 실제 정보로 교체 (현재 `○○로 12`, `02-000-0000` 등 예시)
- [ ] 후기를 실제 동의받은 내용으로 교체 — 지금 문구는 예시입니다
- [ ] `privacy.html`의 개인정보처리방침을 실제 운영 기준으로 검토
      (개인정보를 수집하는 폼이 있으므로 법률 검토를 권합니다)
- [ ] 통계 수치(1,280+ / 94%)를 실제 데이터로 교체

> 본 사이트의 정보는 의료 행위나 진단을 대신하지 않습니다.
> 위급한 상황에는 자살예방상담전화 109 또는 정신건강위기상담 1577-0199로 연락해 주세요.
