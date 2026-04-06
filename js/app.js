import "./profile.js";
import { waitingPhrases, chibiPhrases, TAHMINA_USERNAME } from "./data.js";
import { drawWheel, spinWheel } from "./wheel.js";

// DOM
const introScreen = document.getElementById("introScreen");
const wheelScreen = document.getElementById("wheelScreen");
const openSurprise = document.getElementById("openSurprise");

const introChatMessages = document.getElementById("introChatMessages");
const introThoughts = document.getElementById("introThoughts");
const introThoughtsText = document.getElementById("introThoughtsText");
const introTypingCursor = document.getElementById("introTypingCursor");
const introChibiIdle = document.getElementById("introChibiIdle");
const introChibiPoint = document.getElementById("introChibiPoint");
const introHeaderStatus = document.getElementById("introHeaderStatus");

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

// chibi UI
const chibiWrap = document.getElementById("chibiWrap");
const chibiCharacter = document.getElementById("chibiCharacter");
const chibiBubble = document.getElementById("chibiBubble");

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

// chibi state
let characterState = "idle"; // idle | spinning | result
let bubbleInterval = null;

/* ===== INTRO CHAT TYPING ===== */

const introLines = [
  "Привет… Не отвлекайся.",
  "У меня для тебя есть кое-что поинтереснее 😉",
  "Сегодня тебе явно повезло.",
  "Это не просто кнопка… Это рулетка подарков для Тахмины 🎁",
  "Я уже догадываюсь, что тебе выпадет…",
  "Но всё равно придётся рискнуть 😏",
  "Давай проверим… насколько ты смелый.",
  "Расслабься. Я же сильнейший 😌",
  "Не заставляй меня ждать…",
  "Ну что… повеселимся? 😏"
];

let introSkipped = false;
let activeTypingTimer = null;

// скорости интро
const INTRO_TYPING_SPEED = 42;
const INTRO_BUBBLE_SHOW_DELAY = 350;
const INTRO_AFTER_TYPED_DELAY = 550;
const INTRO_AFTER_SENT_DELAY = 700;
const INTRO_FINAL_PAUSE = 700;

// init
drawWheel(canvas);
initChibi();

/* ===== HELPERS ===== */

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

function getRandomPhrase(state) {
  const list = chibiPhrases[state] || [];
  if (!list.length) return "";
  return list[Math.floor(Math.random() * list.length)];
}

function setBubbleText(text) {
  if (!chibiBubble) return;
  chibiBubble.textContent = text;
}

function stopBubbleRotation() {
  if (bubbleInterval) {
    clearInterval(bubbleInterval);
    bubbleInterval = null;
  }
}

function startBubbleRotation(state, interval = 2200) {
  stopBubbleRotation();
  setBubbleText(getRandomPhrase(state));

  bubbleInterval = setInterval(() => {
    setBubbleText(getRandomPhrase(state));
  }, interval);
}

function setCharacterState(state) {
  characterState = state;

  if (chibiWrap) {
    chibiWrap.dataset.state = state;
  }

  if (chibiCharacter) {
    chibiCharacter.dataset.state = state;
  }

  if (chibiBubble) {
    chibiBubble.dataset.state = state;
  }

  if (state === "idle") {
    startBubbleRotation("idle", 2600);
  } else if (state === "spinning") {
    startBubbleRotation("spinning", 1700);
  } else if (state === "result") {
    startBubbleRotation("result", 2000);
  }
}

function initChibi() {
  if (!chibiWrap || !chibiCharacter || !chibiBubble) return;
  setCharacterState("idle");
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

  setCharacterState("result");
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

/* ===== INTRO UI ===== */

function setIntroHeaderStatus(text) {
  if (!introHeaderStatus) return;
  introHeaderStatus.textContent = text;
}

function setIntroChibiMode(mode) {
  if (!introChibiIdle || !introChibiPoint) return;

  introChibiIdle.classList.remove("is-active");
  introChibiPoint.classList.remove("is-active");

  if (mode === "point") {
    introChibiPoint.classList.add("is-active");
  } else {
    introChibiIdle.classList.add("is-active");
  }
}

function showIntroThoughtBubble() {
  if (!introThoughts) return;
  introThoughts.classList.add("show");
}

function hideIntroThoughtBubble() {
  if (!introThoughts) return;
  introThoughts.classList.remove("show");
}

function clearIntroThoughtText() {
  if (introThoughtsText) {
    introThoughtsText.textContent = "";
  }
}

function showIntroCursor() {
  if (!introTypingCursor) return;
  introTypingCursor.classList.remove("hidden");
}

function hideIntroCursor() {
  if (!introTypingCursor) return;
  introTypingCursor.classList.add("hidden");
}

function getCurrentMessageTime() {
  const now = new Date();
  return now.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function addIntroChatMessage(text) {
  if (!introChatMessages) return;

  const msg = document.createElement("div");
  msg.className = "intro-chat-message";

  const textNode = document.createElement("div");
  textNode.className = "intro-chat-message-text";
  textNode.textContent = text;

  const meta = document.createElement("div");
  meta.className = "intro-chat-message-meta";

  const time = document.createElement("span");
  time.className = "intro-chat-message-time";
  time.textContent = getCurrentMessageTime();

  const status = document.createElement("span");
  status.className = "intro-chat-message-status";
  status.textContent = "✓✓";

  meta.appendChild(time);
  meta.appendChild(status);

  msg.appendChild(textNode);
  msg.appendChild(meta);

  introChatMessages.appendChild(msg);
  introChatMessages.scrollTop = introChatMessages.scrollHeight;
}

function typeThoughtText(text, speed = INTRO_TYPING_SPEED) {
  return new Promise(resolve => {
    if (!introThoughtsText) {
      resolve();
      return;
    }

    let i = 0;
    introThoughtsText.textContent = "";
    showIntroCursor();
    setIntroHeaderStatus("печатает...");

    const tick = () => {
      if (introSkipped) {
        introThoughtsText.textContent = text;
        hideIntroCursor();
        setIntroHeaderStatus("в сети");
        activeTypingTimer = null;
        resolve();
        return;
      }

      introThoughtsText.textContent += text.charAt(i);
      i += 1;

      if (i >= text.length) {
        hideIntroCursor();
        setIntroHeaderStatus("в сети");
        activeTypingTimer = null;
        resolve();
        return;
      }

      activeTypingTimer = setTimeout(tick, speed);
    };

    tick();
  });
}

function showIntroButton() {
  if (!openSurprise) return;

  openSurprise.classList.remove("hidden");

  requestAnimationFrame(() => {
    openSurprise.classList.add("show");
  });
}

function resetIntroScene() {
  if (introChatMessages) {
    introChatMessages.innerHTML = "";
  }

  if (openSurprise) {
    openSurprise.classList.add("hidden");
    openSurprise.classList.remove("show");
  }

  clearIntroThoughtText();
  hideIntroCursor();
  setIntroChibiMode("idle");
  hideIntroThoughtBubble();
  setIntroHeaderStatus("в сети");
}

async function showIntroTyping() {
  if (!introChatMessages || !introThoughts || !introThoughtsText || !openSurprise) return;

  resetIntroScene();

  for (let i = 0; i < introLines.length; i += 1) {
    const line = introLines[i];

    if (!introSkipped) {
      await wait(INTRO_BUBBLE_SHOW_DELAY);
    }

    showIntroThoughtBubble();
    await typeThoughtText(line, INTRO_TYPING_SPEED);

    if (!introSkipped) {
      await wait(INTRO_AFTER_TYPED_DELAY);
    }

    addIntroChatMessage(line);
    setIntroHeaderStatus("в сети");

    if (!introSkipped) {
      await wait(160);
    }

    clearIntroThoughtText();
    hideIntroCursor();

    if (i !== introLines.length - 1 && !introSkipped) {
      await wait(INTRO_AFTER_SENT_DELAY);
    }
  }

  if (!introSkipped) {
    await wait(INTRO_FINAL_PAUSE);
  }

  hideIntroThoughtBubble();
  setIntroHeaderStatus("в сети");

  if (!introSkipped) {
    await wait(380);
  }

  setIntroChibiMode("point");
  showIntroButton();

  if (!introSkipped) {
    await wait(250);
  }

  showIntroThoughtBubble();
  introThoughtsText.textContent = "Жми сюда";
  hideIntroCursor();
  setIntroHeaderStatus("в сети");
}

function finishIntroAndOpenWheel() {
  introSkipped = true;

  if (activeTypingTimer) {
    clearTimeout(activeTypingTimer);
    activeTypingTimer = null;
  }

  setIntroHeaderStatus("в сети");
  playSound(clickSound);
  startBgMusic();
  showScreen(wheelScreen);

  requestAnimationFrame(() => {
    setCharacterState("idle");
  });
}

/* ===== EVENTS ===== */

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

  setCharacterState("spinning");
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

if (wheelScreen && wheelScreen.classList.contains("active")) {
  setCharacterState("idle");
}

// start intro
showIntroTyping();