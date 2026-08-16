/* ===========================================================
   청년마음이음상담소 — 공용 스크립트
   의존성 없음. 각 기능은 해당 요소가 있는 페이지에서만 동작한다.
   =========================================================== */
(function () {
  "use strict";

  /* ===========================================================
     상담 신청 폼 전송 설정
     -----------------------------------------------------------
     endpoint 에 신청서를 받을 주소를 넣으면 전송이 켜집니다.
     비워 두면 전송 없이 완료 화면만 보여주는 미리보기 모드로 동작합니다.

     · Formspree      https://formspree.io/f/xxxxxxxx      → format: "json"
     · Web3Forms      https://api.web3forms.com/submit     → format: "json" (accessKey 필요)
     · Google Apps Script  .../exec                        → format: "form"
     · 직접 만든 API  https://api.내도메인.kr/apply         → format: "json"

     Apps Script 에는 반드시 "form" 을 쓰세요.
     · "json" 은 브라우저가 먼저 OPTIONS 를 보내는데 Apps Script 가 이를 처리하지 못합니다.
     · "formdata"(multipart) 는 전송은 되지만 Apps Script 가 e.parameter 로 풀어주지
       않아 서버가 빈 값을 받습니다. 겉으로는 접수된 것처럼 보이고 시트에는 아무것도
       기록되지 않습니다.
     · "form"(application/x-www-form-urlencoded) 은 사전 확인 요청도 없고
       e.parameter 로도 정상적으로 들어옵니다.

     설정 방법은 README 의 &lsquo;신청 폼 백엔드 연결&rsquo; 항목을 참고하세요.
     =========================================================== */
  var FORM_CONFIG = {
    endpoint: "https://script.google.com/macros/s/AKfycbyE1J-K2fbtI5pzVUnKKJO12eKQwl3ACCDAnHkU_C9vycab2bcLi_a8GVuxUKGvMAup/exec",
    format: "form",        // "form"(권장) | "json" | "formdata"
    accessKey: "",         // Web3Forms 를 쓸 때만 입력
    timeout: 15000         // 응답 대기 시간(ms)
  };

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
        q: "요즘 가장 바라는 것은 무엇에 가깝나요?",
        options: [
          { label: "잘 쉬고 나답게 회복하는 것", score: "burnout" },
          { label: "일과 진로의 방향을 정하는 것", score: "career" },
          { label: "복잡한 감정을 정리하고 표현하는 것", score: "emotion" },
          { label: "비슷한 고민을 나눌 사람을 만나는 것", score: "self" }
        ]
      },
      {
        q: "요즘 자주 떠올리는 생각은 어느 쪽인가요?",
        options: [
          { label: "“잠깐 멈추고 숨을 고르고 싶다”", score: "burnout" },
          { label: "“다음 단계를 제대로 준비하고 싶다”", score: "career" },
          { label: "“요즘 내 감정이 뭔지 잘 모르겠다”", score: "emotion" },
          { label: "“혼자 삭이지 말고 이야기를 나누고 싶다”", score: "self" }
        ]
      },
      {
        q: "어떤 방식이 더 편하게 느껴지나요?",
        options: [
          { label: "혼자 차분히, 1:1로 깊게", score: "burnout", also: "career" },
          { label: "계획과 실행 중심으로 구체적으로", score: "career" },
          { label: "표현하고 정리하는 활동 중심으로", score: "emotion" },
          { label: "비슷한 또래와 이야기 나누며", score: "self" }
        ]
      }
    ],
    results: {
      burnout: {
        tone: "coral",
        icon: "flame",
        name: "쉼표 프로젝트",
        tagline: "번아웃 회복 · 4주 코스",
        desc: "내 에너지가 어디서 차오르는지 먼저 찾아요. 잘 쉬는 법을 익히고 오래 지속할 나만의 리듬을 세웁니다.",
        href: "programs.html#burnout"
      },
      career: {
        tone: "blue",
        icon: "compass",
        name: "방향 찾기 세션",
        tagline: "취업·진로 · 5주 코스",
        desc: "스펙을 더 쌓기 전에 나만의 기준부터 세워요. 강점과 가치를 정리해 현실적인 진로 가설과 90일 계획을 만듭니다.",
        href: "programs.html#career"
      },
      emotion: {
        tone: "sun",
        icon: "cloud",
        name: "감정세탁소",
        tagline: "감정 돌봄 · 6주 소그룹",
        desc: "복잡하게 얽힌 감정을 알아차리고 표현해요. 일상에서 바로 쓸 수 있는 나만의 감정 돌봄 방법을 찾아갑니다.",
        href: "programs.html#emotion"
      },
      self: {
        tone: "green",
        icon: "leaf",
        name: "마음 이음 서클",
        tagline: "자기 이해 · 8주 그룹",
        desc: "비슷한 고민을 가진 또래와 안전하게 나눠요. 감정과 관계의 결을 살피며 나를 설명할 언어를 늘립니다.",
        href: "programs.html#self"
      }
    }
  };

  function initQuiz() {
    var root = $("#quiz");
    if (!root) return;

    var step = 0;
    var scores = { burnout: 0, career: 0, emotion: 0, self: 0 };
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
        scores = { burnout: 0, career: 0, emotion: 0, self: 0 };
        renderQuestion();
        return;
      }

      if (e.target.closest("[data-restart]")) {
        step = 0;
        scores = { burnout: 0, career: 0, emotion: 0, self: 0 };
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

    /* 체험단 페이지에서 넘어온 신청인지 확인한다.
       시트 열 구성을 바꾸지 않아도 되도록 '관심 주제' 앞에 표시만 붙인다. */
    var isTrial = /[?&]trial=/.test(window.location.search);
    if (isTrial) {
      var note = $("#trial-note");
      if (note) note.hidden = false;
      var heading = $(".page-head h1");
      if (heading) heading.textContent = "프로그램 체험단 신청";
    }

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

    function showStatus(message, detail) {
      if (!status) return;
      status.classList.add("is-visible");
      var text = $("[data-msg]", status);
      if (text) text.textContent = message;
      else status.textContent = message;
      var det = $("[data-detail]", status);
      if (det) det.textContent = detail || "";
    }

    function hideStatus() {
      if (status) status.classList.remove("is-visible");
    }

    var submitBtn = $('button[type="submit"]', form);
    var submitLabel = submitBtn ? submitBtn.innerHTML : "";

    function setSending(sending) {
      if (!submitBtn) return;
      submitBtn.disabled = sending;
      submitBtn.innerHTML = sending
        ? '<span class="spinner" aria-hidden="true"></span> 보내는 중…'
        : submitLabel;
    }

    /* 신청 내용을 사람이 읽기 쉬운 형태로 정리한다.
       메일이나 스프레드시트에 그대로 쌓여도 알아볼 수 있도록 한글 항목명을 쓴다. */
    function buildPayload(data) {
      var payload = {
        "이름/닉네임": (data.get("name") || "").toString().trim(),
        "연락처": (data.get("contact") || "").toString().trim(),
        "연령대": (data.get("age") || "").toString() || "-",
        "현재 상황": (data.get("status") || "").toString() || "-",
        "관심 주제": (isTrial ? "[체험단] " : "") + (data.getAll("topic").join(", ") || "-"),
        "상담 방식": (data.get("method") || "").toString() || "-",
        "편한 시간대": data.getAll("time").join(", ") || "-",
        "하고 싶은 이야기": (data.get("message") || "").toString().trim() || "-",
        /* 항목명은 스프레드시트 열 이름과 같아야 하므로 그대로 둔다.
           화면에 보이는 문구만 "청년 복지 안내"로 바뀌었다. */
        "청년 할인 안내": data.get("youth") ? "희망" : "해당 없음",
        "개인정보 동의": "동의",
        "신청 시각": new Date().toLocaleString("ko-KR")
      };

      /* Formspree 등에서 메일 제목과 회신 주소로 쓰이는 값 */
      payload._subject = (isTrial ? "[체험단 신청] " : "[상담 신청] ") + payload["이름/닉네임"] + " 님";
      if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload["연락처"])) {
        payload._replyto = payload["연락처"];
      }
      if (FORM_CONFIG.accessKey) payload.access_key = FORM_CONFIG.accessKey;

      return payload;
    }

    function send(payload) {
      var controller = "AbortController" in window ? new AbortController() : null;
      var timer = controller
        ? window.setTimeout(function () { controller.abort(); }, FORM_CONFIG.timeout)
        : null;

      var options = { method: "POST", signal: controller ? controller.signal : undefined };

      if (FORM_CONFIG.format === "form") {
        /* application/x-www-form-urlencoded — 사전 확인 요청이 없고,
           Apps Script 가 e.parameter 로 값을 읽을 수 있는 유일한 형식이다. */
        var params = new URLSearchParams();
        Object.keys(payload).forEach(function (key) { params.append(key, payload[key]); });
        options.body = params;
      } else if (FORM_CONFIG.format === "formdata") {
        /* multipart/form-data — 사전 확인 요청은 없지만
           Apps Script 는 이 형식을 e.parameter 로 풀어주지 않는다. */
        var body = new FormData();
        Object.keys(payload).forEach(function (key) { body.append(key, payload[key]); });
        options.body = body;
      } else {
        options.headers = { "Content-Type": "application/json", Accept: "application/json" };
        options.body = JSON.stringify(payload);
      }

      return fetch(FORM_CONFIG.endpoint, options).then(function (res) {
        if (timer) window.clearTimeout(timer);
        if (!res.ok) throw new Error("서버 응답 " + res.status);
        return res.text();
      }, function (err) {
        if (timer) window.clearTimeout(timer);
        throw err;
      }).then(function (body) {
        /* 200 이 왔다고 저장된 것은 아니다. 서버가 거절했으면 실패로 다룬다.
           이것을 확인하지 않으면 저장되지 않았는데 접수 화면이 뜬다. */
        if (/"(ok|success)"\s*:\s*false/.test(body)) {
          var m = body.match(/"error"\s*:\s*"([^"]*)"/);
          throw new Error(m ? "서버가 거절함 — " + m[1] : "서버가 저장하지 못함");
        }
        return body;
      });
    }

    function showDone(name) {
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

      /* --- 여기까지 통과하면 유효한 신청 --- */

      /* 전송 주소가 없으면 미리보기 모드: 화면만 넘어가고 실제로 보내지 않는다 */
      if (!FORM_CONFIG.endpoint) {
        if (window.console && console.warn) {
          console.warn(
            "[청년마음이음상담소] 신청이 전송되지 않았습니다. " +
            "assets/js/main.js 의 FORM_CONFIG.endpoint 를 설정하세요."
          );
        }
        showDone(name);
        return;
      }

      setSending(true);

      send(buildPayload(data))
        .then(function () {
          showDone(name);
        })
        .catch(function (err) {
          setSending(false);
          var aborted = err && err.name === "AbortError";
          showStatus(
            aborted
              ? "응답이 너무 늦어요. 잠시 후 다시 시도해 주시거나 gwangju.ymcc@gmail.com 로 보내주세요."
              : "전송에 실패했어요. 잠시 후 다시 눌러주시거나 gwangju.ymcc@gmail.com 로 보내주세요.",
            /* 문의가 들어왔을 때 원인을 바로 알 수 있도록 기술적 이유를 함께 남긴다 */
            aborted ? "원인: 응답 시간 초과" : "원인: " + ((err && err.message) || "알 수 없음")
          );
          if (window.console && console.error) console.error("[신청 전송 실패]", err);
        });
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
