"use client";

import { useState } from "react";

type ShareButtonProps = {
  text: string;
  title: string;
  url: string;
};

export function ShareButton({ text, title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
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
    <button className="share-button" onClick={handleShare} type="button">
      {copied ? "コピー済み" : "共有"}
    </button>
  );
}
