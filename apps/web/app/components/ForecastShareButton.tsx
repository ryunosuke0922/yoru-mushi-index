"use client";

import { Button } from "@astryxdesign/core/Button";
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
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

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

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }

    window.setTimeout(() => setStatus("idle"), 1800);
  }

  return (
    <Button
      label={
        status === "copied"
          ? "コピー済み"
          : status === "failed"
            ? "コピー不可"
            : "共有"
      }
      onClick={handleClick}
    />
  );
}
