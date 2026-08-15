#!/usr/bin/env python3
"""멀티 페이지 소스에서 원페이지 단일 HTML을 생성합니다.

assets/css/style.css 와 assets/js/main.js 를 읽어 tools/onepage.template.html 의
플레이스홀더 자리에 인라인으로 삽입합니다. 스타일이나 스크립트를 수정한 뒤
아래처럼 다시 실행하면 원페이지 파일이 갱신됩니다.

    python3 tools/build-onepage.py
"""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "tools" / "onepage.template.html"
OUTPUT = ROOT / "청년마음이음상담소-onepage.html"

EXTRA_CSS = """
/* ===========================================================
   원페이지 전용 추가 스타일
   =========================================================== */
.price { font-size: 1.3rem; color: var(--apricot-deep); }

.about-intro { align-items: center; gap: 56px; }

.promise-box {
  max-width: 820px;
  margin-inline: auto;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 12px 34px;
}

/* 현재 보고 있는 섹션 표시 */
.nav__link.is-current { color: var(--ink); background: var(--cream-deep); }

@media (max-width: 720px) {
  .promise-box { padding: 8px 22px; }
  .nav__link { font-size: 0.92rem; }
}
"""

EXTRA_JS = """
/* ===========================================================
   원페이지 전용 — 스크롤 위치에 따라 메뉴 활성화
   =========================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.nav__link[href^="#"]')
    );
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      map[id] = link;
      sections.push(section);
    });

    var visible = {};

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });

        // 화면에 걸친 섹션 중 문서 순서상 첫 번째를 현재 위치로 본다
        var current = null;
        for (var i = 0; i < sections.length; i++) {
          if (visible[sections[i].id]) { current = sections[i].id; break; }
        }

        links.forEach(function (link) { link.classList.remove("is-current"); });
        if (current && map[current]) map[current].classList.add("is-current");
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    sections.forEach(function (s) { io.observe(s); });
  });
})();
"""


def main() -> int:
    css = (ROOT / "assets/css/style.css").read_text(encoding="utf-8")
    js = (ROOT / "assets/js/main.js").read_text(encoding="utf-8")
    template = TEMPLATE.read_text(encoding="utf-8")

    # 인라인으로 넣는 내용에 종료 태그가 섞이면 문서가 깨진다
    if "</style>" in css or "</script>" in js:
        print("오류: CSS/JS 안에 인라인 종료 태그가 있습니다.", file=sys.stderr)
        return 1

    out = template.replace("/*__CSS__*/", css.strip() + "\n" + EXTRA_CSS.strip())
    out = out.replace("/*__JS__*/", js.strip() + "\n" + EXTRA_JS.strip())

    if "__CSS__" in out or "__JS__" in out:
        print("오류: 템플릿 플레이스홀더 치환에 실패했습니다.", file=sys.stderr)
        return 1

    OUTPUT.write_text(out, encoding="utf-8")
    print(f"생성 완료: {OUTPUT.name} ({len(out):,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
