export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, content } = req.body;

  const serverPassword = process.env.ADMIN_PASSWORD || 'mokaan2026';
  if (!password || password !== serverPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO || '8bamo/mokaan';

  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not set in Vercel environment variables' });
  }

  const apiUrl = `https://api.github.com/repos/${repo}/contents/content.json`;

  // Get current file SHA
  const getRes = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json'
    }
  });

  if (!getRes.ok) {
    return res.status(500).json({ error: `GitHub fetch failed: ${getRes.status}` });
  }

  const file    = await getRes.json();
  const encoded = Buffer.from(JSON.stringify(content, null, 2) + '\n').toString('base64');

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'CMS: update content.json',
      content: encoded,
      sha: file.sha
    })
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    return res.status(500).json({ error: `GitHub commit failed: ${putRes.status}`, detail: err });
  }

  return res.status(200).json({ ok: true });
}
