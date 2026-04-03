import { waitingPhrases, TAHMINA_USERNAME } from "./data.js";
import { drawWheel, spinWheel } from "./wheel.js";

// DOM
const introScreen = document.getElementById("introScreen");
const wheelScreen = document.getElementById("wheelScreen");
const openSurprise = document.getElementById("openSurprise");
const introTextEl = document.getElementById("introText");

const canvas = document.getElementById("wheel");
const spin = document.getElementById("spin");

const waitBox = document.getElementById("waitBox");
const waitText = document.getElementById("waitText");

const resultCard = document.getElementById("resultCard");
const resultTop = document.getElementById("resultTop");
const resultLabel = document.getElementById("resultLabel");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const resultKind = document.getElementById("resultKind");

const share = document.getElementById("share");
const sendBtn = document.getElementById("sendBtn");
const confetti = document.getElementById("confetti");

// sounds
const clickSound = new Audio("sounds/click.mp3");
const spinSound = new Audio("sounds/spin.mp3");
const winSound = new Audio("sounds/win.mp3");
const bgMusic = new Audio("sounds/bg.mp3");

clickSound.volume = 0.45;
spinSound.volume = 0.35;
winSound.volume = 0.7;
bgMusic.volume = 0.22;

clickSound.preload = "auto";
spinSound.preload = "auto";
winSound.preload = "auto";
bgMusic.preload = "auto";

bgMusic.loop = true;

// state
let musicStarted = false;
let audioUnlocked = false;
let busy = false;
let current = null;
let waitInterval = null;

/* ===== INTRO TYPING ===== */

const introLines = [
  "Привет ✨",
  "Это рулетка подарков для Тахмины.",
  "Покрути её и узнай, какой сюрприз ты можешь отправить ей 💝"
];

let introSkipped = false;
let activeTypingTimer = null;

// init
drawWheel(canvas);

// helpers
function showScreen(screen) {
  [introScreen, wheelScreen].forEach(item => item.classList.remove("active"));
  screen.classList.add("active");
}

function playSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function startBgMusic() {
  if (musicStarted) return;

  musicStarted = true;
  bgMusic.play().catch(() => {
    musicStarted = false;
  });
}

function unlockAudio() {
  if (audioUnlocked) return;

  audioUnlocked = true;

  [clickSound, spinSound, winSound, bgMusic].forEach(audio => {
    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
      })
      .catch(() => {});
  });
}

function playWinSound() {
  const sound = new Audio("sounds/win.mp3");
  sound.volume = 0.7;
  sound.preload = "auto";
  sound.play().catch(() => {});
}

function getWaitPhrase() {
  return waitingPhrases[Math.floor(Math.random() * waitingPhrases.length)];
}

function startWaitingPhrases() {
  waitText.textContent = getWaitPhrase();

  waitInterval = setInterval(() => {
    waitText.textContent = getWaitPhrase();
  }, 1300);
}

function stopWaitingPhrases() {
  clearInterval(waitInterval);
  waitInterval = null;
}

function showResult(item) {
  current = item;

  nameEl.textContent = `${item.label} ${item.emoji}`;
  textEl.textContent = item.text;

  if (item.level === "special") {
    resultTop.textContent = "Для Тахмины можно отправить особенный подарок ✨";
    resultLabel.textContent = "Особенный подарок";
    resultKind.textContent = "Уровень: особенный";
    resultCard.classList.add("special");
  } else {
    resultTop.textContent = "Для Тахмины можно отправить 💖";
    resultLabel.textContent = "Милый подарок";
    resultKind.textContent = "Уровень: милый";
    resultCard.classList.remove("special");
  }

  waitBox.classList.remove("show");
  resultCard.classList.add("show");
  share.classList.add("show");
  confetti.classList.add("show");

  spin.style.display = "none";
  spin.disabled = true;
  busy = true;

  playWinSound();
}

function shareText(item) {
  const levelText = item.level === "special" ? "особенный подарок" : "милый подарок";

  return `🎁 Для Тахмины выбран подарок: ${item.label} ${item.emoji}
💖 Это ${levelText}!

${item.text}

Надеюсь, тебе будет приятно ✨`;
}

function sendToTelegram(item) {
  if (!item) return;

  let draft = shareText(item);

  if (draft.startsWith("@")) {
    draft = " " + draft;
  }

  const encDraft = encodeURIComponent(draft);
  const tgLink = `tg://resolve?domain=${TAHMINA_USERNAME}&text=${encDraft}`;
  const httpsLink = `https://t.me/${TAHMINA_USERNAME}?text=${encDraft}`;

  let timerId = null;

  const cancelFallback = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        cancelFallback();
      }
    },
    { once: true }
  );

  window.location.href = tgLink;

  timerId = setTimeout(() => {
    if (!document.hidden) {
      window.location.href = httpsLink;
    }
  }, 1200);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function typeText(element, text, speed = 42) {
  return new Promise(resolve => {
    let i = 0;
    element.textContent = "";
    element.classList.add("typing-cursor");

    const tick = () => {
      if (introSkipped) {
        element.textContent = text;
        element.classList.remove("typing-cursor");
        activeTypingTimer = null;
        resolve();
        return;
      }

      element.textContent += text.charAt(i);
      i++;

      if (i >= text.length) {
        element.classList.remove("typing-cursor");
        activeTypingTimer = null;
        resolve();
        return;
      }

      activeTypingTimer = setTimeout(tick, speed);
    };

    tick();
  });
}

async function showIntroTyping() {
  if (!introTextEl || !openSurprise) return;

  introTextEl.innerHTML = "";
  openSurprise.classList.add("hidden");
  openSurprise.classList.remove("show");

  for (const line of introLines) {
    const lineEl = document.createElement("div");
    lineEl.className = "intro-line";
    introTextEl.appendChild(lineEl);

    if (!introSkipped) {
      await wait(250);
    }

    await typeText(lineEl, line, 42);

    if (!introSkipped) {
      await wait(350);
    }
  }

  openSurprise.classList.remove("hidden");

  requestAnimationFrame(() => {
    openSurprise.classList.add("show");
  });
}

function finishIntroAndOpenWheel() {
  introSkipped = true;

  if (activeTypingTimer) {
    clearTimeout(activeTypingTimer);
    activeTypingTimer = null;
  }

  playSound(clickSound);
  startBgMusic();
  showScreen(wheelScreen);
}

// events
window.addEventListener("click", unlockAudio, { once: true });
window.addEventListener("touchstart", unlockAudio, { once: true });

openSurprise.addEventListener("click", () => {
  finishIntroAndOpenWheel();
});

spin.addEventListener("click", () => {
  if (busy) return;

  playSound(clickSound);
  playSound(spinSound);

  busy = true;
  spin.disabled = true;

  share.classList.remove("show");
  confetti.classList.remove("show");
  resultCard.classList.remove("show");
  resultCard.classList.remove("special");
  waitBox.classList.add("show");

  startWaitingPhrases();

  spinWheel(canvas, (item) => {
    stopWaitingPhrases();
    showResult(item);
  });
});

sendBtn.addEventListener("click", () => {
  playSound(clickSound);
  sendToTelegram(current);
});

// start intro
showIntroTyping();
