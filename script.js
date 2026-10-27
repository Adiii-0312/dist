(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Scroll progress + active nav
  const bar = document.querySelector(".scroll-bar span");
  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (bar) bar.style.transform = `scaleX(${p})`;

    const line = window.scrollY + window.innerHeight * 0.35;
    let current = null;
    sections.forEach((s) => {
      if (s.offsetTop <= line) current = s;
    });
    links.forEach((l) => {
      l.classList.toggle("active", !!current && l.getAttribute("href") === `#${current.id}`);
    });
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // Copy email
  const copyBtn = document.querySelector("[data-copy]");
  if (copyBtn) {
    const label = copyBtn.querySelector(".copy-label");
    copyBtn.addEventListener("click", async () => {
      const text = copyBtn.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const t = document.createElement("textarea");
        t.value = text;
        document.body.appendChild(t);
        t.select();
        document.execCommand("copy");
        t.remove();
      }
      if (label) {
        label.textContent = "Copied ✓";
        window.clearTimeout(copyBtn._t);
        copyBtn._t = window.setTimeout(() => (label.textContent = "Copy email"), 2000);
      }
    });
  }

  // Reveal on scroll — only hide elements that are BELOW the fold,
  // so nothing important is ever invisible if JS is slow or fails.
  const reveals = [...document.querySelectorAll(".reveal")];
  if (!reduceMotion && "IntersectionObserver" in window) {
    const vh = window.innerHeight;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    reveals.forEach((el, i) => {
      if (el.getBoundingClientRect().top > vh * 0.95) {
        el.style.transitionDelay = `${(i % 3) * 70}ms`;
        el.classList.add("will-reveal");
        io.observe(el);
      }
    });

    // Failsafe
    window.setTimeout(() => {
      reveals.forEach((el) => el.classList.add("in"));
    }, 6000);
  }

  // Cursor spotlight on cards + global glow
  if (finePointer && !reduceMotion) {
    const glow = document.querySelector(".cursor-glow");
    let raf = 0;
    window.addEventListener(
      "pointermove",
      (e) => {
        if (glow) {
          glow.classList.add("on");
          if (!raf) {
            raf = requestAnimationFrame(() => {
              glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
              raf = 0;
            });
          }
        }
        const card = e.target.closest && e.target.closest(".card");
        if (card) {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${e.clientX - r.left}px`);
          card.style.setProperty("--my", `${e.clientY - r.top}px`);
        }
      },
      { passive: true }
    );

    // Subtle 3D tilt on portrait
    const tilt = document.querySelector(".tilt");
    if (tilt) {
      tilt.addEventListener("pointermove", (e) => {
        const r = tilt.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      });
      tilt.addEventListener("pointerleave", () => {
        tilt.style.transform = "";
      });
    }
  }
})();
