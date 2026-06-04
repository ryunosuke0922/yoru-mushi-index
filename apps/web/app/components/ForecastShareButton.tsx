"use client";

import { useState } from "react";

type ForecastShareButtonProps = {
  text: string;
  title: string;
  url: string;
};

export function ForecastShareButton({
  text,
  title,
  url,
}: ForecastShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    if (navigator.share) {
      try {
        await navigator.share({
          text,
          title,
          url,
        });
        return;
      } catch {
        // Native share can be cancelled or unavailable despite feature detection.
      }
    }

    await navigator.clipboard.writeText(`${text}\n${url}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      className="forecast-share-button"
      onClick={handleClick}
      type="button"
    >
      {copied ? "コピー済み" : "共有"}
    </button>
  );
}
