import type { RegionalSeason } from "@yoru-mushi-index/core";
import type { Forecast } from "../lib/forecast";

export type SeasonalNoticeProps = {
  forecast?: Pick<Forecast, "area" | "date" | "season">;
};

const seasonNotes: Record<RegionalSeason["activity"], string> = {
  veryLow: "寒さで夜虫指数が低めになる時期です。",
  low: "季節の影響で夜虫指数はやや低めです。",
  moderate: "季節の影響は穏やかで、飛びやすさはその夜の天気にも左右されます。",
  high: "季節的には虫が飛びやすい時期です。",
};

export function SeasonalNotice({ forecast }: SeasonalNoticeProps) {
  return (
    <aside className="season-notice" aria-label="季節のお知らせ">
      {forecast ? (
        <>
          <strong>
            {forecast.area.name}の{Number(forecast.date.slice(5, 7))}月
          </strong>
          <span>
            平年の平均気温は約{forecast.season.monthlyMeanTemperatureC}℃。
            {seasonNotes[forecast.season.activity]}
          </span>
        </>
      ) : (
        <>
          <strong>季節の目安</strong>
          <span>同じ月でも、虫が飛びやすい時期は地域によって異なります。</span>
        </>
      )}
    </aside>
  );
}
