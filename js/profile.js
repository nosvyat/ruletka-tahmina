import { profileData } from "./profile-data.js";

const profileOverlay = document.getElementById("profileOverlay");
const profileBackdrop = document.getElementById("profileBackdrop");
const profileSheet = document.getElementById("profileSheet");
const profileClose = document.getElementById("profileClose");
const openProfile = document.getElementById("openProfile");

const profileAvatarWrap = document.getElementById("profileAvatarWrap");
const avatarViewer = document.getElementById("avatarViewer");
const avatarViewerBackdrop = document.getElementById("avatarViewerBackdrop");

const profileOnline = document.getElementById("profileOnline");
const introHeaderStatus = document.getElementById("introHeaderStatus");
const profileStatusText = document.getElementById("profileStatusText");

let currentStatusIndex = 0;
let statusInterval = null;

let touchStartY = 0;
let touchCurrentY = 0;
let isDraggingSheet = false;

function syncStatuses(statusText) {
  if (profileOnline) {
    profileOnline.textContent = statusText;
  }

  if (introHeaderStatus) {
    introHeaderStatus.textContent = statusText;
  }
}

function applyProfileData() {
  const profileName = document.querySelector(".profile-name");
  const profileAbout = document.querySelector(".profile-about");
  const profileCards = document.querySelector(".profile-cards");

  if (profileName) {
    profileName.textContent = profileData.name;
  }

  if (profileStatusText) {
    profileStatusText.textContent = profileData.mainStatus;
  }

  if (profileAbout) {
    profileAbout.innerHTML = profileData.about
      .map((text) => `<p>${text}</p>`)
      .join("");
  }

  if (profileCards) {
    profileCards.innerHTML = profileData.cards
      .map(
        (card) => `
          <div class="profile-card">
            <div class="profile-card-label">${card.label}</div>
            <div class="profile-card-value">${card.value}</div>
          </div>
        `
      )
      .join("");
  }

  syncStatuses(profileData.onlineStatuses[currentStatusIndex]);
}

function setNextStatus() {
  currentStatusIndex = (currentStatusIndex + 1) % profileData.onlineStatuses.length;
  syncStatuses(profileData.onlineStatuses[currentStatusIndex]);
}

function startStatusRotation() {
  if (statusInterval || !profileData.onlineStatuses?.length) return;
  statusInterval = setInterval(setNextStatus, 4000);
}

function stopStatusRotation() {
  if (!statusInterval) return;
  clearInterval(statusInterval);
  statusInterval = null;
}

function resetSheetPosition() {
  if (!profileSheet) return;
  profileSheet.style.transform = "";
  profileSheet.style.transition = "";
}

function openProfileSheet() {
  if (!profileOverlay) return;

  profileOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  startStatusRotation();

  requestAnimationFrame(() => {
    resetSheetPosition();
  });
}

function closeProfileSheet() {
  if (!profileOverlay) return;

  profileOverlay.classList.add("hidden");
  resetSheetPosition();
  document.body.style.overflow = "";
  stopStatusRotation();
}

function openAvatarViewer() {
  if (!avatarViewer) return;
  avatarViewer.classList.remove("hidden");
}

function closeAvatarViewer() {
  if (!avatarViewer) return;
  avatarViewer.classList.add("hidden");
}

function onTouchStart(event) {
  if (!profileSheet || !profileOverlay || profileOverlay.classList.contains("hidden")) return;

  const touch = event.touches[0];
  const scrollableContent = event.target.closest(".profile-content");

  if (scrollableContent && scrollableContent.scrollTop > 0) {
    isDraggingSheet = false;
    return;
  }

  touchStartY = touch.clientY;
  touchCurrentY = touch.clientY;
  isDraggingSheet = true;
  profileSheet.style.transition = "none";
}

function onTouchMove(event) {
  if (!isDraggingSheet || !profileSheet) return;

  touchCurrentY = event.touches[0].clientY;
  const deltaY = touchCurrentY - touchStartY;

  if (deltaY > 0) {
    profileSheet.style.transform = `translateY(${deltaY}px)`;
  }
}

function onTouchEnd() {
  if (!isDraggingSheet || !profileSheet) return;

  const deltaY = touchCurrentY - touchStartY;
  profileSheet.style.transition = "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)";

  if (deltaY > 120) {
    closeProfileSheet();
  } else {
    resetSheetPosition();
  }

  isDraggingSheet = false;
  touchStartY = 0;
  touchCurrentY = 0;
}

function onProfileKeydown(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openProfileSheet();
  }
}

function onEscapeClose(event) {
  if (event.key !== "Escape") return;

  if (avatarViewer && !avatarViewer.classList.contains("hidden")) {
    closeAvatarViewer();
    return;
  }

  if (profileOverlay && !profileOverlay.classList.contains("hidden")) {
    closeProfileSheet();
  }
}

if (openProfile) {
  openProfile.addEventListener("click", openProfileSheet);
  openProfile.addEventListener("keydown", onProfileKeydown);
}

if (profileClose) {
  profileClose.addEventListener("click", closeProfileSheet);
}

if (profileBackdrop) {
  profileBackdrop.addEventListener("click", closeProfileSheet);
}

if (profileAvatarWrap) {
  profileAvatarWrap.addEventListener("click", openAvatarViewer);
}

if (avatarViewerBackdrop) {
  avatarViewerBackdrop.addEventListener("click", closeAvatarViewer);
}

if (profileSheet) {
  profileSheet.addEventListener("touchstart", onTouchStart, { passive: true });
  profileSheet.addEventListener("touchmove", onTouchMove, { passive: true });
  profileSheet.addEventListener("touchend", onTouchEnd);
}

document.addEventListener("keydown", onEscapeClose);

applyProfileData();