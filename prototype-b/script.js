const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const filterButtons = [...document.querySelectorAll(".filter")];
const cards = [...document.querySelectorAll(".journal-card")];
const visibleCount = document.querySelector("#visible-count");
const viewer = document.querySelector(".viewer");
const viewerImage = viewer.querySelector("figure img");
const viewerTitle = viewer.querySelector("figcaption strong");
const viewerMeta = viewer.querySelector("figcaption span");
const viewerCurrent = viewer.querySelector("#viewer-current");
const viewerTotal = viewer.querySelector("#viewer-total");
const viewerClose = viewer.querySelector(".viewer__close");
const viewerPrev = viewer.querySelector(".viewer__nav--prev");
const viewerNext = viewer.querySelector(".viewer__nav--next");

let activeCards = [...cards];
let activeIndex = 0;

function closeMenu() {
  body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
  const willOpen = !body.classList.contains("menu-open");
  body.classList.toggle("menu-open", willOpen);
  menuToggle.setAttribute("aria-expanded", String(willOpen));
});

mobileMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMenu();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    cards.forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });

    activeCards = cards.filter((card) => !card.hidden);
    visibleCount.textContent = String(activeCards.length).padStart(2, "0");
  });
});

function renderViewer(index) {
  activeIndex = (index + activeCards.length) % activeCards.length;
  const card = activeCards[activeIndex];
  const sourceImage = card.querySelector("img");

  viewerImage.src = sourceImage.currentSrc || sourceImage.src;
  viewerImage.alt = sourceImage.alt;
  viewerTitle.textContent = card.dataset.title;
  viewerMeta.textContent = `${card.dataset.place} · ${card.dataset.year}`;
  viewerCurrent.textContent = String(activeIndex + 1).padStart(2, "0");
  viewerTotal.textContent = String(activeCards.length).padStart(2, "0");
}

cards.forEach((card) => {
  card.querySelector(".image-button").addEventListener("click", () => {
    activeIndex = activeCards.indexOf(card);
    renderViewer(activeIndex);
    viewer.showModal();
  });
});

viewerPrev.addEventListener("click", () => renderViewer(activeIndex - 1));
viewerNext.addEventListener("click", () => renderViewer(activeIndex + 1));
viewerClose.addEventListener("click", () => viewer.close());

viewer.addEventListener("click", (event) => {
  if (event.target === viewer) viewer.close();
});

viewer.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") renderViewer(activeIndex - 1);
  if (event.key === "ArrowRight") renderViewer(activeIndex + 1);
});

filterButtons[0].setAttribute("aria-pressed", "true");
filterButtons.slice(1).forEach((button) => button.setAttribute("aria-pressed", "false"));
