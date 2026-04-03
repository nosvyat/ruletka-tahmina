import { items } from "./data.js";

let rotation = 0;

// создаём weighted массив (чтобы учитывать weight)
const weighted = [];
items.forEach((item, i) => {
  for (let j = 0; j < item.weight; j++) {
    weighted.push(i);
  }
});

// случайный индекс с учётом веса
function pickWeightedIndex() {
  return weighted[Math.floor(Math.random() * weighted.length)];
}

// отрисовка рулетки
export function drawWheel(canvas) {
  const ctx = canvas.getContext("2d");

  const cx = 260;
  const cy = 260;
  const r = 238;
  const arc = (2 * Math.PI) / items.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  items.forEach((item, i) => {
    const start = i * arc - Math.PI / 2;
    const end = start + arc;
    const mid = start + arc / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);

    const grad = ctx.createLinearGradient(0, 0, 520, 520);

    if (item.level === "special") {
      grad.addColorStop(0, "#ffe7a8");
      grad.addColorStop(1, "#ffb7d9");
    } else {
      grad.addColorStop(0, i % 2 ? "#ffd1e8" : "#e7dcff");
      grad.addColorStop(1, i % 2 ? "#ff9ecf" : "#cbb7ff");
    }

    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,.48)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // звёздочка для special
    if (item.level === "special") {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);

      ctx.beginPath();
      ctx.fillStyle = "rgba(255,255,255,.92)";
      ctx.arc(168, -36, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#c68b0f";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("★", 168, -36);

      ctx.restore();
    }

    // текст + emoji
    ctx.save();
    ctx.translate(cx, cy);
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

    ctx.fillText(item.wheelLabel, 135, 0);

    ctx.restore();
  });
}

// вращение рулетки
export function spinWheel(canvas, onFinish) {
  const index = pickWeightedIndex();

  const deg = 360 / items.length;
  const targetAngle = 360 - (index * deg + deg / 2);

  const currentAngle = ((rotation % 360) + 360) % 360;
  const delta = ((targetAngle - currentAngle) + 360) % 360;

  const extraSpins = 360 * (5 + Math.floor(Math.random() * 2));

  rotation += extraSpins + delta;

  canvas.style.transform = `rotate(${rotation}deg)`;

  // ждём завершение анимации
  setTimeout(() => {
    onFinish(items[index]);
  }, 5200);
}