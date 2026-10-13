import {mkdirSync, copyFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
mkdirSync('build/assets', {recursive: true});
copyFileSync('templates/index.html', 'build/assets/index.html');
writeFileSync('build/assets/deployment.json', JSON.stringify({repository: 'pierce403/down-horse-cloudflare', commit: execFileSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8'}).trim(), originalHerokuCommit:'0320032494748fdc683474f290c6292d7000dbab'}) + '\n');
writeFileSync('build/assets/_headers', '/deployment.json\n  Cache-Control: no-store\n');
