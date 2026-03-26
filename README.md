# QIYMET.AZ

Azərbaycan supermarketlərində məhsul qiymətlərini müqayisə etmək üçün Cloudflare Workers + D1 üzərində qurulmuş MVP.

## Lokal işə salma

Tələblər:
- Node.js 20+
- Wrangler CLI (npm ilə gəlir)

Addımlar:
1. `npm ci`
2. `cp .env.example .dev.vars`
3. Frontend üçün bir terminalda `npm run dev`
4. Worker üçün ikinci terminalda `npm run dev:worker`
5. Lokal D1 migrasiyası üçün `npm run db:migrate`

> Qeyd: `vite.config.ts` içində `/api` sorğuları lokal worker-ə (`127.0.0.1:8787`) proxy olunur.

## Build və yoxlama

```bash
npm run lint
npm run build
```

## D1 migrasiyaları

Lokal:
```bash
npm run db:migrate
```

Production:
```bash
npm run db:migrate:prod
```

## Deploy

1. `npx wrangler login`
2. `npx wrangler d1 create qiymet_db`
3. Qaytaran `database_id` dəyərini `wrangler.toml` faylına yaz
4. İstəyə görə `npx wrangler secret put IMAGE_PROXY_ALLOWED_HOSTS`
5. `npm run db:migrate:prod`
6. `npm run deploy`

## Xəritə davranışı

Layihənin daxilində Google Maps SDK istifadə olunmur.
Filiallar üçün “Yol tarifi aç” və “Xəritədə aç” düymələri xarici xəritə servisində açılır. Bu yanaşma əlavə API/billing tələb etmir.
