/**
 * Ahmed Abdelrahman — Data Analyst Portfolio
 * script.js — All interactive behaviour
 * Vanilla JS · No dependencies
 */

"use strict";

/* ──────────────────────────────────────────────────────
   1. THEME TOGGLE (Dark / Light)
────────────────────────────────────────────────────── */
const html         = document.documentElement;
const themeToggle  = document.getElementById("themeToggle");
const THEME_KEY    = "aa-portfolio-theme";

/** Apply theme without animation flicker on load */
function applyTheme(theme, animate = false) {
  if (!animate) html.style.transition = "none";
  html.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  if (!animate) requestAnimationFrame(() => { html.style.transition = ""; });
}

// Restore saved or system preference
const savedTheme = localStorage.getItem(THEME_KEY)
  || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
applyTheme(savedTheme, false);

themeToggle.addEventListener("click", () => {
  const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next, true);
});


/* ──────────────────────────────────────────────────────
   2. NAVBAR — Scroll + Mobile
────────────────────────────────────────────────────── */
const navbar    = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks  = document.getElementById("navLinks");
const navLinkEls = navLinks.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 20);
  highlightActiveSection();
}, { passive: true });

hamburger.addEventListener("click", () => {
  const open = hamburger.classList.toggle("open");
  navLinks.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", open);
});

// Close menu when a link is clicked (mobile)
navLinkEls.forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
  });
});

// Close menu when clicking outside
document.addEventListener("click", e => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
  }
});

/** Highlight nav link matching visible section */
function highlightActiveSection() {
  const sections = document.querySelectorAll("section[id]");
  const scrollY  = window.scrollY + 100;

  sections.forEach(section => {
    const { top, bottom } = section.getBoundingClientRect();
    const inView = top + window.scrollY <= scrollY
                && bottom + window.scrollY > scrollY;

    const link = navLinks.querySelector(`[href="#${section.id}"]`);
    if (link) link.classList.toggle("active", inView);
  });
}


/* ──────────────────────────────────────────────────────
   3. SCROLL REVEAL
────────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveal").forEach((el, i) => {
  // Stagger items inside grid parents
  const parent = el.parentElement;
  const siblings = parent
    ? [...parent.querySelectorAll(":scope > .reveal")]
    : [];
  const idx = siblings.indexOf(el);
  if (idx > 0) {
    el.style.transitionDelay = `${Math.min(idx * 0.08, 0.5)}s`;
  }
  revealObserver.observe(el);
});


/* ──────────────────────────────────────────────────────
   4. SKILL BAR ANIMATION
────────────────────────────────────────────────────── */
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll(".sb-fill").forEach(fill => {
        // Small delay so the reveal animation finishes first
        setTimeout(() => {
          fill.style.width = fill.dataset.w + "%";
        }, 300);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll(".skills-bars").forEach(el => barObserver.observe(el));


/* ──────────────────────────────────────────────────────
   5. CONTACT FORM VALIDATION
────────────────────────────────────────────────────── */
const form       = document.getElementById("contactForm");
const submitBtn  = document.getElementById("submitBtn");
const feedback   = document.getElementById("formFeedback");

/** Validate a single field; returns error string or '' */
function validateField(id) {
  const input = document.getElementById(id);
  if (!input) return "";

  const val = input.value.trim();

  if (id === "email") {
    if (!val) return "Email is required.";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(val)) return "Please enter a valid email address.";
    return "";
  }

  if (!val) {
    const labels = { name: "Name", subject: "Subject", message: "Message" };
    return `${labels[id] || "This field"} is required.`;
  }
  if (id === "message" && val.length < 10) return "Message must be at least 10 characters.";
  return "";
}

/** Show or clear error for a field */
function setFieldError(id, msg) {
  const input = document.getElementById(id);
  const errEl = document.getElementById(id + "Error");
  if (!input || !errEl) return;

  if (msg) {
    input.classList.add("error");
    errEl.textContent = msg;
  } else {
    input.classList.remove("error");
    errEl.textContent = "";
  }
}

// Live validation on blur
["name", "email", "subject", "message"].forEach(id => {
  const input = document.getElementById(id);
  if (!input) return;
  input.addEventListener("blur", () => setFieldError(id, validateField(id)));
  input.addEventListener("input", () => {
    if (input.classList.contains("error")) {
      setFieldError(id, validateField(id));
    }
  });
});

form.addEventListener("submit", async e => {
  e.preventDefault();

  // Validate all fields
  const fields = ["name", "email", "subject", "message"];
  let isValid  = true;

  fields.forEach(id => {
    const err = validateField(id);
    setFieldError(id, err);
    if (err) isValid = false;
  });

  if (!isValid) {
    showFeedback("Please fix the errors above before sending.", "error");
    return;
  }

  // Simulate async submission
  submitBtn.disabled = true;
  submitBtn.querySelector(".btn-text").hidden  = true;
  submitBtn.querySelector(".btn-loader").hidden = false;
  feedback.className = "form-feedback";
  feedback.textContent = "";

  await simulateSend();

  submitBtn.disabled = false;
  submitBtn.querySelector(".btn-text").hidden  = false;
  submitBtn.querySelector(".btn-loader").hidden = true;

  showFeedback("✓ Message sent! I'll get back to you within 24 hours.", "success");
  form.reset();
  // Clear any lingering error states
  fields.forEach(id => setFieldError(id, ""));
});

function showFeedback(msg, type) {
  feedback.textContent = msg;
  feedback.className   = `form-feedback ${type}`;
  feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
  // Auto-clear after 6 s
  setTimeout(() => { feedback.className = "form-feedback"; feedback.textContent = ""; }, 6000);
}

function simulateSend() {
  return new Promise(resolve => setTimeout(resolve, 1400));
}


/* ──────────────────────────────────────────────────────
   6. SMOOTH SCROLL FOR ALL ANCHOR LINKS
────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", e => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const navH = navbar.offsetHeight;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
    window.scrollTo({ top, behavior: "smooth" });
  });
});


/* ──────────────────────────────────────────────────────
   7. DASHBOARD CARD — subtle parallax on mouse move
────────────────────────────────────────────────────── */
const dcCard = document.querySelector(".dashboard-card");
if (dcCard) {
  const heroSection = document.querySelector(".hero");
  heroSection.addEventListener("mousemove", e => {
    const { left, top, width, height } = heroSection.getBoundingClientRect();
    const x = (e.clientX - left) / width  - 0.5;
    const y = (e.clientY - top)  / height - 0.5;
    dcCard.style.transform =
      `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
  });
  heroSection.addEventListener("mouseleave", () => {
    dcCard.style.transform = "";
    dcCard.style.transition = "transform .6s ease";
  });
}


/* ──────────────────────────────────────────────────────
   8. SCROLL PROGRESS INDICATOR (subtle top bar)
────────────────────────────────────────────────────── */
const progressBar = document.createElement("div");
progressBar.id = "scrollProgress";
Object.assign(progressBar.style, {
  position:   "fixed",
  top:        "0",
  left:       "0",
  height:     "3px",
  width:      "0%",
  background: "var(--accent)",
  zIndex:     "9999",
  transition: "width .1s linear",
  pointerEvents: "none",
});
document.body.prepend(progressBar);

window.addEventListener("scroll", () => {
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled     = window.scrollY / docHeight * 100;
  progressBar.style.width = scrolled + "%";
}, { passive: true });


/* ──────────────────────────────────────────────────────
   9. CURRENT YEAR IN FOOTER (auto-update)
────────────────────────────────────────────────────── */
const copyEl = document.querySelector(".footer-copy p");
if (copyEl) {
  copyEl.innerHTML = copyEl.innerHTML.replace("2025", new Date().getFullYear());
}