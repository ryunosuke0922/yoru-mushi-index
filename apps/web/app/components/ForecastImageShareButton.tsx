"use client";

import { useState } from "react";
import { colors } from "../lib/designTokens";

type ForecastImageShareButtonProps = {
  areaName: string;
  bestTime: string | null;
  date: string;
  label: string;
  probabilityBand: string;
  reasons: string[];
  score: number;
};

const imageSize = {
  width: 1200,
  height: 630,
};

export function ForecastImageShareButton({
  areaName,
  bestTime,
  date,
  label,
  probabilityBand,
  reasons,
  score,
}: ForecastImageShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "done">("idle");

  async function handleClick() {
    const blob = await createForecastImage({
      areaName,
      bestTime,
      date,
      label,
      probabilityBand,
      reasons,
      score,
    });
    const file = new File([blob], `yoru-mushi-index-${date}.png`, {
      type: "image/png",
    });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        text: `${areaName}の夜虫指数は ${score}。おすすめは ${bestTime ?? "なし"} です。`,
        title: "夜虫指数",
      });
    } else {
      downloadBlob(blob, file.name);
    }

    setStatus("done");
    window.setTimeout(() => setStatus("idle"), 1800);
  }

  return (
    <button className="image-share-button" onClick={handleClick} type="button">
      {status === "done" ? "画像を作成済み" : "画像で共有"}
    </button>
  );
}

async function createForecastImage({
  areaName,
  bestTime,
  date,
  label,
  probabilityBand,
  reasons,
  score,
}: ForecastImageShareButtonProps) {
  const canvas = document.createElement("canvas");
  canvas.width = imageSize.width;
  canvas.height = imageSize.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported.");
  }

  context.fillStyle = colors.background;
  context.fillRect(0, 0, imageSize.width, imageSize.height);
  roundRect(context, 48, 48, 1104, 534, 32);
  context.fillStyle = colors.surface;
  context.fill();
  context.strokeStyle = colors.border;
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = colors.accent;
  context.font = font(800, 24);
  context.fillText("AREA", 96, 118);

  context.fillStyle = colors.text;
  context.font = font(800, 40);
  context.fillText(areaName, 96, 168);

  pill(context, label, 920, 92, 116, 42);

  context.fillStyle = colors.green;
  context.font = font(800, 154);
  context.fillText(String(score), 96, 342);

  context.fillStyle = colors.muted;
  context.font = font(800, 28);
  context.fillText("/ 100", 282, 322);

  const chips = [
    ["日付", date],
    ["おすすめ", bestTime ?? "-"],
    ["見込み", probabilityBand],
  ];
  let chipX = 96;
  for (const [key, value] of chips) {
    const width = Math.max(
      146,
      context.measureText(`${key} ${value}`).width + 44,
    );
    metaChip(context, key, value, chipX, 404, width);
    chipX += width + 14;
  }

  context.strokeStyle = colors.border;
  context.beginPath();
  context.moveTo(668, 96);
  context.lineTo(668, 520);
  context.stroke();

  context.fillStyle = colors.accent;
  context.font = font(800, 24);
  context.fillText("REASON", 724, 118);

  context.fillStyle = colors.text;
  context.font = font(800, 28);
  reasons.slice(0, 4).forEach((reason, index) => {
    const y = 172 + index * 66;
    context.fillStyle = colors.green;
    context.beginPath();
    context.arc(732, y - 8, 4, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = colors.text;
    drawWrappedText(context, reason, 752, y, 300, 34);
  });

  context.fillStyle = colors.accent;
  context.font = font(800, 22);
  context.fillText("yoru-mushi-index", 96, 526);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) {
        resolve(value);
      } else {
        reject(new Error("Image generation failed."));
      }
    }, "image/png");
  });

  return blob;
}

function font(weight: number, size: number) {
  return `${weight} ${size}px "Hiragino Sans", "Yu Gothic", Arial, sans-serif`;
}

function pill(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  roundRect(context, x, y, width, height, height / 2);
  context.fillStyle = colors.surfaceSoft;
  context.fill();
  context.fillStyle = colors.green;
  context.font = font(800, 18);
  context.textAlign = "center";
  context.fillText(text, x + width / 2, y + 27);
  context.textAlign = "start";
}

function metaChip(
  context: CanvasRenderingContext2D,
  key: string,
  value: string,
  x: number,
  y: number,
  width: number,
) {
  roundRect(context, x, y, width, 42, 21);
  context.fillStyle = colors.surfaceSoft;
  context.fill();
  context.fillStyle = colors.muted;
  context.font = font(800, 18);
  context.fillText(key, x + 18, y + 27);
  context.fillStyle = colors.text;
  context.font = font(800, 22);
  context.fillText(value, x + 66, y + 28);
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  let line = "";
  let offsetY = 0;

  for (const character of text) {
    const candidate = `${line}${character}`;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y + offsetY);
      line = character;
      offsetY += lineHeight;
    } else {
      line = candidate;
    }
  }

  context.fillText(line, x, y + offsetY);
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
