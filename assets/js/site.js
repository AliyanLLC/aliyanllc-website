(function () {
  "use strict";
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("menu-open", open);
    });
  }
  // Categories dropdown (click / keyboard)
  document.querySelectorAll(".has-menu").forEach(function (li) {
    var btn = li.querySelector(".menu-btn");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = li.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!li.contains(e.target)) { li.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { li.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.focus(); }
    });
  });

  // Catalog filter
  var chips = document.querySelectorAll("[data-filter]");
  if (chips.length) {
    var cards = document.querySelectorAll("[data-cat]");
    var count = document.querySelector("[data-count]");
    var apply = function (cat, push) {
      var n = 0;
      cards.forEach(function (c) {
        var show = cat === "all" || c.getAttribute("data-cat") === cat;
        c.hidden = !show; if (show) n++;
      });
      chips.forEach(function (ch) { ch.setAttribute("aria-pressed", ch.getAttribute("data-filter") === cat ? "true" : "false"); });
      if (count) count.textContent = n + (n === 1 ? " product type" : " product types");
      if (push && history.replaceState) history.replaceState(null, "", cat === "all" ? location.pathname : "#" + cat);
    };
    chips.forEach(function (ch) {
      ch.addEventListener("click", function () { apply(ch.getAttribute("data-filter"), true); });
    });
    var h = location.hash.replace("#", "");
    if (h && document.querySelector('[data-filter="' + h + '"]')) apply(h, false);
  }

  // Copy email buttons
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-copy");
      var done = function () { var t = b.textContent; b.textContent = "Copied"; setTimeout(function () { b.textContent = t; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, function () {});
    });
  });

  // Contact form: compose an email (nothing is stored or sent by this website)
  var form = document.querySelector("form.inq");
  if (form) {
    try {
      var q = new URLSearchParams(location.search);
      var line = q.get("line"), cat = q.get("category");
      if (cat && form.elements.category) {
        Array.prototype.forEach.call(form.elements.category.options, function (o) { if (o.text === cat) o.selected = true; });
      }
      if (line && form.elements.message && !form.elements.message.value) {
        form.elements.message.value = "We supply products in this line: " + line + ".\n\nBrands / lines we represent:\nMinimum order quantity and payment terms:\nMAP or reseller policy:\n";
      }
    } catch (e) {}
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var f = form.elements;
      var val = function (n) { return f[n] && f[n].value ? f[n].value.trim() : ""; };
      var subject = "Wholesale inquiry: " + (val("company") || val("name"));
      var body = [
        "Name: " + val("name"),
        "Company: " + val("company"),
        "Business email: " + val("email"),
        "Phone: " + (val("phone") || "-"),
        "Country: " + val("country"),
        "Business type: " + val("type"),
        "Product category: " + (val("category") || "-"),
        "Order volume / MOQ: " + (val("volume") || "-"),
        "",
        val("message")
      ].join("\n");
      var href = "mailto:wholesale@aliyanllc.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      var msg = form.querySelector(".form-msg");
      if (msg) msg.textContent = "Your email app should open with the inquiry ready to send. If it does not, email wholesale@aliyanllc.com directly.";
      window.location.href = href;
    });
  }
})();

/* v2 upgrades — Oct 2026: header state, scroll progress, reveals, counters, card spotlight, back-to-top */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector(".site-header");

  // Scroll progress bar + header state + back-to-top
  var bar = null;
  if (header) { bar = document.createElement("div"); bar.className = "scroll-progress"; bar.setAttribute("aria-hidden", "true"); header.appendChild(bar); }
  var top = document.createElement("button");
  top.type = "button"; top.className = "to-top"; top.setAttribute("aria-label", "Back to top");
  top.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 10l5-5 5 5"/></svg>';
  top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
  document.body.appendChild(top);
  var ticking = false;
  var onScroll = function () {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    top.classList.toggle("show", y > 900);
    ticking = false;
  };
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  if (!("IntersectionObserver" in window)) return;

  // Reveal on scroll — only for elements that start below the fold (no flash on load)
  if (!reduce) {
    var sel = ".sec-head, .feature, .cat-card, .p-card, .why > div, .charter > div, .step, .info > div, .flow-node, .cmp-row, .stat, .quote, .docs-card, .prose > *, .faq-group, .side-card, .mail-card, form.inq";
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.getBoundingClientRect().top < vh) return;
      var sibs = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
      el.style.transitionDelay = Math.min(sibs, 6) * 70 + "ms";
      el.classList.add("rv");
      io.observe(el);
    });
  }

  // Count-up numbers
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = parseInt(el.getAttribute("data-count"), 10), suf = el.getAttribute("data-suffix") || "";
        var t0 = null, dur = 1200;
        var step = function (t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
          el.textContent = v + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  // Card spotlight follows the pointer
  document.querySelectorAll(".cat-card, .p-card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
})();
