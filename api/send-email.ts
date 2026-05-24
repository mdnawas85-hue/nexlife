const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY ?? '';
const MAILGUN_DOMAIN  = process.env.MAILGUN_DOMAIN ?? '';
const MAILGUN_FROM    = process.env.MAILGUN_FROM ?? `notifications@${MAILGUN_DOMAIN}`;
const MAILGUN_BASE    = 'https://api.mailgun.net';

export default async function handler(
  req: { method: string; body: { to?: string; subject?: string; html?: string; text?: string } },
  res: { status: (c: number) => { json: (d: unknown) => void } },
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { to, subject, html, text } = req.body ?? {};

  if (!to || !subject || (!html && !text)) {
    res.status(400).json({ error: 'Required: to, subject, and html or text' });
    return;
  }

  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    res.status(500).json({ error: 'Mailgun env vars not configured' });
    return;
  }

  const form = new URLSearchParams();
  form.append('from', MAILGUN_FROM);
  form.append('to', to);
  form.append('subject', subject);
  if (html)  form.append('html', html);
  if (text)  form.append('text', text);

  const auth = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');

  const mgRes = await fetch(`${MAILGUN_BASE}/v3/${MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  const data = await mgRes.json() as { id?: string; message?: string };

  if (!mgRes.ok) {
    res.status(mgRes.status).json({ error: data.message ?? 'Mailgun error' });
    return;
  }

  res.status(200).json({ id: data.id, message: data.message });
}
