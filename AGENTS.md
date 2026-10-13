# Downhorse hosting

Production belongs to Cloudflare native Git builds from main. Keep deployment
credentials in Cloudflare. Preserve the retained Heroku source commit and slug;
do not push migrations to the heroku remote. Run npm test and check:deploy before
publishing. Preview environments use no production credentials or storage.
