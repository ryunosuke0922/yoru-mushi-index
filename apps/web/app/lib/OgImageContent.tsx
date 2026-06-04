import { colors } from "./designTokens";
import { siteConfig } from "./seo";

export function OgImageContent() {
  return (
    <div
      style={{
        alignItems: "center",
        background: colors.background,
        color: colors.text,
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: 72,
        width: "100%",
      }}
    >
      <div
        style={{
          border: `1px solid ${colors.border}`,
          borderRadius: 44,
          display: "flex",
          flexDirection: "column",
          gap: 32,
          height: "100%",
          justifyContent: "space-between",
          padding: 64,
          width: "100%",
        }}
      >
        <div
          style={{
            color: colors.accent,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "0.16em",
          }}
        >
          NIGHT INSECT FORECAST
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              color: colors.green,
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              color: colors.muted,
              fontSize: 34,
              fontWeight: 700,
              lineHeight: 1.45,
              width: 900,
            }}
          >
            気象条件と月明かりから、今夜の夜間昆虫の飛翔条件を推定します。
          </div>
        </div>
        <div
          style={{
            color: colors.accent,
            fontSize: 26,
            fontWeight: 800,
          }}
        >
          yoru-mushi-index
        </div>
      </div>
    </div>
  );
}
