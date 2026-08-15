/* ===========================================================
   청년마음이음상담소 — 공용 스크립트
   의존성 없음. 각 기능은 해당 요소가 있는 페이지에서만 동작한다.
   =========================================================== */
(function () {
  "use strict";

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* -----------------------------------------------------------
     헤더 · 모바일 메뉴
     ----------------------------------------------------------- */
  function initNav() {
    var nav = $(".nav");
    if (!nav) return;

    var toggle = $(".nav__toggle", nav);
    var menu = $(".nav__menu", nav);
    var scrim = $(".nav__scrim");

    /* 스크롤하면 헤더에 경계선을 준다 */
    var onScroll = function () {
      nav.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
      if (scrim) scrim.classList.toggle("is-open", open);
      /* 메뉴가 열린 동안 뒤 배경이 스크롤되지 않도록 */
      document.body.style.overflow = open ? "hidden" : "";
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    /* 메뉴 안 링크를 누르면 닫는다 */
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    if (scrim) scrim.addEventListener("click", function () { setOpen(false); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    /* 데스크톱 폭으로 넓어지면 열린 상태를 정리한다 */
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) setOpen(false);
    });
  }

  /* -----------------------------------------------------------
     FAQ 아코디언
     높이 전환은 CSS(grid-template-rows)가 담당하고
     여기서는 상태와 접근성 속성만 관리한다.
     ----------------------------------------------------------- */
  function initFaq() {
    var items = $$(".faq__item");
    if (!items.length) return;

    items.forEach(function (item, i) {
      var btn = $(".faq__q", item);
      var panel = $(".faq__a", item);
      if (!btn || !panel) return;

      var panelId = panel.id || "faq-panel-" + (i + 1);
      panel.id = panelId;
      btn.setAttribute("aria-controls", panelId);
      btn.setAttribute("aria-expanded", "false");

      btn.addEventListener("click", function () {
        var willOpen = !item.classList.contains("is-open");

        /* 한 번에 하나만 열리도록 나머지를 닫는다 */
        items.forEach(function (other) {
          other.classList.remove("is-open");
          var otherBtn = $(".faq__q", other);
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        });

        if (willOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* -----------------------------------------------------------
     스크롤 등장 애니메이션
     ----------------------------------------------------------- */
  function initReveal() {
    var targets = $$(".reveal");
    if (!targets.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = Number(el.dataset.delay || 0);
        window.setTimeout(function () { el.classList.add("is-in"); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* -----------------------------------------------------------
     숫자 카운트업
     ----------------------------------------------------------- */
  function initCounters() {
    var counters = $$("[data-count]");
    if (!counters.length) return;

    function paint(el, value) {
      el.textContent = value.toLocaleString("ko-KR") + (el.dataset.suffix || "");
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) { paint(el, Number(el.dataset.count)); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = Number(el.dataset.count);
        var started = null;
        var duration = 1300;

        function tick(now) {
          if (started === null) started = now;
          var p = Math.min((now - started) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);   /* ease-out cubic */
          paint(el, Math.round(target * eased));
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { io.observe(el); });
  }

  /* -----------------------------------------------------------
     프로그램 추천 진단
     3개의 질문에 답하면 점수가 가장 높은 프로그램을 추천한다.
     ----------------------------------------------------------- */
  var QUIZ = {
    questions: [
      {
        q: "요즘 하루를 마칠 때, 가장 가까운 마음은 어느 쪽인가요?",
        options: [
          { label: "완전히 방전돼서 아무것도 못 하겠어요", score: "burnout" },
          { label: "이 길이 맞나 계속 의심이 들어요", score: "career" },
          { label: "나를 어떻게 설명해야 할지 모르겠어요", score: "branding" },
          { label: "이유 없이 마음이 자주 가라앉아요", score: "self" }
        ]
      },
      {
        q: "지금 가장 자주 떠올리는 문장은 무엇에 가깝나요?",
        options: [
          { label: "“조금만 쉬고 싶다”", score: "burnout" },
          { label: "“이직해야 할까, 버텨야 할까”", score: "career" },
          { label: "“면접이나 소개 자리가 늘 어렵다”", score: "branding" },
          { label: "“남들과 비교하다 하루가 간다”", score: "self" }
        ]
      },
      {
        q: "어떤 방식이 더 편하게 느껴지나요?",
        options: [
          { label: "혼자 차분히, 1:1로 깊게", score: "burnout", also: "career" },
          { label: "계획과 실행 중심으로 구체적으로", score: "career" },
          { label: "피드백을 주고받는 소그룹으로", score: "branding" },
          { label: "비슷한 또래와 이야기 나누며", score: "self" }
        ]
      }
    ],
    results: {
      burnout: {
        tone: "apricot",
        icon: "flame",
        name: "쉼표 프로젝트",
        tagline: "번아웃 회복 · 4주 코스",
        desc: "에너지가 어디서 새는지 먼저 찾아요. 쉬는 법부터 다시 배우고, 무너지지 않는 나만의 리듬을 세웁니다.",
        href: "programs.html#burnout"
      },
      career: {
        tone: "sage",
        icon: "compass",
        name: "방향 찾기 세션",
        tagline: "취업·진로 · 5주 코스",
        desc: "스펙을 더 쌓기 전에 기준부터 세워요. 강점과 가치를 정리해 현실적인 진로 가설과 90일 계획을 만듭니다.",
        href: "programs.html#career"
      },
      branding: {
        tone: "butter",
        icon: "sparkle",
        name: "나다움 브랜딩 랩",
        tagline: "퍼스널 브랜딩 · 6주 소그룹",
        desc: "잘 보이는 법이 아니라 잘 설명하는 법. 흩어진 경험을 한 문장으로 묶고 이력서·포트폴리오까지 연결해요.",
        href: "programs.html#branding"
      },
      self: {
        tone: "lilac",
        icon: "leaf",
        name: "마음 이음 서클",
        tagline: "자기 이해 · 8주 그룹",
        desc: "비슷한 고민을 가진 또래와 안전하게 나눠요. 감정과 관계 패턴을 살피며 나를 설명할 언어를 늘립니다.",
        href: "programs.html#self"
      }
    }
  };

  function initQuiz() {
    var root = $("#quiz");
    if (!root) return;

    var step = 0;
    var scores = { burnout: 0, career: 0, branding: 0, self: 0 };
    var total = QUIZ.questions.length;

    function icon(name, cls) {
      return '<svg class="ico ' + (cls || "") + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
    }

    function progress(n) {
      return '<div class="quiz__bar"><span style="width:' + Math.round((n / total) * 100) + '%"></span></div>';
    }

    function renderQuestion() {
      var item = QUIZ.questions[step];
      var html = progress(step);
      html += '<p class="quiz__count">STEP ' + (step + 1) + " / " + total + "</p>";
      html += '<h3 class="quiz__q">' + item.q + "</h3>";
      html += '<div class="quiz__options">';
      item.options.forEach(function (opt, i) {
        html += '<button class="quiz__option" type="button" data-i="' + i + '">' +
          "<span>" + opt.label + "</span>" + icon("arrow-right") + "</button>";
      });
      html += "</div>";
      if (step > 0) {
        html += '<div class="quiz__foot"><button class="quiz__back" type="button" data-back>이전 질문으로</button></div>';
      }
      root.innerHTML = html;
      /* 화면 낭독기 사용자를 위해 바뀐 질문을 알린다 */
      root.setAttribute("aria-busy", "false");
    }

    function renderResult() {
      var best = "burnout";
      Object.keys(scores).forEach(function (key) {
        if (scores[key] > scores[best]) best = key;
      });
      var r = QUIZ.results[best];

      root.innerHTML = progress(total) +
        '<div class="quiz__result">' +
          '<p class="quiz__count">추천 프로그램</p>' +
          '<div class="icon-badge icon-badge--' + r.tone + '">' + icon(r.icon) + "</div>" +
          '<h3 class="quiz__q" style="margin-top:0">' + r.name + "</h3>" +
          '<p class="tag tag--' + r.tone + '">' + r.tagline + "</p>" +
          '<p class="section-desc" style="margin-top:16px">' + r.desc + "</p>" +
          '<div class="quiz__foot">' +
            '<a class="btn btn--primary" href="apply.html">이 주제로 상담 신청하기</a>' +
            '<a class="btn btn--ghost" href="' + r.href + '">프로그램 자세히 보기</a>' +
          "</div>" +
          '<div class="quiz__foot"><button class="quiz__back" type="button" data-restart>다시 해볼래요</button></div>' +
        "</div>";
    }

    root.addEventListener("click", function (e) {
      var option = e.target.closest(".quiz__option");
      if (option) {
        var opt = QUIZ.questions[step].options[Number(option.dataset.i)];
        scores[opt.score] += 2;
        if (opt.also) scores[opt.also] += 1;
        step += 1;
        if (step >= total) renderResult();
        else renderQuestion();
        return;
      }

      if (e.target.closest("[data-back]")) {
        /* 점수를 정확히 되돌리기 어려우므로 처음부터 다시 시작한다 */
        step = 0;
        scores = { burnout: 0, career: 0, branding: 0, self: 0 };
        renderQuestion();
        return;
      }

      if (e.target.closest("[data-restart]")) {
        step = 0;
        scores = { burnout: 0, career: 0, branding: 0, self: 0 };
        renderQuestion();
      }
    });

    renderQuestion();
  }

  /* -----------------------------------------------------------
     상담 신청 폼
     ----------------------------------------------------------- */
  function initForm() {
    var form = $("#apply-form");
    if (!form) return;

    var status = $("#form-status");

    function fieldOf(el) { return el ? el.closest(".field") : null; }

    function setError(el, message) {
      var field = fieldOf(el);
      if (!field) return;
      field.classList.add("has-error");
      var box = $(".field__error", field);
      if (box) {
        var text = $("[data-msg]", box);
        if (text) text.textContent = message;
      }
      if (el.setAttribute) el.setAttribute("aria-invalid", "true");
    }

    function clearError(el) {
      var field = fieldOf(el);
      if (!field) return;
      field.classList.remove("has-error");
      if (el.removeAttribute) el.removeAttribute("aria-invalid");
    }

    /* 입력을 고치기 시작하면 오류 표시를 지운다 */
    $$(".input, .select, .textarea", form).forEach(function (el) {
      el.addEventListener("input", function () { clearError(el); });
      el.addEventListener("change", function () { clearError(el); });
    });
    $$('input[name="topic"], input[name="privacy"]', form).forEach(function (el) {
      el.addEventListener("change", function () { clearError(el); });
    });

    function showStatus(message) {
      if (!status) return;
      status.classList.add("is-visible");
      var text = $("[data-msg]", status);
      if (text) text.textContent = message;
      else status.textContent = message;
    }

    function hideStatus() {
      if (status) status.classList.remove("is-visible");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideStatus();

      var data = new FormData(form);

      /* 사람이 채우지 않는 숨은 칸 — 채워져 있으면 자동 제출로 본다 */
      if ((data.get("website") || "").toString().trim() !== "") return;

      var name = (data.get("name") || "").toString().trim();
      var contact = (data.get("contact") || "").toString().trim();
      var topics = data.getAll("topic");
      var agreed = data.get("privacy");

      var problems = [];

      if (!name) {
        setError($("#name", form), "이름 또는 닉네임을 입력해 주세요.");
        problems.push($("#name", form));
      }

      if (!contact) {
        setError($("#contact", form), "연락 받을 이메일이나 휴대폰 번호를 남겨 주세요.");
        problems.push($("#contact", form));
      } else {
        var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact);
        var isPhone = /^[0-9][0-9\s-]{7,}$/.test(contact);
        if (!isEmail && !isPhone) {
          setError($("#contact", form), "이메일 형식이거나 숫자로 된 연락처를 입력해 주세요.");
          problems.push($("#contact", form));
        }
      }

      if (!topics.length) {
        var topicInput = $('input[name="topic"]', form);
        setError(topicInput, "관심 있는 주제를 하나 이상 골라 주세요.");
        problems.push(topicInput);
      }

      if (!agreed) {
        var privacyInput = $('input[name="privacy"]', form);
        setError(privacyInput, "개인정보 수집·이용에 동의해 주셔야 신청할 수 있어요.");
        problems.push(privacyInput);
      }

      if (problems.length) {
        showStatus("입력하지 않은 항목이 " + problems.length + "개 있어요. 표시된 곳을 확인해 주세요.");
        var first = problems[0];
        var target = fieldOf(first) || first;
        if (target && target.scrollIntoView) {
          target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        }
        if (first && first.focus) {
          window.setTimeout(function () { first.focus({ preventScroll: true }); }, 250);
        }
        return;
      }

      /* --- 여기까지 통과하면 유효한 신청 ---
         실제 서비스에서는 이 지점에서 서버나 폼 서비스로 전송하세요.
         예) fetch("/api/apply", { method: "POST", body: data })  */
      var card = form.closest(".form-card") || form.parentNode;
      card.innerHTML =
        '<div class="form-done">' +
          '<div class="icon-badge"><svg class="ico" aria-hidden="true"><use href="#i-check"></use></svg></div>' +
          "<h3>" + escapeHtml(name) + "님, 신청이 접수되었어요</h3>" +
          "<p>영업일 기준 <b>1일 이내</b>에 남겨주신 연락처로 첫 상담 안내를 보내드릴게요.<br />" +
          "그때까지 아무것도 준비하지 않으셔도 괜찮습니다.</p>" +
          '<a class="btn btn--ghost" href="index.html">홈으로 돌아가기</a>' +
        "</div>";
      card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* -----------------------------------------------------------
     푸터 연도
     ----------------------------------------------------------- */
  function initYear() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initFaq();
    initReveal();
    initCounters();
    initQuiz();
    initForm();
    initYear();
  });
})();
