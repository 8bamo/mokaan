export default async function handler(req, res) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Fallback: serve static content.json
    return res.status(307).setHeader('Location', '/content.json').end();
  }

  const r = await fetch(`${url}/get/mokaan_content`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!r.ok) {
    return res.status(307).setHeader('Location', '/content.json').end();
  }

  const { result } = await r.json();

  if (!result) {
    return res.status(307).setHeader('Location', '/content.json').end();
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(result);
}
