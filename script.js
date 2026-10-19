const links = document.querySelectorAll(".menu a");
const sections = [...links]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const markActive = () => {
  const line = window.scrollY + 140;
  let current = sections[0];
  sections.forEach((section) => {
    if (section.offsetTop <= line) current = section;
  });
  links.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
  });
};

markActive();
window.addEventListener("scroll", markActive, { passive: true });

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
