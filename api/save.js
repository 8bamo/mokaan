export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, content } = req.body;

  const serverPassword = process.env.ADMIN_PASSWORD || 'mokaan2026';
  if (!password || password !== serverPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ error: 'UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set in Vercel environment variables' });
  }

  const r = await fetch(`${url}/set/mokaan_content`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(JSON.stringify(content))
  });

  if (!r.ok) {
    return res.status(500).json({ error: 'Redis write failed: ' + r.status });
  }

  return res.status(200).json({ ok: true });
}
