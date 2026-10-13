# Downhorse

A public website status checker, migrated from the retained Heroku application.
# Cloudflare migration

The exact Heroku Git source is retained at
`0320032494748fdc683474f290c6292d7000dbab`. The original Python requirements are
in `heroku-recovery/`; restoring that old commit preserves its original layout.

Cloudflare native Git builds publish `main` with `npm run build` and `npm run deploy`.
No Cloudflare deployment credentials belong in GitHub. `npm ci`, `npm test` and
`npm run check:deploy` validate the locked dependency graph and actual Worker.
Staging is `wrangler deploy --env staging`; it has no database or secrets.

The homepage and `/?u=...` checker are preserved. An HTTP response means UP,
including upstream error responses, as in the original app. Network failure means
DOWN. The Worker cancels response bodies instead of buffering arbitrary websites,
bounds fetches to 15 seconds and rejects non-HTTP, credential-bearing and private
address URLs. Results are plain text. Unknown paths return real 404s.
`/deployment.json` identifies the source commit independently of deployment API
evidence. No custom domain is currently configured for this app.

Production is https://down-horse.bcrt43.workers.dev, built natively from public
main. Hosted Worker checks pass and the original Heroku dyno is stopped. Retain
its slug/history and configuration; permanent deletion is outside migration scope.
