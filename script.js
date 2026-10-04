/* =====================================================
   jephdev portfolio — script.js
   ===================================================== */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ── Year ──────────────────────────────────────────────
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ══════════════════════════════════════════════════════
// NAV OVERLAY — hamburger opens full-screen menu
// ══════════════════════════════════════════════════════
const menuBtn    = document.getElementById("menuBtn");
const navOverlay = document.getElementById("navOverlay");
const header     = document.getElementById("siteHeader");

function openMenu() {
  navOverlay.classList.add("open");
  menuBtn.classList.add("open");
  document.body.classList.add("menu-open");
  menuBtn.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  navOverlay.classList.remove("open");
  menuBtn.classList.remove("open");
  document.body.classList.remove("menu-open");
  menuBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

if (menuBtn && navOverlay) {
  menuBtn.addEventListener("click", () => {
    navOverlay.classList.contains("open") ? closeMenu() : openMenu();
  });

  // Close on link click
  navOverlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Close on overlay backdrop click (outside inner box)
  navOverlay.addEventListener("click", (e) => {
    if (e.target === navOverlay) closeMenu();
  });
}

// ══════════════════════════════════════════════════════
// NAV FX — capsule navbar: letter-roll logo, sliding pill,
//          cursor spotlight, magnetic CTA, language thumb
// ══════════════════════════════════════════════════════
(function navFx() {
  const nav = document.querySelector(".header .nav");
  if (!nav) return;

  // ── Logo: split into letters so each can roll on hover ──
  const logo = nav.querySelector(".logo");
  if (logo && !logo.querySelector(".lg")) {
    const word = logo.textContent.trim().replace(/\.$/, "");
    logo.setAttribute("aria-label", word);
    logo.innerHTML =
      '<span class="logo-word" aria-hidden="true">' +
      [...word].map((c, i) => `<span class="lg" style="--i:${i}"><i>${c}</i><i>${c}</i></span>`).join("") +
      '</span><span class="logo-dot" aria-hidden="true">.</span>';
  }

  // ── Sliding pill behind the inline links ──
  const list = nav.querySelector(".nav-links-inline");
  if (list) {
    const pill = document.createElement("li");
    pill.className = "nav-pill";
    pill.setAttribute("aria-hidden", "true");
    list.appendChild(pill);

    const links = [...list.querySelectorAll("a")];
    let hovered = null;

    const syncPill = () => {
      if (!list.offsetParent) return; // hidden (mobile widths)
      const target = hovered || list.querySelector("a.current");
      if (!target) { pill.classList.remove("on", "rest"); return; }
      const wasOn = pill.classList.contains("on");
      if (!wasOn) pill.classList.add("snap");
      pill.style.setProperty("--x", target.offsetLeft + "px");
      pill.style.setProperty("--y", target.offsetTop + "px");
      pill.style.setProperty("--w", target.offsetWidth + "px");
      pill.style.setProperty("--h", target.offsetHeight + "px");
      pill.classList.add("on");
      pill.classList.toggle("rest", !hovered);
      if (!wasOn) { void pill.offsetWidth; pill.classList.remove("snap"); }
    };

    links.forEach((a) => {
      a.addEventListener("pointerenter", () => { hovered = a; syncPill(); });
    });
    list.addEventListener("pointerleave", () => { hovered = null; syncPill(); });
    list.addEventListener("focusin", (e) => {
      if (e.target.matches(":focus-visible")) { hovered = e.target; syncPill(); }
    });
    list.addEventListener("focusout", () => { hovered = null; syncPill(); });

    // re-measure when fonts load, the language changes text width, or the viewport resizes
    const ro = new ResizeObserver(syncPill);
    ro.observe(list);
    links.forEach((a) => ro.observe(a));
    syncPill();
  }

  // ── Cursor spotlight across the capsule ──
  nav.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = nav.getBoundingClientRect();
    nav.style.setProperty("--mx", e.clientX - r.left + "px");
    nav.style.setProperty("--my", e.clientY - r.top + "px");
  });

  // ── CTA: bloom starts where the cursor enters, button leans toward the cursor ──
  const cta = nav.querySelector(".nav-cta-btn");
  if (cta) {
    let tx = 0, ty = 0;
    const origin = (e) => {
      const r = cta.getBoundingClientRect();
      cta.style.setProperty("--bx", e.clientX - r.left + "px");
      cta.style.setProperty("--by", e.clientY - r.top + "px");
    };
    cta.addEventListener("pointerenter", origin);
    cta.addEventListener("pointerleave", (e) => {
      origin(e);
      tx = ty = 0;
      cta.style.setProperty("--tx", "0px");
      cta.style.setProperty("--ty", "0px");
    });
    if (!prefersReducedMotion) {
      cta.addEventListener("pointermove", (e) => {
        const r = cta.getBoundingClientRect();
        const cx = r.left - tx + r.width / 2;
        const cy = r.top - ty + r.height / 2;
        tx = (e.clientX - cx) * 0.16;
        ty = (e.clientY - cy) * 0.3;
        cta.style.setProperty("--tx", tx.toFixed(2) + "px");
        cta.style.setProperty("--ty", ty.toFixed(2) + "px");
      });
    }
  }

  // ── Language switcher: thumb slides to the active language ──
  const sw = nav.querySelector(".lang-switcher");
  if (sw) {
    const thumb = document.createElement("span");
    thumb.className = "lang-thumb snap";
    thumb.setAttribute("aria-hidden", "true");
    sw.appendChild(thumb);
    sw.classList.add("has-thumb");

    let placed = false;
    const activeBtn = () => sw.querySelector(".lang-btn.active");
    const moveThumb = (btn) => {
      if (!btn || !sw.offsetParent) return;
      thumb.style.setProperty("--x", btn.offsetLeft + "px");
      thumb.style.setProperty("--w", btn.offsetWidth + "px");
      if (!placed) { void thumb.offsetWidth; thumb.classList.remove("snap"); placed = true; }
    };

    sw.querySelectorAll(".lang-btn").forEach((b) => {
      b.addEventListener("click", () => moveThumb(b)); // move now; the page text swaps ~220ms later
      new MutationObserver(() => moveThumb(activeBtn())).observe(b, { attributes: true, attributeFilter: ["class"] });
    });
    new ResizeObserver(() => moveThumb(activeBtn())).observe(sw);
    moveThumb(activeBtn());
  }
})();

// ══════════════════════════════════════════════════════
// SCROLL FX — header background on scroll
// ════════════════════════════════════════════════════
const scrollTopBtn = (() => {
  const btn = document.createElement("button");
  btn.className = "float-btn scroll-top";
  btn.type = "button";
  btn.setAttribute("aria-label", "Scroll to top");
  btn.textContent = "↑";
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  return btn;
})();

const applyScrollFx = () => {
  if (header) header.classList.toggle("scrolled", window.scrollY > 60);
  scrollTopBtn.classList.toggle("show", window.scrollY > 300);
};

window.addEventListener("scroll", applyScrollFx, { passive: true });
applyScrollFx();

// ══════════════════════════════════════════════════════
// FLOATING ACTIONS (WhatsApp + scroll top)
// ══════════════════════════════════════════════════════
const floatingActions = document.createElement("div");
floatingActions.className = "floating-actions";

const whatsappBtn = document.createElement("a");
whatsappBtn.className = "float-btn whatsapp";
whatsappBtn.href = "https://wa.me/2349067069213?text=Hi%20jephdev,%20I%20want%20to%20work%20with%20you";
whatsappBtn.target = "_blank";
whatsappBtn.rel = "noopener noreferrer";
whatsappBtn.setAttribute("aria-label", "Chat on WhatsApp");
whatsappBtn.innerHTML = '<i class="bi bi-whatsapp" style="font-size:22px;"></i>';

floatingActions.appendChild(whatsappBtn);
floatingActions.appendChild(scrollTopBtn);
document.body.appendChild(floatingActions);


// ══════════════════════════════════════════════════════
// TOP BANNER (inner pages only)
// ══════════════════════════════════════════════════════
const topBanner   = document.getElementById("topBanner");
const closeBanner = document.getElementById("closeBanner");

if (topBanner) {
  // Show only on inner pages
  if (!document.getElementById("hero")) {
    topBanner.classList.add("show");
  }

  if (closeBanner) {
    closeBanner.addEventListener("click", () => {
      topBanner.classList.remove("show");
      setTimeout(() => { topBanner.style.display = "none"; }, 300);
    });
  }
}

// ══════════════════════════════════════════════════════
// HERO ENTRANCE — all elements driven by CSS animations
// JS only provides a safety-net in case CSS stalls
// ══════════════════════════════════════════════════════
const heroTagline = document.getElementById("heroTagline");
const heroActions = document.getElementById("heroActions");
const heroScroll  = document.getElementById("heroScroll");

(function heroEntrance() {
  const badge = document.querySelector(".hero-avail-tag");

  // Reduced-motion: animations are disabled by media query,
  // so force final visible state immediately via inline style/class
  if (prefersReducedMotion) {
    if (badge)       badge.style.opacity       = "1";
    if (heroTagline) heroTagline.style.opacity  = "1";
    if (heroActions) heroActions.style.opacity  = "1";
    if (heroScroll)  heroScroll.style.opacity   = "1";
    return;
  }

  // Safety net — if CSS animations somehow stall, force visible at 1.5s
  setTimeout(() => {
    if (badge)       badge.style.opacity       = "1";
    if (heroTagline) heroTagline.style.opacity  = "1";
    if (heroActions) heroActions.style.opacity  = "1";
    if (heroScroll)  heroScroll.style.opacity   = "1";
  }, 1500);
})();

// ══════════════════════════════════════════════════════
// ANIMATED COUNTERS
// ══════════════════════════════════════════════════════
const statNumbers = document.querySelectorAll(".stat-number[data-target]");

if (statNumbers.length) {
  const runCounter = (el) => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start    = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };

    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  statNumbers.forEach((el) => {
    el.textContent = "0";
    counterObserver.observe(el);
  });
}

// ══════════════════════════════════════════════════════
// REVEAL ON SCROLL (inner pages)
// ══════════════════════════════════════════════════════
const revealTargets = document.querySelectorAll(
  ".page-hero, .section, .card, .about-hero, .about-stack, .process-section, .contact-layout, .stats-section"
);

if (revealTargets.length) {
  revealTargets.forEach((el, i) => {
    el.classList.add("reveal");
    el.classList.add(i % 3 === 0 ? "reveal-left" : i % 3 === 1 ? "reveal-up" : "reveal-right");
    el.style.transitionDelay = `${Math.min(i * 50, 300)}ms`;
  });

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));
}

// ══════════════════════════════════════════════════════
// FEATURED PROJECT TILT (projects page)
// ══════════════════════════════════════════════════════
const featuredProject = document.getElementById("featuredProject");
if (featuredProject && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
  featuredProject.addEventListener("mousemove", (e) => {
    const rect = featuredProject.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    featuredProject.style.setProperty("--tilt-x", `${(0.5 - y) * 4}deg`);
    featuredProject.style.setProperty("--tilt-y", `${(x - 0.5) * 5}deg`);
  });

  featuredProject.addEventListener("mouseleave", () => {
    featuredProject.style.setProperty("--tilt-x", "0deg");
    featuredProject.style.setProperty("--tilt-y", "0deg");
  });
}

// ══════════════════════════════════════════════════════
// CONTACT FORM — Formspree + mailto fallback
// ══════════════════════════════════════════════════════
const contactForm = document.getElementById("contactForm");
const formNote    = document.getElementById("formNote");
const formSuccess = document.getElementById("formSuccess");
const submitBtn   = document.getElementById("submitBtn");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formspreeId = contactForm.dataset.formspreeId;
    const data    = new FormData(contactForm);
    const name    = data.get("name") || "";
    const email   = data.get("email") || "";
    const message = data.get("message") || "";

    if (formspreeId && formspreeId !== "YOUR_FORM_ID") {
      if (submitBtn) { submitBtn.textContent = "Sending…"; submitBtn.disabled = true; }

      try {
        const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          contactForm.reset();
          if (formSuccess) formSuccess.style.display = "block";
        } else {
          throw new Error("Formspree error");
        }
      } catch {
        _mailtoFallback(name, email, message);
      } finally {
        if (submitBtn) { submitBtn.textContent = "Send Message"; submitBtn.disabled = false; }
      }

    } else {
      // No Formspree ID set — open email client and show success message
      _mailtoFallback(name, email, message);
      contactForm.reset();
      if (formSuccess) formSuccess.style.display = "block";
    }
  });
}

function _mailtoFallback(name, email, message) {
  const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
  const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nProject Details:\n${message}`);
  // Use window.open so the page doesn't navigate away
  const link = document.createElement("a");
  link.href = `mailto:jephcoding@gmail.com?subject=${subject}&body=${body}`;
  link.click();
}

// ══════════════════════════════════════════════════════
// SCROLL PROGRESS BAR
// ══════════════════════════════════════════════════════
const scrollProgress = document.createElement("div");
scrollProgress.className = "scroll-progress";
document.body.appendChild(scrollProgress);

const updateScrollProgress = () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (total > 0) scrollProgress.style.width = `${(window.scrollY / total) * 100}%`;
};
window.addEventListener("scroll", updateScrollProgress, { passive: true });


// ══════════════════════════════════════════════════════
// PROJECT CARDS — click-to-play
// ══════════════════════════════════════════════════════
document.querySelectorAll(".project-card-media").forEach((media) => {
  const overlay = media.querySelector(".project-play-overlay");
  const video   = media.querySelector(".project-card-video");
  const thumb   = media.querySelector(".project-card-thumb");

  if (!overlay || !video) return;

  overlay.addEventListener("click", () => {
    overlay.classList.add("is-hidden");
    if (thumb) thumb.style.opacity = "0";
    video.classList.add("is-playing");
    video.play();
  });

  video.addEventListener("ended", () => {
    video.classList.remove("is-playing");
    video.currentTime = 0;
    if (thumb) thumb.style.opacity = "1";
    overlay.classList.remove("is-hidden");
  });

  // Pause video if card scrolls out of view
  const pauseObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && !video.paused) {
          video.pause();
          video.classList.remove("is-playing");
          if (thumb) thumb.style.opacity = "1";
          overlay.classList.remove("is-hidden");
        }
      });
    },
    { threshold: 0.1 }
  );
  pauseObs.observe(media);
});

// ══════════════════════════════════════════════════════
// STAGGER REVEAL — grids and lists
// ══════════════════════════════════════════════════════
const staggerTargets = document.querySelectorAll(
  ".projects-grid .project-card, .work-list .work-item, .services-editorial .service-col, .stack-groups .stack-group"
);

if (staggerTargets.length) {
  staggerTargets.forEach((el, i) => {
    el.classList.add("stagger-child");
    el.style.transitionDelay = `${Math.min(i * 80, 400)}ms`;
  });

  const staggerObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  staggerTargets.forEach((el) => staggerObs.observe(el));
}

// ══════════════════════════════════════════════════════
// LANGUAGE SWITCHER
// ══════════════════════════════════════════════════════
const LANG_KEY = "jephdev-lang";

const TRANSLATIONS = {
  en: {
    /* ── nav ── */
    "nav.home":"Home","nav.about":"About","nav.projects":"Projects",
    "nav.services":"Services","nav.contact":"Contact","nav.cta":"Get a Quote",
    /* ── hero ── */
    "hero.badge":"Available — Taking new projects",
    "hero.role":"Mobile & Full-Stack Developer · Founder",
    "founder.eyebrow":"Founder Project",
    "badge.founder":"Founder",
    "connect.visit":"↗ Visit Connect",
    "workc.cta":"View Project →",
    "workc.desc":"My own product — an AI business OS for small businesses. Tell it what you need in plain English; it does the work.",
    "connect.desc":"My own product, not client work. Connect is an AI business OS for small businesses — tell it what you need in plain English and it does the work: logs it, sends it, marks it done. Orders, invoices, customers and insights in one workspace, with WhatsApp and email connected.",
    "hero.tagline":"I don't just write code — I build products that generate real revenue.",
    "hero.cta1":"Get a Project Quote","hero.cta2":"View My Work",
    "hero.trust1":"Free scoping call","hero.trust2":"Clear upfront quote","hero.trust3":"NDA on request",
    "hero.scroll":"scroll",
    /* ── stats ── */
    "stat.projects":"Projects Built","stat.clients":"Happy Clients","stat.years":"Years Building",
    /* ── services block (index) ── */
    "svc.eyebrow":"Services","svc.title":"What I Build","svc.all":"All Services →",
    "svc1.title":"Mobile Apps",
    "svc1.desc":"Your customers download it, use it, and pay through it — on iPhone and Android. I handle everything from first screen to App Store launch.",
    "svc1.li1":"Works on iOS &amp; Android","svc1.li2":"Login, payments &amp; notifications","svc1.li3":"App Store &amp; Play Store launch",
    "svc2.title":"Web Platforms",
    "svc2.desc":"Customer portals, SaaS dashboards, booking systems — web products that run your business and handle real traffic from day one.",
    "svc2.li1":"Fast, modern frontend","svc2.li2":"Secure backend &amp; database","svc2.li3":"Fully hosted &amp; deployed",
    "svc3.title":"Integrations",
    "svc3.desc":"Need your product to connect to payment gateways, WhatsApp, or other tools? I wire everything together so your business runs automatically.",
    "svc3.li1":"Payments (Stripe, Paystack)","svc3.li2":"Third-party tools &amp; APIs","svc3.li3":"Automations &amp; webhooks",
    /* ── work block (index) ── */
    "work.eyebrow":"Work","work.title":"Selected Work","work.all":"All Projects →",
    "work1.title":"Jeloga",
    "work1.desc":"Built a complete ride-sharing platform — mobile app, web dashboard &amp; live backend. Real bookings, real drivers, real revenue across Nigeria.",
    "work1.cs":"Read Case Study →",
    "work2.title":"Stulovax",
    "work2.desc":"Remote operations platform letting overseas founders manage Nigerian staff, track performance &amp; oversee business — from anywhere in the world.",
    "work3.title":"Kickgrid",
    "work3.desc":"Real-time World Cup fan platform — live scores, match predictions, and community discussion. Built and deployed solo.",
    "work4.title":"Your Project?","work4.desc":"Available now for mobile or full-stack builds. Let's make something real.","work4.avail":"Available",
    /* ── testimonials ── */
    "testi.eyebrow":"Client Words","testi.title":"What Clients Say",
    "testi1.quote":"\"Jeph built our entire ride-sharing platform from scratch and delivered faster than we expected. The app is live, handling real bookings, and our users love it. Highly recommend.\"",
    "testi1.name":"Mr. Okezie","testi1.role":"CEO, Jeloga",
    "testi2.quote":"\"Very fast, very professional. Jeph understood exactly what we needed and delivered a clean, working product. He didn't just code — he thought about the business.\"",
    "testi2.name":"Mr. Remi","testi2.role":"Founder, Stulovax",
    "testi3.quote":"\"I've worked with developers before but Jeph is different — he delivers exactly what he promises, on time. My platform was live within weeks. Truly reliable.\"",
    "testi3.name":"Mr. Chidi","testi3.role":"Business Owner, Lagos",
    /* ── contact page ── */
    "contact.eyebrow":"Contact","contact.title":"Let's Talk.",
    "contact.sub":"Share your goals and I'll reply within 24 hours with a clear plan and quote.",
    "contact.worldwide":"Available for remote projects worldwide",
    "contact.timezone":"Responds within 24 hours — any timezone",
    "contact.sidebar":"Or reach out directly",
    "contact.wa.label":"WhatsApp","contact.wa.sub":"Fastest response",
    "contact.email.sub":"Email me directly",
    "contact.gh.label":"GitHub","contact.gh.sub":"See my code",
    "contact.li.label":"LinkedIn","contact.li.sub":"Professional profile",
    "form.name":"Name","form.name.ph":"Your name",
    "form.email":"Email","form.email.ph":"your@email.com",
    "form.message":"What are you building?","form.message.ph":"Describe your project, goals, and rough timeline...",
    "form.submit":"Send Message",
    "form.success":"✓ Message sent! I'll get back to you within 24 hours.",
    /* ── services page ── */
    "svcp.eyebrow":"What I Do","svcp.title":"Services.",
    "svcp.sub":"I help founders and businesses turn ideas into live, revenue-ready digital products — fast, clean, and built to scale.",
    "svcp1.title":"Mobile App Development",
    "svcp1.desc":"Get a polished iOS &amp; Android app your customers can download today. I handle everything from design to App Store launch — you just share your idea.",
    "svcp1.li1":"Works on iPhone &amp; Android (one codebase)","svcp1.li2":"Custom screens, animations &amp; branding",
    "svcp1.li3":"User login, payments &amp; notifications","svcp1.li4":"Full App Store &amp; Play Store submission",
    "svcp2.title":"Custom Web Platforms",
    "svcp2.desc":"Need a website that actually does something — a customer portal, SaaS dashboard, or booking system? I build complete web platforms that run your business logic.",
    "svcp2.li1":"Fast, modern frontend your clients love","svcp2.li2":"Secure backend that handles real traffic",
    "svcp2.li3":"Admin dashboards &amp; reporting","svcp2.li4":"Hosted, deployed &amp; ready to scale",
    "svcp3.title":"Backend &amp; API Integration",
    "svcp3.desc":"Already have a product but need it to connect to payment gateways, third-party tools, or your own data? I wire it all together cleanly and securely.",
    "svcp3.li1":"Payments (Stripe, Flutterwave, Paystack)","svcp3.li2":"Third-party APIs &amp; webhooks",
    "svcp3.li3":"User authentication &amp; security","svcp3.li4":"Performance fixes &amp; cleanup",
    "cta.eyebrow":"Ready to Build?","cta.title":"Let's Talk About Your Project",
    "cta.desc":"Tell me what you're building and I'll reply within 24 hours with a clear plan and quote — no obligation.",
    "cta.btn1":"Get a Project Quote","cta.btn2":"Chat on WhatsApp",
    "proc.eyebrow":"Process","proc.title":"How a Project Runs",
    "proc1.title":"Product Brief","proc1.desc":"You share your goals, scope, and any design assets. I ask the right questions upfront so nothing gets built twice.",
    "proc2.title":"Scope &amp; Quote","proc2.desc":"I map out the build, set a realistic timeline, and give you a clear, itemized quote — no vague estimates.",
    "proc3.title":"Development","proc3.desc":"I build in focused sprints with regular check-ins. You see progress throughout — nothing ships as a surprise.",
    "proc4.title":"Delivery &amp; Handoff","proc4.desc":"Clean code handoff, full deployment, and revision rounds until it's exactly right. You own everything.",
    "faq.eyebrow":"FAQ","faq.title":"Common Questions",
    "faq1.q":"How long does a mobile or full-stack build take?",
    "faq1.a":"A standard mobile MVP takes 1–3 weeks. A full-stack platform typically runs 2–6 weeks, depending on feature scope, integrations, and complexity.",
    "faq2.q":"Do you work from Figma or product requirements?",
    "faq2.a":"Yes. I build from Figma, wireframes, references, or written specs. If design isn't ready, I can still structure the product cleanly and keep it easy to extend later.",
    "faq3.q":"Will my app work well across all devices?",
    "faq3.a":"Every build is tested across common screen sizes and device contexts to ensure consistent layouts, readable content, and smooth interactions.",
    "faq4.q":"Do you provide revisions after delivery?",
    "faq4.a":"Yes. Revision rounds are included for UI polish and usability updates so the final result matches your goals exactly.",
    "faq5.q":"Can you improve an existing app instead of building from scratch?",
    "faq5.a":"Absolutely. I handle UX revamps, performance work, API cleanup, and feature expansion on existing products — not just greenfield builds.",
    "faq6.q":"How is pricing handled?",
    "faq6.a":"Pricing is scoped after reviewing your goals and timeline. <a href=\"contact.html\" class=\"text-link\">Send your brief</a> and I'll reply with a clear quote within 24 hours.",
    /* ── about page ── */
    "about.eyebrow":"About Me","about.title":"Building Things That Ship.",
    "about.bio1":"I'm <strong>jephdev</strong> — based in Abuja, Nigeria. I started coding through a bootcamp, expecting to learn a skill. What I found was something closer to architecture: the ability to turn an idea into a working system that real people use and pay for. That realization changed everything.",
    "about.bio2":"I've learned that the best products come from thinking like a founder, not just a developer. Before I write a line of code, I want to understand what success looks like for the business. I push back when something won't serve the product. I care what happens after launch — not just at delivery.",
    "about.bio3":"If you have an idea worth making real, I'm available now for mobile and full-stack builds.",
    "about.btn1":"See My Work","about.btn2":"Get In Touch",
    "stack.eyebrow":"Tech Stack","stack.title":"Tools I Work With",
    "stack.mobile":"Mobile","stack.web":"Web &amp; Backend","stack.db":"Database &amp; Services","stack.tools":"Tooling &amp; Workflow",
    /* ── projects page ── */
    "proj.eyebrow":"Work","proj.title":"Projects.","proj.sub":"Live products — real code, real users, real results.",
    "feat.eyebrow":"Featured",
    "jeloga.desc":"Built a complete ride-sharing platform from zero — mobile app, web dashboard, and live backend handling real bookings, real drivers, and real revenue. Launched on the App Store and went live in under 3 months.",
    "live.eyebrow":"Live Products",
    "stx.title":"Stulovax.","stx.desc":"Built a remote operations platform that lets overseas founders securely oversee Nigerian business operations, manage staff, and track performance in real time — without being physically present.",
    "kg.title":"Kickgrid.","kg.desc":"2026 FIFA World Cup fan platform — live scores, predictions, and community features built for football fans worldwide.",
    "demo.eyebrow":"Demo Work",
    "nino.title":"Nino Electronics.","nino.desc":"Full-stack web platform for an electronics solutions business — product catalog, clean UI, and integrated inquiry system.",
    "mezo.title":"Mezovest.","mezo.desc":"Investment platform UI — clean interface, dashboard components, and backend integration built as a product demo.",
    "jeloga.cs":"Read Case Study →","jeloga.live":"↗ Live Site",
    "badge.live":"Live","badge.demo":"Demo",
    "proj.cta.eyebrow":"Next Up","proj.cta.title":"Your Project?",
    "proj.cta.desc":"Available for mobile or full-stack builds. Let's make something worth showing here.",
    "proj.cta.btn":"Let's Talk ↗",
    /* ── footer ── */
    "footer.kicker":"Have a project in mind?",
    "footer.rights":"All rights reserved.",
  },

  fr: {
    "nav.home":"Accueil","nav.about":"À propos","nav.projects":"Projets",
    "nav.services":"Services","nav.contact":"Contact","nav.cta":"Obtenir un devis",
    "hero.badge":"Disponible — Accepte de nouveaux projets",
    "hero.role":"Développeur Mobile & Full-Stack · Fondateur",
    "founder.eyebrow":"Projet fondateur",
    "badge.founder":"Fondateur",
    "connect.visit":"↗ Visiter Connect",
    "workc.cta":"Voir le projet →",
    "workc.desc":"Mon propre produit — un système d'exploitation d'entreprise IA pour les petites entreprises. Dites ce qu'il vous faut en langage simple ; il fait le travail.",
    "connect.desc":"Mon propre produit, pas un projet client. Connect est un système d'exploitation d'entreprise propulsé par l'IA pour les petites entreprises : dites ce dont vous avez besoin en langage simple et il fait le travail — il l'enregistre, l'envoie, le marque comme fait. Commandes, factures, clients et analyses dans un seul espace, avec WhatsApp et e-mail connectés.",
    "hero.tagline":"Je ne me contente pas d'écrire du code — je construis des produits qui génèrent de vrais revenus.",
    "hero.cta1":"Demander un devis","hero.cta2":"Voir mes projets",
    "hero.trust1":"Appel gratuit","hero.trust2":"Devis clair","hero.trust3":"NDA disponible",
    "hero.scroll":"défiler",
    "stat.projects":"Projets réalisés","stat.clients":"Clients satisfaits","stat.years":"Ans d'expérience",
    "svc.eyebrow":"Services","svc.title":"Ce que je construis","svc.all":"Tous les services →",
    "svc1.title":"Applications Mobiles",
    "svc1.desc":"Vos clients la téléchargent, l'utilisent et paient via l'app — sur iPhone et Android. Je gère tout, du premier écran au lancement sur l'App Store.",
    "svc1.li1":"Fonctionne sur iOS &amp; Android","svc1.li2":"Connexion, paiements &amp; notifications","svc1.li3":"Lancement App Store &amp; Play Store",
    "svc2.title":"Plateformes Web",
    "svc2.desc":"Portails clients, tableaux de bord SaaS, systèmes de réservation — des produits web qui font tourner votre entreprise dès le premier jour.",
    "svc2.li1":"Interface moderne et rapide","svc2.li2":"Backend sécurisé &amp; base de données","svc2.li3":"Entièrement hébergé &amp; déployé",
    "svc3.title":"Intégrations",
    "svc3.desc":"Votre produit doit se connecter à des passerelles de paiement, WhatsApp ou d'autres outils ? Je connecte tout pour que votre activité tourne automatiquement.",
    "svc3.li1":"Paiements (Stripe, Paystack)","svc3.li2":"APIs &amp; outils tiers","svc3.li3":"Automatisations &amp; webhooks",
    "work.eyebrow":"Travaux","work.title":"Projets sélectionnés","work.all":"Tous les projets →",
    "work1.title":"Jeloga",
    "work1.desc":"Création d'une plateforme complète de covoiturage — app mobile, tableau de bord web et backend en direct. Vraies réservations, vrais chauffeurs, vrais revenus au Nigeria.",
    "work1.cs":"Lire l'étude de cas →",
    "work2.title":"Stulovax",
    "work2.desc":"Plateforme d'opérations à distance permettant aux fondateurs à l'étranger de gérer du personnel nigérian, suivre les performances — de partout dans le monde.",
    "work3.title":"Kickgrid",
    "work3.desc":"Plateforme de fans de la Coupe du Monde en temps réel — scores en direct, prédictions et discussions. Construit et déployé en solo.",
    "work4.title":"Votre projet ?","work4.desc":"Disponible pour des créations mobiles ou full-stack. Faisons quelque chose de réel.","work4.avail":"Disponible",
    "testi.eyebrow":"Avis clients","testi.title":"Ce que disent mes clients",
    "testi1.quote":"\"Jeph a construit toute notre plateforme de covoiturage de zéro et a livré plus vite que prévu. L'app est en ligne, gère de vraies réservations et nos utilisateurs l'adorent. Je recommande vivement.\"",
    "testi1.name":"M. Okezie","testi1.role":"PDG, Jeloga",
    "testi2.quote":"\"Très rapide, très professionnel. Jeph a compris exactement ce dont nous avions besoin et a livré un produit propre et fonctionnel. Il n'a pas seulement codé — il a pensé au business.\"",
    "testi2.name":"M. Remi","testi2.role":"Fondateur, Stulovax",
    "testi3.quote":"\"J'ai travaillé avec des développeurs mais Jeph est différent — il livre exactement ce qu'il promet, dans les délais. Ma plateforme était en ligne en quelques semaines. Vraiment fiable.\"",
    "testi3.name":"M. Chidi","testi3.role":"Chef d'entreprise, Lagos",
    "contact.eyebrow":"Contact","contact.title":"Parlons-en.",
    "contact.sub":"Partagez vos objectifs et je répondrai sous 24 h avec un plan et un devis clairs.",
    "contact.worldwide":"Disponible pour des projets à distance dans le monde entier",
    "contact.timezone":"Répond sous 24 h — tout fuseau horaire",
    "contact.sidebar":"Ou contactez-moi directement",
    "contact.wa.label":"WhatsApp","contact.wa.sub":"Réponse la plus rapide",
    "contact.email.sub":"M'envoyer un e-mail",
    "contact.gh.label":"GitHub","contact.gh.sub":"Voir mon code",
    "contact.li.label":"LinkedIn","contact.li.sub":"Profil professionnel",
    "form.name":"Nom","form.name.ph":"Votre nom",
    "form.email":"E-mail","form.email.ph":"votre@email.com",
    "form.message":"Que construisez-vous ?","form.message.ph":"Décrivez votre projet, vos objectifs et votre calendrier approximatif...",
    "form.submit":"Envoyer le message",
    "form.success":"✓ Message envoyé ! Je vous répondrai dans les 24 heures.",
    "svcp.eyebrow":"Ce que je fais","svcp.title":"Services.",
    "svcp.sub":"J'aide les fondateurs et les entreprises à créer des produits numériques — rapides, propres et prêts à générer des revenus.",
    "svcp1.title":"Développement d'apps mobiles",
    "svcp1.desc":"Obtenez une app iOS &amp; Android soignée que vos clients peuvent télécharger dès aujourd'hui. Je gère tout, de la conception au lancement — vous partagez juste votre idée.",
    "svcp1.li1":"Fonctionne sur iPhone &amp; Android (une seule base de code)","svcp1.li2":"Écrans personnalisés, animations &amp; identité visuelle",
    "svcp1.li3":"Connexion utilisateur, paiements &amp; notifications","svcp1.li4":"Soumission complète App Store &amp; Play Store",
    "svcp2.title":"Plateformes web sur mesure",
    "svcp2.desc":"Besoin d'un site qui fait vraiment quelque chose — un portail client, un tableau de bord SaaS ou un système de réservation ? Je construis des plateformes web complètes.",
    "svcp2.li1":"Interface moderne que vos clients adorent","svcp2.li2":"Backend sécurisé gérant le trafic réel",
    "svcp2.li3":"Tableaux de bord admin &amp; rapports","svcp2.li4":"Hébergé, déployé &amp; prêt à grandir",
    "svcp3.title":"Backend &amp; Intégration API",
    "svcp3.desc":"Vous avez déjà un produit mais il doit se connecter à des passerelles de paiement ou des outils tiers ? Je connecte tout proprement et en toute sécurité.",
    "svcp3.li1":"Paiements (Stripe, Flutterwave, Paystack)","svcp3.li2":"APIs tierces &amp; webhooks",
    "svcp3.li3":"Authentification &amp; sécurité","svcp3.li4":"Corrections de performance &amp; nettoyage",
    "cta.eyebrow":"Prêt à construire ?","cta.title":"Parlons de votre projet",
    "cta.desc":"Dites-moi ce que vous construisez et je répondrai dans les 24 heures avec un plan et un devis clairs — sans engagement.",
    "cta.btn1":"Demander un devis","cta.btn2":"Contacter sur WhatsApp",
    "proc.eyebrow":"Processus","proc.title":"Comment se déroule un projet",
    "proc1.title":"Brief produit","proc1.desc":"Vous partagez vos objectifs, le périmètre et les maquettes. Je pose les bonnes questions en amont pour éviter de refaire le travail.",
    "proc2.title":"Périmètre &amp; Devis","proc2.desc":"Je planifie le développement, fixe un calendrier réaliste et vous donne un devis clair et détaillé — sans estimations vagues.",
    "proc3.title":"Développement","proc3.desc":"Je travaille en sprints ciblés avec des points réguliers. Vous voyez les avancées tout au long — rien ne sort par surprise.",
    "proc4.title":"Livraison &amp; Transfert","proc4.desc":"Remise de code propre, déploiement complet et séances de révisions jusqu'à ce que tout soit parfait. Vous possédez tout.",
    "faq.eyebrow":"FAQ","faq.title":"Questions fréquentes",
    "faq1.q":"Combien de temps prend une app mobile ou un projet full-stack ?",
    "faq1.a":"Un MVP mobile standard prend 1 à 3 semaines. Une plateforme full-stack nécessite généralement 2 à 6 semaines selon la portée et la complexité.",
    "faq2.q":"Travaillez-vous à partir de Figma ou de spécifications ?",
    "faq2.a":"Oui. Je travaille à partir de Figma, wireframes, références ou spécifications écrites. Si la conception n'est pas prête, je structure le produit proprement.",
    "faq3.q":"L'app fonctionnera-t-elle bien sur tous les appareils ?",
    "faq3.a":"Chaque projet est testé sur les tailles d'écran courantes pour assurer des mises en page cohérentes, un contenu lisible et des interactions fluides.",
    "faq4.q":"Fournissez-vous des révisions après la livraison ?",
    "faq4.a":"Oui. Des révisions sont incluses pour le polish UI et les améliorations d'utilisabilité jusqu'à ce que le résultat corresponde exactement à vos objectifs.",
    "faq5.q":"Pouvez-vous améliorer une app existante plutôt que repartir de zéro ?",
    "faq5.a":"Absolument. Je gère les refontes UX, le travail de performance, le nettoyage API et l'ajout de fonctionnalités sur des produits existants.",
    "faq6.q":"Comment la tarification est-elle gérée ?",
    "faq6.a":"La tarification est définie après examen de vos objectifs. <a href=\"contact.html\" class=\"text-link\">Envoyez votre brief</a> et je répondrai avec un devis sous 24 heures.",
    "about.eyebrow":"À propos","about.title":"Construire des choses qui fonctionnent.",
    "about.bio1":"Je suis <strong>jephdev</strong> — basé à Abuja, Nigeria. J'ai commencé à coder via un bootcamp, en espérant acquérir une compétence. Ce que j'ai découvert ressemblait davantage à de l'architecture : la capacité de transformer une idée en système fonctionnel que de vraies personnes utilisent et paient. Cette prise de conscience a tout changé.",
    "about.bio2":"J'ai appris que les meilleurs produits viennent d'une réflexion de fondateur, pas seulement de développeur. Avant d'écrire une ligne de code, je veux comprendre ce que le succès signifie pour l'entreprise. Je questionne ce qui ne servira pas le produit. Je me soucie de ce qui se passe après la livraison — pas seulement à la remise.",
    "about.bio3":"Si vous avez une idée qui mérite de prendre vie, je suis disponible pour des projets mobiles et full-stack.",
    "about.btn1":"Voir mes projets","about.btn2":"Prendre contact",
    "stack.eyebrow":"Stack technique","stack.title":"Outils que j'utilise",
    "stack.mobile":"Mobile","stack.web":"Web &amp; Backend","stack.db":"Base de données &amp; Services","stack.tools":"Outils &amp; Workflow",
    "proj.eyebrow":"Travaux","proj.title":"Projets.","proj.sub":"Produits en ligne — vrai code, vrais utilisateurs, vrais résultats.",
    "feat.eyebrow":"En vedette",
    "jeloga.desc":"Création d'une plateforme complète de covoiturage de zéro — app mobile, tableau de bord web et backend en direct gérant de vraies réservations, de vrais chauffeurs et de vrais revenus. Lancé sur l'App Store en moins de 3 mois.",
    "live.eyebrow":"Produits en ligne",
    "stx.title":"Stulovax.","stx.desc":"Création d'une plateforme d'opérations à distance permettant aux fondateurs à l'étranger de superviser les opérations nigérianes, gérer le personnel et suivre les performances en temps réel.",
    "kg.title":"Kickgrid.","kg.desc":"Plateforme de fans de la Coupe du Monde 2026 — scores en direct, pronostics et fonctionnalités communautaires pour les amateurs de football du monde entier.",
    "demo.eyebrow":"Travaux de démonstration",
    "nino.title":"Nino Electronics.","nino.desc":"Plateforme web full-stack pour une entreprise de solutions électroniques — catalogue produits, interface soignée et système d'enquête intégré.",
    "mezo.title":"Mezovest.","mezo.desc":"Interface de plateforme d'investissement — interface épurée, composants de tableau de bord et intégration backend construits comme démo produit.",
    "jeloga.cs":"Lire l'étude de cas →","jeloga.live":"↗ Site en ligne",
    "badge.live":"En ligne","badge.demo":"Démo",
    "proj.cta.eyebrow":"Suivant","proj.cta.title":"Votre projet ?",
    "proj.cta.desc":"Disponible pour des créations mobiles ou full-stack. Faisons quelque chose qui mérite d'être montré ici.",
    "proj.cta.btn":"Discutons ↗",
    "footer.kicker":"Un projet en tête ?",
    "footer.rights":"Tous droits réservés.",
  },

  es: {
    "nav.home":"Inicio","nav.about":"Acerca","nav.projects":"Proyectos",
    "nav.services":"Servicios","nav.contact":"Contacto","nav.cta":"Presupuesto",
    "hero.badge":"Disponible — Aceptando nuevos proyectos",
    "hero.role":"Desarrollador Mobile y Full-Stack · Fundador",
    "founder.eyebrow":"Proyecto del fundador",
    "badge.founder":"Fundador",
    "connect.visit":"↗ Visitar Connect",
    "workc.cta":"Ver proyecto →",
    "workc.desc":"Mi propio producto — un sistema operativo de negocio con IA para pequeñas empresas. Dile lo que necesitas en lenguaje sencillo y hace el trabajo.",
    "connect.desc":"Mi propio producto, no trabajo para clientes. Connect es un sistema operativo de negocio con IA para pequeñas empresas: dile lo que necesitas en lenguaje sencillo y hace el trabajo — lo registra, lo envía, lo marca como hecho. Pedidos, facturas, clientes y análisis en un solo espacio, con WhatsApp y correo conectados.",
    "hero.tagline":"No solo escribo código — construyo productos que generan ingresos reales.",
    "hero.cta1":"Solicitar presupuesto","hero.cta2":"Ver mi trabajo",
    "hero.trust1":"Llamada gratuita","hero.trust2":"Presupuesto claro","hero.trust3":"NDA disponible",
    "hero.scroll":"bajar",
    "stat.projects":"Proyectos creados","stat.clients":"Clientes felices","stat.years":"Años de experiencia",
    "svc.eyebrow":"Servicios","svc.title":"Lo que construyo","svc.all":"Todos los servicios →",
    "svc1.title":"Aplicaciones Móviles",
    "svc1.desc":"Tus clientes la descargan, la usan y pagan a través de ella — en iPhone y Android. Me encargo de todo, desde la primera pantalla hasta el lanzamiento en la App Store.",
    "svc1.li1":"Funciona en iOS &amp; Android","svc1.li2":"Login, pagos &amp; notificaciones","svc1.li3":"Lanzamiento App Store &amp; Play Store",
    "svc2.title":"Plataformas Web",
    "svc2.desc":"Portales de clientes, dashboards SaaS, sistemas de reservas — productos web que hacen funcionar tu negocio desde el primer día.",
    "svc2.li1":"Frontend moderno y rápido","svc2.li2":"Backend seguro &amp; base de datos","svc2.li3":"Completamente alojado &amp; desplegado",
    "svc3.title":"Integraciones",
    "svc3.desc":"¿Necesitas que tu producto se conecte a pasarelas de pago, WhatsApp u otras herramientas? Conecto todo para que tu negocio funcione automáticamente.",
    "svc3.li1":"Pagos (Stripe, Paystack)","svc3.li2":"APIs &amp; herramientas de terceros","svc3.li3":"Automatizaciones &amp; webhooks",
    "work.eyebrow":"Trabajo","work.title":"Trabajo seleccionado","work.all":"Todos los proyectos →",
    "work1.title":"Jeloga",
    "work1.desc":"Construí una plataforma completa de transporte compartido — app móvil, panel web y backend en vivo. Reservas reales, conductores reales, ingresos reales en Nigeria.",
    "work1.cs":"Ver caso de estudio →",
    "work2.title":"Stulovax",
    "work2.desc":"Plataforma de operaciones remotas que permite a fundadores en el extranjero gestionar personal nigeriano, seguir el rendimiento — desde cualquier parte del mundo.",
    "work3.title":"Kickgrid",
    "work3.desc":"Plataforma de fans del Mundial en tiempo real — marcadores en vivo, predicciones y debate comunitario. Construido y desplegado en solitario.",
    "work4.title":"¿Tu proyecto?","work4.desc":"Disponible para proyectos móviles o full-stack. Hagamos algo real.","work4.avail":"Disponible",
    "testi.eyebrow":"Opiniones","testi.title":"Lo que dicen mis clientes",
    "testi1.quote":"\"Jeph construyó toda nuestra plataforma de transporte compartido desde cero y entregó más rápido de lo esperado. La app está en vivo, manejando reservas reales y nuestros usuarios la adoran. Muy recomendable.\"",
    "testi1.name":"Sr. Okezie","testi1.role":"CEO, Jeloga",
    "testi2.quote":"\"Muy rápido, muy profesional. Jeph entendió exactamente lo que necesitábamos y entregó un producto limpio y funcional. No solo programó — pensó en el negocio.\"",
    "testi2.name":"Sr. Remi","testi2.role":"Fundador, Stulovax",
    "testi3.quote":"\"He trabajado con desarrolladores antes pero Jeph es diferente — entrega exactamente lo que promete, a tiempo. Mi plataforma estuvo en vivo en semanas. Verdaderamente confiable.\"",
    "testi3.name":"Sr. Chidi","testi3.role":"Empresario, Lagos",
    "contact.eyebrow":"Contacto","contact.title":"Hablemos.",
    "contact.sub":"Comparte tus objetivos y responderé en 24 h con un plan y presupuesto claros.",
    "contact.worldwide":"Disponible para proyectos remotos en todo el mundo",
    "contact.timezone":"Responde en 24 h — cualquier zona horaria",
    "contact.sidebar":"O contáctame directamente",
    "contact.wa.label":"WhatsApp","contact.wa.sub":"Respuesta más rápida",
    "contact.email.sub":"Envíame un correo",
    "contact.gh.label":"GitHub","contact.gh.sub":"Ver mi código",
    "contact.li.label":"LinkedIn","contact.li.sub":"Perfil profesional",
    "form.name":"Nombre","form.name.ph":"Tu nombre",
    "form.email":"Correo","form.email.ph":"tu@correo.com",
    "form.message":"¿Qué estás construyendo?","form.message.ph":"Describe tu proyecto, objetivos y plazos aproximados...",
    "form.submit":"Enviar mensaje",
    "form.success":"✓ ¡Mensaje enviado! Te responderé en 24 horas.",
    "svcp.eyebrow":"Lo que hago","svcp.title":"Servicios.",
    "svcp.sub":"Ayudo a fundadores y empresas a convertir ideas en productos digitales — rápidos, limpios y listos para escalar.",
    "svcp1.title":"Desarrollo de Apps Móviles",
    "svcp1.desc":"Obtén una app iOS &amp; Android pulida que tus clientes puedan descargar hoy. Me encargo de todo, desde el diseño hasta el lanzamiento — solo comparte tu idea.",
    "svcp1.li1":"Funciona en iPhone &amp; Android (una sola base de código)","svcp1.li2":"Pantallas personalizadas, animaciones &amp; marca",
    "svcp1.li3":"Login de usuario, pagos &amp; notificaciones","svcp1.li4":"Envío completo a App Store &amp; Play Store",
    "svcp2.title":"Plataformas Web a Medida",
    "svcp2.desc":"¿Necesitas un sitio web que realmente haga algo — un portal de clientes, dashboard SaaS o sistema de reservas? Construyo plataformas web completas.",
    "svcp2.li1":"Frontend moderno que tus clientes adoran","svcp2.li2":"Backend seguro que maneja tráfico real",
    "svcp2.li3":"Paneles admin &amp; reportes","svcp2.li4":"Alojado, desplegado &amp; listo para escalar",
    "svcp3.title":"Backend &amp; Integración de APIs",
    "svcp3.desc":"¿Ya tienes un producto pero necesitas conectarlo a pasarelas de pago, herramientas de terceros o tus propios datos? Lo conecto todo de forma limpia y segura.",
    "svcp3.li1":"Pagos (Stripe, Flutterwave, Paystack)","svcp3.li2":"APIs de terceros &amp; webhooks",
    "svcp3.li3":"Autenticación de usuario &amp; seguridad","svcp3.li4":"Correcciones de rendimiento &amp; limpieza",
    "cta.eyebrow":"¿Listo para construir?","cta.title":"Hablemos de tu proyecto",
    "cta.desc":"Cuéntame qué estás construyendo y responderé en 24 horas con un plan y presupuesto claros — sin compromiso.",
    "cta.btn1":"Solicitar presupuesto","cta.btn2":"Chatear por WhatsApp",
    "proc.eyebrow":"Proceso","proc.title":"Cómo funciona un proyecto",
    "proc1.title":"Brief del producto","proc1.desc":"Compartes tus objetivos, alcance y recursos de diseño. Hago las preguntas correctas desde el principio para que nada se construya dos veces.",
    "proc2.title":"Alcance &amp; Presupuesto","proc2.desc":"Planifico el desarrollo, establezco un cronograma realista y te doy un presupuesto claro y detallado — sin estimaciones vagas.",
    "proc3.title":"Desarrollo","proc3.desc":"Construyo en sprints enfocados con revisiones regulares. Ves el progreso durante todo el proceso — nada se lanza como sorpresa.",
    "proc4.title":"Entrega &amp; Transferencia","proc4.desc":"Entrega de código limpio, despliegue completo y rondas de revisión hasta que todo esté exactamente bien. Eres dueño de todo.",
    "faq.eyebrow":"FAQ","faq.title":"Preguntas frecuentes",
    "faq1.q":"¿Cuánto tarda una app móvil o proyecto full-stack?",
    "faq1.a":"Un MVP móvil estándar toma 1-3 semanas. Una plataforma full-stack generalmente toma 2-6 semanas según el alcance y la complejidad.",
    "faq2.q":"¿Trabajas con Figma o requisitos de producto?",
    "faq2.a":"Sí. Construyo desde Figma, wireframes, referencias o especificaciones escritas. Si el diseño no está listo, puedo estructurar el producto de forma extensible.",
    "faq3.q":"¿Funcionará bien mi app en todos los dispositivos?",
    "faq3.a":"Cada proyecto se prueba en tamaños de pantalla comunes para garantizar diseños coherentes, contenido legible e interacciones fluidas.",
    "faq4.q":"¿Ofreces revisiones después de la entrega?",
    "faq4.a":"Sí. Las revisiones están incluidas para pulido de UI y mejoras de usabilidad hasta que el resultado final corresponda exactamente a tus objetivos.",
    "faq5.q":"¿Puedes mejorar una app existente en lugar de construir desde cero?",
    "faq5.a":"Por supuesto. Me encargo de rediseños UX, trabajo de rendimiento, limpieza de APIs y expansión de funciones en productos existentes.",
    "faq6.q":"¿Cómo se maneja el precio?",
    "faq6.a":"El precio se define después de revisar tus objetivos. <a href=\"contact.html\" class=\"text-link\">Envía tu brief</a> y responderé con un presupuesto claro en 24 horas.",
    "about.eyebrow":"Sobre mí","about.title":"Construyendo cosas que funcionan.",
    "about.bio1":"Soy <strong>jephdev</strong> — basado en Abuja, Nigeria. Empecé a programar en un bootcamp, esperando aprender una habilidad. Lo que encontré se parecía más a la arquitectura: la capacidad de convertir una idea en un sistema funcional que personas reales usan y pagan. Esa comprensión lo cambió todo.",
    "about.bio2":"He aprendido que los mejores productos vienen de pensar como fundador, no solo como desarrollador. Antes de escribir una línea de código, quiero entender qué significa el éxito para el negocio. Cuestiono lo que no servirá al producto. Me importa lo que pasa después de la entrega, no solo en ella.",
    "about.bio3":"Si tienes una idea que merece hacerse realidad, estoy disponible ahora para proyectos móviles y full-stack.",
    "about.btn1":"Ver mi trabajo","about.btn2":"Contactar",
    "stack.eyebrow":"Stack técnico","stack.title":"Herramientas con las que trabajo",
    "stack.mobile":"Móvil","stack.web":"Web &amp; Backend","stack.db":"Base de datos &amp; Servicios","stack.tools":"Herramientas &amp; Flujo de trabajo",
    "proj.eyebrow":"Portafolio","proj.title":"Proyectos.","proj.sub":"Productos en vivo — código real, usuarios reales, resultados reales.",
    "feat.eyebrow":"Destacado",
    "jeloga.desc":"Construí una plataforma completa de transporte compartido desde cero — app móvil, panel web y backend en vivo manejando reservas reales, conductores reales y ingresos reales. Lanzado en la App Store en menos de 3 meses.",
    "live.eyebrow":"Productos en vivo",
    "stx.title":"Stulovax.","stx.desc":"Construí una plataforma de operaciones remotas que permite a fundadores en el extranjero supervisar operaciones en Nigeria, gestionar personal y seguir el rendimiento en tiempo real.",
    "kg.title":"Kickgrid.","kg.desc":"Plataforma de fans del Mundial de la FIFA 2026 — marcadores en vivo, predicciones y funciones comunitarias para aficionados al fútbol de todo el mundo.",
    "demo.eyebrow":"Trabajo de demostración",
    "nino.title":"Nino Electronics.","nino.desc":"Plataforma web full-stack para una empresa de soluciones electrónicas — catálogo de productos, interfaz limpia y sistema de consultas integrado.",
    "mezo.title":"Mezovest.","mezo.desc":"UI de plataforma de inversión — interfaz limpia, componentes de dashboard e integración backend construidos como demo de producto.",
    "jeloga.cs":"Ver caso de estudio →","jeloga.live":"↗ Sitio en vivo",
    "badge.live":"En vivo","badge.demo":"Demo",
    "proj.cta.eyebrow":"Siguiente","proj.cta.title":"¿Tu proyecto?",
    "proj.cta.desc":"Disponible para proyectos móviles o full-stack. Hagamos algo que valga la pena mostrar aquí.",
    "proj.cta.btn":"Hablemos ↗",
    "footer.kicker":"¿Tienes un proyecto en mente?",
    "footer.rights":"Todos los derechos reservados.",
  }
};

function applyLang(lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key] == null) return;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.placeholder = t[key];
    else el.innerHTML = t[key];
  });
  document.querySelectorAll(".lang-btn").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
  document.documentElement.lang = lang === "es" ? "es" : lang === "fr" ? "fr" : "en";
}

function switchLang(lang) {
  document.documentElement.classList.add("lang-fade");
  setTimeout(() => {
    applyLang(lang);
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.classList.remove("lang-fade");
  }, 220);
}

(function initLang() {
  // Inject globe icon into every desktop lang-switcher
  document.querySelectorAll(".lang-switcher").forEach(sw => {
    if (!sw.querySelector(".lang-globe")) {
      const globe = document.createElement("span");
      globe.className = "lang-globe";
      globe.innerHTML = '<i class="bi bi-globe2"></i>';
      sw.insertBefore(globe, sw.firstChild);
    }
  });

  // Inject lang switcher into mobile nav overlay
  const navOverlayEl = document.getElementById("navOverlay");
  if (navOverlayEl) {
    const inner = navOverlayEl.querySelector(".nav-overlay-inner");
    if (inner && !inner.querySelector(".nav-overlay-lang")) {
      const overlayLang = document.createElement("div");
      overlayLang.className = "nav-overlay-lang";
      ["en", "fr", "es"].forEach(l => {
        const b = document.createElement("button");
        b.className = "lang-btn";
        b.dataset.lang = l;
        b.textContent = l.toUpperCase();
        overlayLang.appendChild(b);
      });
      inner.appendChild(overlayLang);
    }
  }

  const saved = localStorage.getItem(LANG_KEY) || "en";
  if (saved !== "en") applyLang(saved);
  document.querySelectorAll(".lang-btn").forEach(btn => {
    if (btn.dataset.lang === saved) btn.classList.add("active");
    btn.addEventListener("click", () => {
      if (!btn.classList.contains("active")) switchLang(btn.dataset.lang);
      // Dismiss hint after first interaction
      localStorage.setItem("jephdev-lang-hint", "1");
    });
  });

  // First-visit hint — pulse + tooltip, once per device
  const HINT_KEY = "jephdev-lang-hint";
  if (!localStorage.getItem(HINT_KEY)) {
    const desktopSwitcher = document.querySelector(".nav-right .lang-switcher");
    if (desktopSwitcher) {
      setTimeout(() => {
        // Tooltip
        const tip = document.createElement("div");
        tip.className = "lang-tip";
        tip.textContent = "Change language";
        desktopSwitcher.appendChild(tip);

        // Border pulse
        desktopSwitcher.classList.add("lang-notice");

        // Clean up after animation + mark seen
        setTimeout(() => {
          desktopSwitcher.classList.remove("lang-notice");
          tip.remove();
          localStorage.setItem(HINT_KEY, "1");
        }, 4200);
      }, 2200); // fire 2.2s after page loads
    }
  }
})();

// ══════════════════════════════════════════════════════
// HERO MOTION — cursor-lit grid, gentle parallax, scroll-out fade
// (all driven through CSS variables on .hero-full; see styles.css)
// ══════════════════════════════════════════════════════
(function heroMotion() {
  const hero = document.querySelector(".hero-full");
  if (!hero) return;

  if (prefersReducedMotion) return;

  const cur = { x: 0, y: 0, nx: 0, ny: 0 };
  const tgt = { x: 0, y: 0, nx: 0, ny: 0 };
  let raf = 0;
  let scrollRaf = 0;
  let home = true; // cursor parked at the default light position

  const rest = () => {
    const r = hero.getBoundingClientRect();
    tgt.x = r.width * 0.34; tgt.y = r.height * 0.46; tgt.nx = 0; tgt.ny = 0;
  };

  const paint = () => {
    raf = 0;
    let moving = false;
    for (const k of ["x", "y", "nx", "ny"]) {
      const d = tgt[k] - cur[k];
      if (Math.abs(d) > (k.length === 1 ? 0.4 : 0.002)) { cur[k] += d * 0.09; moving = true; }
      else cur[k] = tgt[k];
    }
    hero.style.setProperty("--hx", cur.x.toFixed(1) + "px");
    hero.style.setProperty("--hy", cur.y.toFixed(1) + "px");
    hero.style.setProperty("--px", cur.nx.toFixed(3));
    hero.style.setProperty("--py", cur.ny.toFixed(3));
    if (moving) raf = requestAnimationFrame(paint);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(paint); };

  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = hero.getBoundingClientRect();
    if (home) { cur.x = r.width * 0.34; cur.y = r.height * 0.46; home = false; }
    tgt.x = e.clientX - r.left;
    tgt.y = e.clientY - r.top;
    tgt.nx = (tgt.x / r.width - 0.5) * 2;
    tgt.ny = (tgt.y / r.height - 0.5) * 2;
    kick();
  });
  hero.addEventListener("pointerleave", () => { rest(); kick(); });

  // scroll: how far the hero has left the screen (0 → 1)
  const onScroll = () => {
    scrollRaf = 0;
    const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.85)));
    hero.style.setProperty("--sy", p.toFixed(3));
  };
  window.addEventListener("scroll", () => { if (!scrollRaf) scrollRaf = requestAnimationFrame(onScroll); }, { passive: true });
  onScroll();
})();


// ══════════════════════════════════════════════════════
// SITE FX — shared behaviour for every page
//   button bloom · cursor-lit cards · staggered reveals ·
//   ambient page backdrop · testimonial initials
// ══════════════════════════════════════════════════════
(function siteFx() {
  // Buttons: the fill blooms from the point where the cursor enters / leaves
  document.querySelectorAll(".btn").forEach((btn) => {
    const origin = (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--bx", e.clientX - r.left + "px");
      btn.style.setProperty("--by", e.clientY - r.top + "px");
    };
    btn.addEventListener("pointerenter", origin);
    btn.addEventListener("pointerleave", origin);
  });

  // Testimonial avatars show the initial of the person quoted
  document.querySelectorAll(".testimonial-card").forEach((card) => {
    const dot = card.querySelector(".testimonial-dot");
    const name = card.querySelector(".testimonial-name");
    if (dot && name && !dot.textContent.trim()) {
      dot.textContent = name.textContent.trim().replace(/^\w{1,3}\.\s*/, "").charAt(0).toUpperCase();
    }
  });

  // Cards: a soft light + rim that follows the cursor
  const spotSel = ".service-col, .stack-group, .testimonial-card, .project-card, .project-card-cta, .case-feature, .case-result-card, .case-info-card, .quick-link, .faq-item, .jeloga-feature, .founder-feature, .contact-form, .stats-row";
  document.querySelectorAll(spotSel).forEach((el) => el.classList.add("spot"));
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || !e.target.closest) return;
    const el = e.target.closest(".spot");
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });

  // Inner pages: the grid behind the heading lights up under the cursor
  const pageMain = document.querySelector(".page-main");
  if (pageMain) {
    pageMain.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = pageMain.getBoundingClientRect();
      pageMain.style.setProperty("--mx", e.clientX - r.left + "px");
      pageMain.style.setProperty("--my", e.clientY - r.top + "px");
    }, { passive: true });
  }

  // Reveals: cards rise in a short stagger as they enter the viewport
  if (prefersReducedMotion) return;
  const rvSel = ".service-col, .process-item, .faq-item, .project-card, .project-card-cta, .case-feature, .case-result-card, .case-info-card, .testimonial-card, .stack-group, .work-visual-item, .stat-item, .quick-link, .jeloga-feature, .founder-feature, .about-photo-wrap, .contact-form, .case-brief-body";
  const items = [...document.querySelectorAll(rvSel)];
  items.forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.matches(rvSel));
    el.style.setProperty("--d", Math.min(sibs.indexOf(el), 5) * 0.09 + "s");
    el.classList.add("rv");
  });
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
  items.forEach((el) => io.observe(el));
})();


// ══════════════════════════════════════════════════════
// MOBILE DOCK — app-style bottom navigation (shown ≤ 839px via CSS)
// Built from the menu links so pages need no extra markup. The indicator
// slides from the tab you came from to the tab you are on, across pages.
// ══════════════════════════════════════════════════════
(function mobileDock() {
  const links = [...document.querySelectorAll(".nav-overlay-links a")];
  if (!links.length) return;

  const icons = {
    "index.html": "house",
    "about.html": "person",
    "projects.html": "grid-1x2",
    "services.html": "stars",
    "contact.html": "chat-dots",
  };

  const dock = document.createElement("nav");
  dock.className = "dock";
  dock.setAttribute("aria-label", "Main");

  links.forEach((src) => {
    const href = src.getAttribute("href");
    const label = src.querySelector("[data-i18n]");
    const a = document.createElement("a");
    a.className = "dock-item";
    a.href = href;
    if (src.classList.contains("current")) { a.classList.add("is-active"); a.setAttribute("aria-current", "page"); }
    a.innerHTML =
      `<i class="bi bi-${icons[href] || "circle"}" aria-hidden="true"></i>` +
      `<span${label ? ` data-i18n="${label.getAttribute("data-i18n")}"` : ""}>${label ? label.textContent : ""}</span>`;
    dock.appendChild(a);
  });

  const pill = document.createElement("span");
  pill.className = "dock-pill";
  pill.setAttribute("aria-hidden", "true");
  dock.appendChild(pill);
  document.body.appendChild(dock);

  const items = [...dock.querySelectorAll(".dock-item")];
  const now = Math.max(0, items.findIndex((a) => a.classList.contains("is-active")));
  let from = now;
  try {
    const saved = parseInt(sessionStorage.getItem("dockIdx"), 10);
    if (!Number.isNaN(saved) && saved >= 0 && saved < items.length) from = saved;
  } catch (e) { /* storage blocked: the pill simply starts on the current tab */ }

  // start on the tab we came from, then glide to the current one
  pill.style.transition = "none";
  pill.style.setProperty("--i", from);
  void pill.offsetWidth;
  pill.style.transition = "";
  requestAnimationFrame(() => requestAnimationFrame(() => pill.style.setProperty("--i", now)));

  items.forEach((a, i) => a.addEventListener("click", () => {
    try { sessionStorage.setItem("dockIdx", i); } catch (e) { /* ignore */ }
    pill.style.setProperty("--i", i);
  }));
  try { sessionStorage.setItem("dockIdx", now); } catch (e) { /* ignore */ }

  // labels were added after the saved language was applied — translate them now
  const savedLang = localStorage.getItem(LANG_KEY) || "en";
  if (savedLang !== "en") applyLang(savedLang);

  // touch screens: the card nearest the middle of the screen lights up as you scroll
  if (window.matchMedia("(hover: none)").matches) {
    const focusIo = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle("focus", en.isIntersecting));
    }, { rootMargin: "-42% 0px -42% 0px" });
    document.querySelectorAll(".spot").forEach((el) => focusIo.observe(el));
  }
})();


// ══════════════════════════════════════════════════════
// FOUNDER VIDEO — plays while on screen, pauses off screen,
// always user-pausable (and never autoplays with reduced motion)
// ══════════════════════════════════════════════════════
(function founderVideo() {
  const v = document.querySelector(".founder-video");
  if (!v) return;
  const btn = document.querySelector(".founder-toggle");
  let userPaused = prefersReducedMotion;

  const syncBtn = () => {
    if (!btn) return;
    btn.innerHTML = '<i class="bi bi-' + (v.paused ? "play-fill" : "pause-fill") + '"></i>';
    btn.setAttribute("aria-label", v.paused ? "Play demo video" : "Pause demo video");
  };
  v.addEventListener("play", syncBtn);
  v.addEventListener("pause", syncBtn);

  new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { if (!userPaused) v.play().catch(() => {}); }
      else v.pause();
    });
  }, { threshold: 0.35 }).observe(v);

  if (btn) btn.addEventListener("click", () => {
    if (v.paused) { userPaused = false; v.play().catch(() => {}); }
    else { userPaused = true; v.pause(); }
  });
  syncBtn();
})();

// ══════════════════════════════════════════════════════
// TEXT KINETICS — word/line reveals on scroll
// ══════════════════════════════════════════════════════
(function initTextKinetics() {
  if (prefersReducedMotion) return;

  const selectors = [
    "h2",
    ".section-eyebrow",
    ".page-hero h1",
  ];

  const targets = document.querySelectorAll(selectors.join(", "));

  targets.forEach(el => {
    // Skip nav, logo, hero (has its own animations), and stat numbers
    if (
      el.closest(".nav-overlay") ||
      el.closest(".logo") ||
      el.closest(".stat-number-wrap") ||
      el.closest("#hero .hero-name-block")
    ) return;

    el.classList.add("tk-item");

    // Stagger siblings within same parent
    const siblings = Array.from(el.parentElement.querySelectorAll(".tk-item"));
    const idx = siblings.indexOf(el);
    el.style.animationDelay = `${Math.max(0, idx * 75)}ms`;
    el.style.transitionDelay = `${Math.max(0, idx * 75)}ms`;
  });

  const tkObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("tk-in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -20px 0px" }
  );

  document.querySelectorAll(".tk-item").forEach(el => tkObs.observe(el));
})();
