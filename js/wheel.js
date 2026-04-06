import { items } from "./data.js";

let rotation = 0;

const WHEEL_SIZE = 520;
const CENTER_X = WHEEL_SIZE / 2;
const CENTER_Y = WHEEL_SIZE / 2;
const RADIUS = 238;
const SPIN_DURATION = 5200;

// создаём weighted массив (с учётом weight)
const weighted = [];
items.forEach((item, index) => {
  for (let i = 0; i < item.weight; i++) {
    weighted.push(index);
  }
});

// случайный индекс с учётом веса
function pickWeightedIndex() {
  return weighted[Math.floor(Math.random() * weighted.length)];
}

// нормализация угла
function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

// отрисовка рулетки
export function drawWheel(canvas) {
  const ctx = canvas.getContext("2d");
  const arc = (2 * Math.PI) / items.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  items.forEach((item, index) => {
    const start = index * arc - Math.PI / 2;
    const end = start + arc;
    const mid = start + arc / 2;

    // сектор
    ctx.beginPath();
    ctx.moveTo(CENTER_X, CENTER_Y);
    ctx.arc(CENTER_X, CENTER_Y, RADIUS, start, end);

    const grad = ctx.createLinearGradient(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    if (item.level === "special") {
      grad.addColorStop(0, "#e8d7b4");
      grad.addColorStop(1, "#cfa0b8");
    } else {
      grad.addColorStop(0, index % 2 ? "#e5c7d7" : "#d8d2ee");
      grad.addColorStop(1, index % 2 ? "#c88fb0" : "#a89ad6");
    }

    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.34)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // метка special
    if (item.level === "special") {
      ctx.save();
      ctx.translate(CENTER_X, CENTER_Y);
      ctx.rotate(mid);

      ctx.beginPath();
      ctx.fillStyle = "rgba(255,255,255,0.82)";
      ctx.arc(168, -36, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#9d7a2b";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("★", 168, -36);

      ctx.restore();
    }

    // emoji + текст
    ctx.save();
    ctx.translate(CENTER_X, CENTER_Y);
    ctx.rotate(mid);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "36px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(item.emoji, 208, 0);

    let fontSize = 24;
    ctx.font = `bold ${fontSize}px Arial`;

    while (ctx.measureText(item.wheelLabel).width > 92 && fontSize > 15) {
      fontSize--;
      ctx.font = `bold ${fontSize}px Arial`;
    }

    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.fillText(item.wheelLabel, 135, 0);

    ctx.restore();
  });
}

// вращение рулетки
export function spinWheel(canvas, onFinish) {
  const index = pickWeightedIndex();

  const degPerSlice = 360 / items.length;
  const targetAngle = 360 - (index * degPerSlice + degPerSlice / 2);

  const currentAngle = normalizeAngle(rotation);
  const delta = normalizeAngle(targetAngle - currentAngle);

  const extraSpins = 360 * (5 + Math.floor(Math.random() * 2));

  rotation += extraSpins + delta;
  canvas.style.transform = `rotate(${rotation}deg)`;

  setTimeout(() => {
    onFinish(items[index]);
  }, SPIN_DURATION);
}