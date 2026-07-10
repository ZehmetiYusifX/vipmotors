# Deploy — VIP Motors landing

Production is a Docker container (`vipmotors-landing`, port 3000) behind nginx on
the server, built from this repo. Deploy is **one command**.

## First time (each developer, once)

```bash
npm run deploy:setup
```

This installs your SSH key on the server. You'll be asked for the **shared server
password once** — it is never stored. After this you never type a password again.

> Ask a teammate for the shared server password if you don't have it.

## Every deploy

```bash
npm run deploy
```

That's it. This will:

1. `git push origin main`
2. SSH to the server (with your key), `git pull`
3. `docker compose build` — **the live site stays up on the old container until the build succeeds**, so a broken build can't take the site down
4. `docker compose up -d` — recreate the container (the API keys in `env_file` are applied automatically)
5. Health-check `https://vipmotors.az/` and confirm `GEMINI_API_KEY` is set inside the container

If any step fails the script stops and tells you why.

## Where secrets live

- **API keys** (`GEMINI_API_KEY`, `NEXT_PUBLIC_API_BASE_URL`) live **only on the
  server** in `/root/frontend-env`. They are referenced by `docker-compose.yml`
  (`env_file:`) but never committed. This is why the chat can never silently lose
  its key on a recreate again.
- **Your SSH key** lives only on your machine (`~/.ssh/id_ed25519`).
- Nothing secret is in this repo.

## Config

Non-secret settings (server host, path, health URL) are in
[`deploy.config.sh`](deploy.config.sh). You normally don't touch this.

## Troubleshooting

- **`npm run deploy` says "Cannot SSH with a key"** → run `npm run deploy:setup`.
- **Health-check fails** → the deploy already rebuilt; check the container:
  `ssh root@<host> "docker logs --tail 50 vipmotors-landing"`.
- **Changes not showing** → confirm the deploy printed `SERVER_DEPLOY_OK` and the
  container was recreated (`docker ps` shows a fresh uptime).
