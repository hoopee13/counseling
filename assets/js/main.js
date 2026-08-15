/* ===========================================================
   청년마음이음상담소 — 공용 스크립트
   =========================================================== */
(function () {
  "use strict";

  /* ---------- 모바일 네비게이션 ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav__toggle");
    var menu = document.querySelector(".nav__menu");
    var nav = document.querySelector(".nav");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });

      // 메뉴 항목 클릭 시 닫기
      menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    if (nav) {
      var onScroll = function () {
        nav.classList.toggle("is-stuck", window.scrollY > 8);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---------- FAQ 아코디언 ---------- */
  function initFaq() {
    var items = document.querySelectorAll(".faq__item");

    items.forEach(function (item) {
      var btn = item.querySelector(".faq__q");
      var panel = item.querySelector(".faq__a");
      if (!btn || !panel) return;

      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");

        // 다른 항목 닫기 (한 번에 하나만 열림)
        items.forEach(function (other) {
          other.classList.remove("is-open");
          var otherBtn = other.querySelector(".faq__q");
          var otherPanel = other.querySelector(".faq__a");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
          if (otherPanel) otherPanel.style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    });
  }

  /* ---------- 스크롤 등장 애니메이션 ---------- */
  function initReveal() {
    var targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = Number(el.dataset.delay || 0);
          setTimeout(function () { el.classList.add("is-in"); }, delay);
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 숫자 카운트업 ---------- */
  function initCounters() {
    var counters = document.querySelectorAll("[data-count]");
    if (!counters.length || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = Number(el.dataset.count);
          var suffix = el.dataset.suffix || "";
          var start = performance.now();
          var dur = 1200;

          function tick(now) {
            var p = Math.min((now - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased).toLocaleString("ko-KR") + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 신청 폼 ---------- */
  function initForm() {
    var form = document.querySelector("#apply-form");
    if (!form) return;

    var status = document.querySelector("#form-status");

    function show(type, message) {
      if (!status) return;
      status.className = "form-status is-visible form-status--" + type;
      status.textContent = message;
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var contact = (data.get("contact") || "").toString().trim();
      var topics = data.getAll("topic");
      var agreed = data.get("privacy");

      if (!name) return show("err", "이름(또는 닉네임)을 입력해 주세요.");
      if (!contact) return show("err", "연락 받을 이메일이나 휴대폰 번호를 남겨 주세요.");
      if (!topics.length) return show("err", "관심 있는 주제를 하나 이상 선택해 주세요.");
      if (!agreed) return show("err", "개인정보 수집·이용에 동의해 주셔야 신청이 가능해요.");

      // 데모용: 실제 서비스에서는 이 지점에서 서버로 전송합니다.
      show(
        "ok",
        name + "님, 신청이 접수되었어요! 영업일 기준 1일 이내에 남겨주신 연락처로 첫 상담 안내를 보내드릴게요."
      );
      form.reset();
    });
  }

  /* ---------- 현재 연도 ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initFaq();
    initReveal();
    initCounters();
    initForm();
    initYear();
  });
})();
