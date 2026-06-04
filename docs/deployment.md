# Deployment

本番環境は Vercel で運用します。

## Production URL

```txt
https://yorumushi.com
```

`www.yorumushi.com` は `https://yorumushi.com` へ 308 redirect します。

## Vercel Project

Root Directory:

```txt
apps/web
```

Build settings:

```txt
Framework: Next.js
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm build
Output Directory: empty
```

`apps/web/vercel.json` でも framework / install / build を固定しています。

## Domains

Vercel Domains の最終形:

```txt
yorumushi.com               Production
www.yorumushi.com           308 -> yorumushi.com
yoru-mushi-index.vercel.app Production
```

Cloudflare DNS:

```txt
A      @    76.76.21.21          DNS only
CNAME  www  cname.vercel-dns.com DNS only
```

## Environment Variables

Production / Preview に設定します。

```txt
NEXT_PUBLIC_SITE_URL=https://yorumushi.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

`NEXT_PUBLIC_SITE_URL` は canonical URL、OG URL、robots.txt、sitemap.xml、共有 URL に使います。
`NEXT_PUBLIC_GA_MEASUREMENT_ID` は Google Analytics の測定 ID です。未設定の場合、Google Analytics タグは出力されません。

## Google Analytics

Google Analytics は GA4 の Web stream を使います。

Stream URL:

```txt
https://yorumushi.com/
```

タグ反映確認:

```bash
curl -sS https://yorumushi.com/ | rg "googletagmanager|G-"
```

Google Analytics 側の検出には数分から数十分かかることがあります。

## Production Smoke

```bash
curl -I https://yorumushi.com/
curl -I https://www.yorumushi.com/
curl -I https://yorumushi.com/robots.txt
curl -I https://yorumushi.com/sitemap.xml
curl -I https://yorumushi.com/area/tokyo-tama-20km-01
```

確認観点:

- `https://yorumushi.com/` が 200 を返す
- `https://www.yorumushi.com/` が `https://yorumushi.com/` へ redirect する
- canonical / OG / sitemap / robots が `https://yorumushi.com` を指す
- API レスポンスに `latitude` / `longitude` が含まれない
- Google Analytics タグが出力される
