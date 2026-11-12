/* =========================================================================
   AHSAN LIAQAT — main.js
   Hand-built, dependency-free. Sections:
     00 · config & helpers      05 · parallax
     01 · intro curtain         06 · hero sequence
     02 · navigation            07 · scratch reveal
     03 · scroll reveals        08 · gallery lightbox
     04 · hero title split      09 · contact, toast, misc
   ========================================================================= */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 00 · CONFIG & HELPERS
   * ------------------------------------------------------------------ */

  /* Verified details only. Leave a value as an empty string and the page
     keeps its honest "to be published" placeholder. Fill these in once
     Ahsan confirms them and the UI updates itself. */
  var CONTACT = {
    email: "",
    phone: "",
    note: "Contact details are still being confirmed — nothing unverified is published here."
  };

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(sel));
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function on(el, type, handler, opts) {
    if (el) el.addEventListener(type, handler, opts);
  }

  /* ------------------------------------------------------------------ *
   * 01 · INTRO CURTAIN
   * ------------------------------------------------------------------ */
  function initCurtain() {
    var start = function () {
      window.setTimeout(function () {
        document.body.classList.add("is-loaded");
      }, 260);
    };
    /* lift the curtain as soon as the document is ready — never wait on
       every photograph to finish downloading */
    if (document.readyState === "loading") on(document, "DOMContentLoaded", start);
    else start();
    on(window, "load", start);
  }

  /* ------------------------------------------------------------------ *
   * 02 · NAVIGATION
   * ------------------------------------------------------------------ */
  function initNav() {
    var nav = $("#site-nav");
    var toggle = $(".nav__toggle");
    var menu = $("#mobile-menu");
    var links = $$(".nav__links a");
    var locked = false;

    function setStuck() {
      if (!nav) return;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      nav.classList.toggle("is-stuck", y > 40);
    }
    setStuck();
    on(window, "scroll", setStuck, { passive: true });

    /* ---- mobile menu ---- */
    function openMenu() {
      if (!menu || !toggle) return;
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      document.body.style.overflow = "hidden";
      locked = true;
      var first = menu.querySelector("a");
      if (first) window.setTimeout(function () { first.focus({ preventScroll: true }); }, 420);
    }

    function closeMenu(restoreFocus) {
      if (!menu || !toggle) return;
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      if (locked) {
        document.body.style.overflow = "";
        locked = false;
      }
      if (restoreFocus) toggle.focus({ preventScroll: true });
    }

    on(toggle, "click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) closeMenu(true);
      else openMenu();
    });

    $$("#mobile-menu a").forEach(function (a) {
      on(a, "click", function () { closeMenu(false); });
    });

    on(document, "keydown", function (e) {
      if (e.key === "Escape" && locked) closeMenu(true);
    });

    on(window, "resize", function () {
      if (window.innerWidth > 900 && locked) closeMenu(false);
    });

    /* ---- smooth anchor scrolling (works with the sticky header) ---- */
    $$('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href === "#") return;
      on(a, "click", function (e) {
        var target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        var offset = target.getBoundingClientRect().top + window.pageYOffset;
        var navH = nav ? nav.getBoundingClientRect().height : 0;
        var top = href === "#top" ? 0 : offset - navH + 2;
        window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
        if (history.replaceState) history.replaceState(null, "", href);
      });
    });

    /* ---- active link tracking ---- */
    if (!hasIO || !links.length) return;
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      map[id] = a;
    });
    var watcher = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var link = map[entry.target.id];
          if (!link) return;
          links.forEach(function (a) { a.classList.remove("is-active"); });
          link.classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    Object.keys(map).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) watcher.observe(section);
    });
  }

  /* ------------------------------------------------------------------ *
   * 03 · HERO TITLE SPLIT  (each word rises from behind a mask)
   * ------------------------------------------------------------------ */
  function initSplit() {
    $$("[data-split]").forEach(function (el) {
      var words = el.textContent.replace(/\s+/g, " ").trim().split(" ");
      if (!words.length) return;
      el.textContent = "";
      words.forEach(function (word, i) {
        var wrap = document.createElement("span");
        wrap.className = "word";
        var inner = document.createElement("i");
        inner.textContent = word;
        inner.style.setProperty("--i", i);
        wrap.appendChild(inner);
        el.appendChild(wrap);
        if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 04 · SCROLL REVEALS
   * ------------------------------------------------------------------ */
  function initReveals() {
    var nodes = $$("[data-reveal]");
    if (!nodes.length) return;

    if (!hasIO) {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }

    /* threshold 0 (not 0.12): the "clip" variant starts fully clipped, and a
       clipped box reports intersectionRatio 0 — an area-based threshold would
       never fire and the portrait / contact card would stay hidden forever. */
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );

    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ------------------------------------------------------------------ *
   * 05 · PARALLAX  (transform only — cheap and GPU friendly)
   * ------------------------------------------------------------------ */
  function initParallax() {
    var nodes = $$("[data-parallax]");
    if (!nodes.length || reduceMotion) return;

    var items = nodes.map(function (el) {
      return {
        el: el,
        factor: parseFloat(el.getAttribute("data-parallax")) || 0.05,
        hero: el.classList.contains("hero__media"),
        shift: 0
      };
    });

    var ticking = false;

    function render() {
      var vh = window.innerHeight || 800;
      var y = window.pageYOffset || 0;

      items.forEach(function (item) {
        var next;
        if (item.hero) {
          next = clamp(y * item.factor, 0, 64);
        } else {
          var rect = item.el.getBoundingClientRect();
          var centre = rect.top + rect.height / 2;
          next = clamp((centre - vh / 2) * item.factor, -18, 18);
        }
        if (Math.abs(next - item.shift) < 0.25) return;
        item.shift = next;
        item.el.style.transform = "translate3d(0," + next.toFixed(2) + "px,0)";
      });
      ticking = false;
    }

    function request() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(render);
    }

    render();
    on(window, "scroll", request, { passive: true });
    on(window, "resize", request);
  }

  /* ------------------------------------------------------------------ *
   * 06 · HERO PHOTO SEQUENCE  (slow ken-burns crossfade)
   * ------------------------------------------------------------------ */
  function initHeroSequence() {
    var hero = $(".hero");
    var slides = $$(".hero__slide");
    if (!hero || slides.length < 2) return;

    /* Drop-in hook: if a real video exists, it takes over gracefully. */
    var videoSrc = hero.getAttribute("data-video");
    if (videoSrc) {
      var video = document.createElement("video");
      video.className = "hero__video";
      video.src = videoSrc;
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("aria-hidden", "true");
      on(video, "canplay", function () { video.classList.add("is-ready"); });
      var media = $(".hero__media", hero);
      if (media) media.appendChild(video);
    }

    if (reduceMotion) return;

    var index = 0;
    var timer = null;

    function advance() {
      slides[index].classList.remove("is-active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("is-active");
    }

    function play() {
      if (timer) return;
      timer = window.setInterval(advance, 6200);
    }

    function pause() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    }

    on(document, "visibilitychange", function () {
      if (document.hidden) pause();
      else play();
    });

    if (hasIO) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) play();
          else pause();
        });
      }, { threshold: 0.05 }).observe(hero);
    } else {
      play();
    }
  }


  /* ------------------------------------------------------------------ *
   * 07 · SCRATCH REVEAL
   * A painted veil on <canvas>; brush strokes erase it (destination-out).
   * A tiny off-screen copy tracks how much has been cleared.
   * ------------------------------------------------------------------ */
  function initScratch() {
    var root = $("[data-scratch]");
    if (!root) return;
    var frame = $(".scratch__frame", root);
    var canvas = $("[data-scratch-canvas]", root);
    var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
    if (!frame || !canvas || !ctx) return; /* fallback text stays visible */

    var bar = $("[data-scratch-bar]", root);
    var valueEl = $("[data-scratch-value]", root);
    var resetBtn = $("[data-scratch-reset]", root);

    var TAU = Math.PI * 2;
    var SW = 48, SH = 60;              /* sample grid */
    var sampler = document.createElement("canvas");
    sampler.width = SW;
    sampler.height = SH;
    var sctx = sampler.getContext("2d", { willReadFrequently: true });

    var dpr = 1, w = 0, h = 0, brush = 46, last = null, seen = false;
    var stamps = 0, ratio = 0, done = false, painted = false;
    var THRESHOLD = 0.55;

    /* ---- paint the veil ------------------------------------------- */
    function paintVeil() {
      var W = canvas.width, H = canvas.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);

      var base = ctx.createLinearGradient(0, 0, W, H);
      base.addColorStop(0, "#17322A");
      base.addColorStop(0.48, "#1E3B2F");
      base.addColorStop(1, "#0B1A15");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, W, H);

      var glow = ctx.createRadialGradient(W * 0.74, H * 0.16, 0, W * 0.74, H * 0.16, W * 0.95);
      glow.addColorStop(0, "rgba(127,140,106,0.42)");
      glow.addColorStop(1, "rgba(127,140,106,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      /* fine speckle, like dust on glass */
      var i, r, a;
      for (i = 0; i < 220; i++) {
        r = Math.random() * 1.6 * dpr + 0.4;
        a = Math.random() * 0.14 + 0.02;
        ctx.fillStyle = "rgba(245,240,230," + a.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(Math.random() * W, Math.random() * H, r, 0, TAU);
        ctx.fill();
      }

      /* centred wordmark */
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(245,240,230,0.09)";
      var size = Math.max(14, Math.round(W * 0.085));
      ctx.font = "500 " + size + "px 'Cormorant Garamond', Georgia, serif";
      ctx.fillText("AHSAN", W / 2, H * 0.45);
      ctx.fillText("LIAQAT", W / 2, H * 0.45 + size * 1.2);
      ctx.restore();

      /* inner gold hairline */
      ctx.strokeStyle = "rgba(200,180,138,0.3)";
      ctx.lineWidth = Math.max(1, dpr);
      var pad = 14 * dpr;
      ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);

      /* sampler starts fully veiled */
      if (sctx) {
        sctx.globalCompositeOperation = "source-over";
        sctx.fillStyle = "#000";
        sctx.fillRect(0, 0, SW, SH);
      }
    }

    /* ---- geometry ------------------------------------------------- */
    function size() {
      var rect = frame.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      brush = Math.max(20 * dpr, Math.min(canvas.width, canvas.height) * 0.075);
      return true;
    }

    function resetProgress() {
      ratio = 0;
      stamps = 0;
      last = null;
      seen = false;
      done = false;
      root.classList.remove("is-cleared", "is-touched");
      if (bar) bar.style.transform = "scaleX(0)";
      if (valueEl) valueEl.textContent = "0%";
    }


    function reset() {
      size();
      paintVeil();
      resetProgress();
      painted = true;
    }

    /* ---- strokes -------------------------------------------------- */
    function stamp(x, y) {
      var g = ctx.createRadialGradient(x, y, 0, x, y, brush);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.62, "rgba(0,0,0,0.9)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, brush, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      if (sctx) {
        var sr = Math.max(2.4, (brush / canvas.width) * SW * 1.2);
        sctx.globalCompositeOperation = "destination-out";
        sctx.beginPath();
        sctx.arc((x / canvas.width) * SW, (y / canvas.height) * SH, sr, 0, TAU);
        sctx.fill();
        sctx.globalCompositeOperation = "source-over";
      }
    }

    function point(e) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    function measure() {
      if (!sctx) return;
      var data;
      try {
        data = sctx.getImageData(0, 0, SW, SH).data;
      } catch (err) {
        return;
      }
      var clear = 0;
      for (var i = 3; i < data.length; i += 4) {
        if (data[i] < 110) clear++;
      }
      ratio = clear / (SW * SH);
      if (bar) bar.style.transform = "scaleX(" + Math.min(1, ratio).toFixed(3) + ")";
      if (valueEl) valueEl.textContent = Math.round(Math.min(1, ratio) * 100) + "%";
      if (ratio >= THRESHOLD && !done) finish();
    }

    function finish() {
      done = true;
      root.classList.add("is-cleared");
      if (bar) bar.style.transform = "scaleX(1)";
      if (valueEl) valueEl.textContent = "100%";
    }

    /* ---- pointer input -------------------------------------------- */
    function brushTo(p) {
      if (last) {
        var dx = p.x - last.x;
        var dy = p.y - last.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var step = Math.max(brush * 0.38, 1);
        var n = Math.min(80, Math.max(1, Math.round(dist / step)));
        for (var i = 1; i <= n; i++) {
          stamp(last.x + (dx * i) / n, last.y + (dy * i) / n);
        }
      } else {
        stamp(p.x, p.y);
      }
      last = p;
      if (++stamps % 3 === 0) measure();
    }

    on(canvas, "pointerdown", function (e) {
      if (done) return;
      root.classList.add("is-touched");
      seen = true;
      last = null;
      if (canvas.setPointerCapture) {
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      }
      brushTo(point(e));
      measure();
    });

    on(canvas, "pointermove", function (e) {
      if (done) return;
      if (!seen) {
        root.classList.add("is-touched");
        seen = true;
      }
      brushTo(point(e));
    });

    function endStroke() { last = null; }
    on(canvas, "pointerup", endStroke);
    on(canvas, "pointercancel", endStroke);
    on(canvas, "pointerleave", endStroke);
    on(resetBtn, "click", reset);

    /* ---- boot & resize -------------------------------------------- */
    var raf = window.requestAnimationFrame || function (fn) { return window.setTimeout(fn, 16); };
    raf(function () {
      if (!size()) return;
      paintVeil();
      resetProgress();
      painted = true;
    });

    /* repaint once webfonts settle, so the wordmark uses the serif face */
    on(window, "load", function () {
      if (painted && ratio < 0.02) reset();
    });

    var resizeTimer = null;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (!painted) return;
        reset();
      }, 260);
    }
    on(window, "resize", onResize);
    on(window, "orientationchange", onResize);
  }


  /* ------------------------------------------------------------------ *
   * 08 · GALLERY LIGHTBOX
   * ------------------------------------------------------------------ */
  function initLightbox() {
    var box = $("[data-lightbox]");
    var items = $$("[data-gallery] [data-full]");
    if (!box || !items.length) return;

    var img = $("[data-lb-img]", box);
    var cap = $("[data-lb-cap]", box);
    var counter = $("[data-lb-count]", box);
    var btnClose = $("[data-lb-close]", box);
    var btnPrev = $("[data-lb-prev]", box);
    var btnNext = $("[data-lb-next]", box);

    var index = 0;
    var open = false;
    var lastFocus = null;

    function pad(n) { return n < 10 ? "0" + n : String(n); }

    function preload(i) {
      var el = items[(i + items.length) % items.length];
      var src = el.getAttribute("data-full");
      if (!src) return;
      var pre = new Image();
      pre.src = src;
    }

    function show(i) {
      index = (i + items.length) % items.length;
      var el = items[index];
      var thumb = el.querySelector("img");
      img.setAttribute("src", el.getAttribute("data-full"));
      img.setAttribute("alt", (thumb && thumb.alt) || el.getAttribute("data-caption") || "");
      if (cap) cap.textContent = el.getAttribute("data-caption") || "";
      if (counter) counter.textContent = pad(index + 1) + " / " + pad(items.length);
      preload(index + 1);
      preload(index - 1);
    }

    function openAt(i, opener) {
      lastFocus = opener || document.activeElement;
      show(i);
      box.hidden = false;
      /* force a reflow so the fade has a start state */
      void box.offsetWidth;
      box.classList.add("is-open");
      document.body.style.overflow = "hidden";
      open = true;
      if (btnClose) btnClose.focus({ preventScroll: true });
    }

    function close() {
      if (!open) return;
      open = false;
      box.classList.remove("is-open");
      document.body.style.overflow = "";
      window.setTimeout(function () {
        if (!open) box.hidden = true;
      }, 420);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    items.forEach(function (el, i) {
      on(el, "click", function () {
        openAt(i, el);
      });
    });

    on(btnClose, "click", close);
    on(btnPrev, "click", function () { show(index - 1); });
    on(btnNext, "click", function () { show(index + 1); });
    on(box, "click", function (e) { if (e.target === box) close(); });

    on(document, "keydown", function (e) {
      if (!open) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowLeft") { show(index - 1); return; }
      if (e.key === "ArrowRight") { show(index + 1); return; }
      if (e.key !== "Tab") return;
      var focusables = $$("button", box).filter(function (b) { return b.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    /* horizontal swipe on touch screens */
    var startX = null, startY = null;
    on(box, "touchstart", function (e) {
      if (!open || !e.touches.length) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    on(box, "touchend", function (e) {
      if (!open || startX === null || !e.changedTouches.length) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
        show(index + (dx < 0 ? 1 : -1));
      }
      startX = startY = null;
    }, { passive: true });
  }


  /* ------------------------------------------------------------------ *
   * 09 · CONTACT, TOAST, YEAR, BACK TO TOP
   * ------------------------------------------------------------------ */
  function initToast() {
    var el = $("[data-toast]");
    var timer = null;
    return function (message) {
      if (!el || !message) return;
      el.textContent = message;
      el.classList.add("is-visible");
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        el.classList.remove("is-visible");
      }, 4400);
    };
  }

  function initContact(toast) {
    var emailEl = $("[data-contact-email]");
    var phoneEl = $("[data-contact-phone]");

    if (CONTACT.email && emailEl) {
      var mail = document.createElement("a");
      mail.href = "mailto:" + CONTACT.email;
      mail.textContent = CONTACT.email;
      emailEl.textContent = "";
      emailEl.appendChild(mail);
    }

    if (CONTACT.phone && phoneEl) {
      var tel = document.createElement("a");
      tel.href = "tel:" + CONTACT.phone.replace(/\s+/g, "");
      tel.textContent = CONTACT.phone;
      phoneEl.textContent = "";
      phoneEl.appendChild(tel);
    }

    var cta = $("[data-contact-cta]");
    on(cta, "click", function () {
      if (CONTACT.email) {
        window.location.href = "mailto:" + CONTACT.email;
        toast("Opening your mail app…");
      } else {
        toast(CONTACT.note);
      }
    });
  }

  function initMisc() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });

    var top = $("[data-totop]");
    if (!top) return;

    on(top, "click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });

    var shown = false;
    function check() {
      var y = window.pageYOffset || 0;
      var next = y > window.innerHeight * 0.7;
      if (next === shown) return;
      shown = next;
      top.classList.toggle("is-visible", shown);
    }
    check();
    on(window, "scroll", check, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * BOOT
   * ------------------------------------------------------------------ */
  function boot() {
    initCurtain();
    initSplit();
    initNav();
    initReveals();
    initParallax();
    initHeroSequence();
    initScratch();
    initLightbox();
    initMisc();
    initContact(initToast());
  }

  if (document.readyState === "loading") {
    on(document, "DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

