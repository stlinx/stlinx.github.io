# LCB Farm Queue Cloudflare Deploy

Use Cloudflare Pages, not the standalone Hello World Worker editor.

## Free setup

Cloudflare Pages, Workers/Pages Functions, and D1 all have free tiers. This project stores one JSON row in D1, so it is very small.

## Steps

1. Cloudflare Dashboard -> Workers & Pages -> Pages -> Create project -> Upload assets.
2. Upload this whole folder: `deploy-cloudflare-pages-20260711`.
3. Create a D1 database, for example `lcb_queue_db`.
4. Open the D1 database console and run `schema.sql`.
5. Go to your Pages project -> Settings -> Functions -> D1 database bindings.
6. Add binding name `DB` and choose your D1 database.
7. Go to Settings -> Environment variables.
8. Add `ADMIN_SECRET` with a private password only you know.
9. Redeploy the Pages project.
10. Open the site, Admin -> make any edit -> when asked for admin secret, enter the same `ADMIN_SECRET`.

Public customers can read the queue. Admin saves are rejected unless the secret matches the Cloudflare environment variable.