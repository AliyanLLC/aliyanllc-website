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
