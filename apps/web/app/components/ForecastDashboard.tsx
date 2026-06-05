import Link from "next/link";
import type { Forecast } from "../lib/forecast";
import {
  formatHour,
  formatJstMinute,
  formatNightDate,
  moonPhaseName,
  nightLabel,
} from "../lib/format";
import { DataItem, SectionHeading } from "./PageScaffold";

type ForecastDashboardProps = {
  forecast: Forecast;
  showAreaLink?: boolean;
  showAreaName?: boolean;
};
const highlightScore = 90;

export function ForecastDashboard({
  forecast,
  showAreaLink = true,
  showAreaName = true,
}: ForecastDashboardProps) {
  const condition = forecast.condition;

  return (
    <>
      <section className="forecast-card" aria-label="今日の夜虫指数">
        <div className="forecast-main">
          <div className="area-row">
            {showAreaName ? (
              <div>
                <p className="section-kicker">AREA</p>
                <h2>{forecast.area.name}</h2>
              </div>
            ) : null}
            <p className="badge">{forecast.label}</p>
          </div>

          {showAreaLink ? (
            <div className="forecast-actions">
              <Link className="area-select-link" href="/areas">
                エリアを選ぶ
              </Link>
            </div>
          ) : null}

          <div className="score" aria-label={`夜虫指数 ${forecast.score}`}>
            <strong>{forecast.score}</strong>
            <span>/ 100</span>
          </div>

          {condition ? (
            <p className="score-context">
              {condition.time.slice(11, 13)}:00時点の条件で算出
            </p>
          ) : null}

          <div className="forecast-meta">
            <span>
              <small>対象日</small>
              <strong>{formatNightDate(forecast.date)}</strong>
            </span>
            {forecast.bestTime ? (
              <span>
                <small>おすすめ</small>
                <strong>{forecast.bestTime}</strong>
              </span>
            ) : null}
            <span>
              <small>見込み</small>
              <strong>{forecast.probabilityBand}</strong>
            </span>
          </div>
          <p className="forecast-note">
            見込みは観察条件の良さの目安です。最終計算:
            {formatJstMinute(forecast.generatedAt)}
          </p>
        </div>

        <div className="forecast-side">
          <p className="section-kicker">REASON</p>
          <div className="reasons">
            {forecast.reasons.map((reason) => (
              <div className={`reason reason-${reason.tone}`} key={reason.text}>
                <span className="dot" />
                <span>{reason.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel">
          <SectionHeading kicker="TIME" title="おすすめ時間" />
          <div className="hourly">
            {forecast.hourly.map((item) => (
              <div
                className={`hour ${isHighlightedScore(item.score) ? "hour-highlight" : ""}`}
                key={item.time}
              >
                <time>{formatHour(item.time)}</time>
                <div className="meter" aria-hidden="true">
                  <span style={{ left: `${item.score}%` }} />
                </div>
                <strong>{item.score}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <SectionHeading kicker="TAXA" title="分類別" />
          <div className="taxa">
            <div
              className={`taxon ${isHighlightedScore(forecast.taxa?.moths) ? "taxon-highlight" : ""}`}
            >
              <span>蛾</span>
              <strong>{forecast.taxa?.moths ?? "-"}</strong>
            </div>
            <div
              className={`taxon ${isHighlightedScore(forecast.taxa?.beetles) ? "taxon-highlight" : ""}`}
            >
              <span>甲虫</span>
              <strong>{forecast.taxa?.beetles ?? "-"}</strong>
            </div>
            <div
              className={`taxon ${isHighlightedScore(forecast.taxa?.aquaticInsects) ? "taxon-highlight" : ""}`}
            >
              <span>水辺の羽虫</span>
              <strong>{forecast.taxa?.aquaticInsects ?? "-"}</strong>
            </div>
          </div>
        </article>
      </section>

      {condition ? (
        <section className="data-section">
          <SectionHeading kicker="CONDITION" title="取得した条件" />
          <div className="data-grid">
            <DataItem
              label="気温"
              value={`${condition.temperature.toFixed(1)}℃`}
            />
            <DataItem
              label="湿度"
              value={`${Math.round(condition.humidity)}%`}
            />
            <DataItem
              label="風速"
              value={`${condition.windSpeed.toFixed(1)} m/s`}
            />
            <DataItem
              label="突風"
              value={`${condition.windGust.toFixed(1)} m/s`}
            />
            <DataItem
              label="降水量"
              value={`${condition.precipitation.toFixed(1)} mm`}
            />
            <DataItem
              label="雲量"
              value={`${Math.round(condition.cloudCover)}%`}
            />
            <DataItem
              label="直近 24 時間雨量"
              value={`${condition.recentRainMm24h.toFixed(1)} mm`}
            />
            <DataItem
              label="月照度"
              value={`${Math.round(condition.moonIllumination * 100)}%`}
            />
            <DataItem label="月相" value={moonPhaseName(condition.moonPhase)} />
            <DataItem
              label="月高度"
              value={`${condition.moonAltitudeDeg.toFixed(1)}°`}
            />
          </div>
        </section>
      ) : null}
    </>
  );
}

export function WeeklyForecastList({ forecasts }: { forecasts: Forecast[] }) {
  const baseDate = forecasts[0]?.date;

  return (
    <section className="data-section weekly-section">
      <SectionHeading kicker="DAILY" title="7 日分の指数" />
      <div className="daily-grid">
        {forecasts.map((forecast) => (
          <article
            className={`daily-card ${isHighlightedScore(forecast.score) ? "daily-card-highlight" : ""}`}
            key={forecast.date}
          >
            <div className="daily-card-header">
              <span>
                {baseDate ? nightLabel(forecast.date, baseDate) : forecast.date}
              </span>
              <p>{forecast.label}</p>
            </div>
            <span className="daily-date">{formatNightDate(forecast.date)}</span>
            <div className="daily-score">
              <strong>{forecast.score}</strong>
              <span>/ 100</span>
            </div>
            {forecast.bestTime ? (
              <small className="daily-best-time">
                <span>おすすめ</span>
                {forecast.bestTime}
              </small>
            ) : null}
            {forecast.condition ? (
              <div className="daily-condition">
                <span>
                  <small>時刻</small>
                  <time dateTime={forecast.condition.time}>
                    {formatHour(forecast.condition.time)}
                  </time>
                </span>
                <span>
                  <small>気温</small>
                  {forecast.condition.temperature.toFixed(1)}℃
                </span>
                <span>
                  <small>湿度</small>
                  {Math.round(forecast.condition.humidity)}%
                </span>
                <span>
                  <small>風速</small>
                  {forecast.condition.windSpeed.toFixed(1)}m/s
                </span>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function isHighlightedScore(score: number | null | undefined) {
  return typeof score === "number" && score >= highlightScore;
}
