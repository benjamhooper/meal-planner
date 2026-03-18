/**
 * Generates placeholder PWA icons for the meal planner app.
 * Run once: node scripts/generate-icons.js
 *
 * Requires: npm install --save-dev canvas
 * (or: npx -y @napi-rs/canvas) — see comments below for the napi-rs variant
 */

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const iconsDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(iconsDir, { recursive: true });

const BG_COLOR = "#16a34a";   // green-600
const FG_COLOR = "#ffffff";

function drawIcon(size, maskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  if (maskable) {
    // Maskable icons need content within the safe zone (80% of the icon)
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, size, size);
  } else {
    // Round rect background
    const r = size * 0.2;
    ctx.fillStyle = BG_COLOR;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();
  }

  // Draw a simple fork & knife icon
  ctx.fillStyle = FG_COLOR;
  ctx.strokeStyle = FG_COLOR;
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = "round";

  const cx = size / 2;
  const cy = size / 2;
  const unit = size * 0.12;

  // Fork (left)
  const forkX = cx - unit * 1.2;
  ctx.beginPath();
  ctx.moveTo(forkX, cy - unit * 1.8);
  ctx.lineTo(forkX, cy + unit * 1.8);
  ctx.stroke();
  // Fork tines
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(forkX + i * unit * 0.4, cy - unit * 1.8);
    ctx.lineTo(forkX + i * unit * 0.4, cy - unit * 0.5);
    ctx.stroke();
  }

  // Knife (right)
  const knifeX = cx + unit * 1.2;
  ctx.beginPath();
  ctx.moveTo(knifeX, cy - unit * 1.8);
  ctx.lineTo(knifeX, cy + unit * 1.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(knifeX, cy - unit * 1.8);
  ctx.lineTo(knifeX + unit * 0.8, cy - unit * 0.5);
  ctx.lineTo(knifeX, cy - unit * 0.5);
  ctx.fill();

  return canvas;
}

const icons = [
  { name: "icon-192.png", size: 192, maskable: false },
  { name: "icon-512.png", size: 512, maskable: false },
  { name: "icon-512-maskable.png", size: 512, maskable: true },
  { name: "apple-touch-icon.png", size: 180, maskable: false },
];

for (const { name, size, maskable } of icons) {
  const canvas = drawIcon(size, maskable);
  const buffer = canvas.toBuffer("image/png");
  const outPath = path.join(iconsDir, name);
  fs.writeFileSync(outPath, buffer);
  console.log(`✓ ${name} (${size}x${size})`);
}

console.log("\nIcons generated in public/icons/");
