const siteShell = document.querySelector("#site-shell");
const dialog = document.querySelector("#image-dialog");
const dialogImage = dialog.querySelector("#dialog-image");
const dialogTitle = dialog.querySelector("#dialog-title");
const dialogStatus = dialog.querySelector("#dialog-status");
const dialogScroller = dialog.querySelector(".dialog-scroller");
const zoomRange = dialog.querySelector("#zoom-range");
const zoomValue = dialog.querySelector("#zoom-value");
const downloadLink = dialog.querySelector("#download-image");
const closeButton = dialog.querySelector("#close-dialog");
const zoomOutButton = dialog.querySelector("#zoom-out");
const zoomInButton = dialog.querySelector("#zoom-in");
const openButtons = document.querySelectorAll("[data-image-open]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const mobileMenu = document.querySelector(".mobile-menu");
const transcriptData = window.CARD_TRANSCRIPTS || {};

const benefitSearch = document.querySelector("#benefit-search");
const benefitRegion = document.querySelector("#benefit-region");
const scenicRows = [...document.querySelectorAll("[data-scenic-row]")];

function filterBenefits() {
  const query = benefitSearch.value.trim().toLocaleLowerCase();
  const region = benefitRegion.value;
  let count = 0;
  scenicRows.forEach((row) => {
    const matches = (!region || row.dataset.region === region) &&
      (!query || row.textContent.toLocaleLowerCase().includes(query));
    row.hidden = !matches;
    if (matches) count += 1;
  });
  document.querySelector("#benefit-count").textContent = `显示 ${count} / ${scenicRows.length} 项`;
  document.querySelector("#benefit-empty").hidden = count !== 0;
}

if (benefitSearch && benefitRegion) {
  benefitSearch.addEventListener("input", filterBenefits);
  benefitRegion.addEventListener("change", filterBenefits);
  document.querySelector("#benefit-reset").addEventListener("click", () => {
    benefitSearch.value = "";
    benefitRegion.value = "";
    filterBenefits();
  });
  // A link from the trip guide should reveal its target even after filtering.
  window.addEventListener("hashchange", () => {
    if (!/^#scenic-\d+$/.test(location.hash)) return;
    const target = document.querySelector(location.hash);
    if (target?.hidden) {
      benefitSearch.value = "";
      benefitRegion.value = "";
      filterBenefits();
      target.scrollIntoView({ block: "center" });
    }
  });
}

let activeTrigger = null;

document.querySelectorAll("[data-transcript]").forEach((element) => {
  const lines = transcriptData[element.dataset.transcript] || [];
  element.textContent = lines.join("\n");
});

function setZoom(value) {
  const min = Number(zoomRange.min);
  const max = Number(zoomRange.max);
  const nextValue = Math.min(max, Math.max(min, Number(value)));
  zoomRange.value = String(nextValue);
  zoomValue.textContent = `${nextValue}%`;
  dialogImage.style.width = `${nextValue}%`;
}

function showDialogStatus(message, state = "loading") {
  dialogStatus.textContent = message;
  dialogStatus.dataset.state = state;
  dialogStatus.hidden = false;
}

function hideDialogStatus() {
  dialogStatus.hidden = true;
  delete dialogStatus.dataset.state;
}

function openImage(button) {
  const imagePath = button.dataset.imageOpen;
  const imageTitle = button.dataset.imageTitle;

  activeTrigger = button;
  button.dataset.state = "loading";
  dialogTitle.textContent = imageTitle;
  dialogImage.alt = `${imageTitle}原始权益表`;
  dialogImage.hidden = true;
  dialogImage.removeAttribute("src");
  downloadLink.href = imagePath;
  downloadLink.download = imagePath.split("/").pop();
  setZoom(100);
  showDialogStatus("正在载入权益表…");

  siteShell.inert = true;
  dialog.showModal();
  dialogImage.src = imagePath;
  requestAnimationFrame(() => zoomRange.focus({ preventScroll: true }));
}

openButtons.forEach((button) => {
  button.addEventListener("click", () => openImage(button));
});

dialogImage.addEventListener("load", () => {
  dialogImage.hidden = false;
  dialogScroller.scrollTo({ top: 0, left: 0, behavior: "auto" });
  hideDialogStatus();
  if (activeTrigger) {
    activeTrigger.dataset.state = "success";
  }
});

dialogImage.addEventListener("error", () => {
  showDialogStatus("权益表未能载入。请确认 assets 文件夹与 HTML 位于同一目录后重试。", "error");
  if (activeTrigger) {
    activeTrigger.dataset.state = "error";
  }
});

zoomRange.addEventListener("input", () => setZoom(zoomRange.value));
zoomOutButton.addEventListener("click", () => setZoom(Number(zoomRange.value) - 20));
zoomInButton.addEventListener("click", () => setZoom(Number(zoomRange.value) + 20));
closeButton.addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});

dialog.addEventListener("close", () => {
  siteShell.inert = false;
  dialogImage.removeAttribute("src");
  hideDialogStatus();
  if (activeTrigger) {
    delete activeTrigger.dataset.state;
    activeTrigger.focus({ preventScroll: true });
  }
  activeTrigger = null;
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (mobileMenu?.open) {
      mobileMenu.open = false;
    }
  });
});

const observedSections = document.querySelectorAll("main > section[id]");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visibleEntry) {
      return;
    }

    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${visibleEntry.target.id}`;
      if (isCurrent) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  },
  { rootMargin: "-20% 0px -65% 0px", threshold: [0.05, 0.25, 0.5] },
);

observedSections.forEach((section) => sectionObserver.observe(section));
