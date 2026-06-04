"use client";

import { useState } from "react";

type ShareButtonProps = {
  text: string;
  title: string;
};

export function ShareButton({ text, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

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

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button className="share-button" onClick={handleShare} type="button">
      {copied ? "コピー済み" : "共有"}
    </button>
  );
}
