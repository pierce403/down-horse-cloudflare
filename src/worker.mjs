export async function checkTarget(raw, agent, fetcher = fetch) {
  let target = raw;
  if (!target.includes(':')) target = `http://${target}`;
  try {
    const url = new URL(target);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Unsupported URL');
    // The checker addresses public websites, never private/loopback endpoints.
    const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
    if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || /^(0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) || host === '::1' || /^(fc|fd|fe[89ab])/.test(host) && host.includes(':')) throw new Error('Private address');
    const response = await fetcher(url.href, {
      headers: agent ? {'User-Agent': agent} : {},
      redirect: 'follow', signal: AbortSignal.timeout(15000),
    });
    await response.body?.cancel();
    // The original checker considers any HTTP response UP, including a 404/500.
    return `${target} is UP 200 OK`;
  } catch {
    return `${target} is DOWN`;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method Not Allowed', {status: 405, headers: {Allow: 'GET, HEAD'}});
    if (url.pathname === '/' && url.searchParams.get('u')) {
      const result = await checkTarget(url.searchParams.get('u'), request.headers.get('User-Agent'));
      return new Response(request.method === 'HEAD' ? null : result, {headers: {'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store'}});
    }
    return env.ASSETS.fetch(request);
  },
};
