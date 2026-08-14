document.documentElement.classList.add("js");

const revealItems = [...document.querySelectorAll(".reveal")];
const viewer = document.querySelector(".viewer");
const viewerItems = [...document.querySelectorAll("[data-viewer]")];
const viewerImage = viewer.querySelector("figure img");
const viewerCaption = viewer.querySelector("figcaption");
const viewerTitle = viewer.querySelector(".viewer__title");
const viewerCurrent = viewer.querySelector(".viewer__current");
const viewerTotal = viewer.querySelector(".viewer__total");
const closeButton = viewer.querySelector(".viewer__close");
const previousButton = viewer.querySelector(".viewer__prev");
const nextButton = viewer.querySelector(".viewer__next");

let viewerIndex = 0;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -5%" },
);

revealItems.forEach((item) => revealObserver.observe(item));

function renderViewer(index) {
  viewerIndex = (index + viewerItems.length) % viewerItems.length;
  const item = viewerItems[viewerIndex];
  const source = item.querySelector("img");

  viewerImage.src = source.currentSrc || source.src;
  viewerImage.alt = source.alt;
  viewerTitle.textContent = item.dataset.title;
  viewerCaption.textContent = item.dataset.meta;
  viewerCurrent.textContent = String(viewerIndex + 1).padStart(2, "0");
  viewerTotal.textContent = String(viewerItems.length).padStart(2, "0");
}

viewerItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    renderViewer(index);
    viewer.showModal();
  });
});

closeButton.addEventListener("click", () => viewer.close());
previousButton.addEventListener("click", () => renderViewer(viewerIndex - 1));
nextButton.addEventListener("click", () => renderViewer(viewerIndex + 1));

viewer.addEventListener("click", (event) => {
  if (event.target === viewer) viewer.close();
});

viewer.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") renderViewer(viewerIndex - 1);
  if (event.key === "ArrowRight") renderViewer(viewerIndex + 1);
});
