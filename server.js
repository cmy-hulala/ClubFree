import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { mockKit, buildMessages, check } from './lib.js';
const KEY = process.env.XAI_API_KEY, MODEL = process.env.XAI_MODEL || 'grok-4-fast', PORT = process.env.PORT || 3000;

async function grok(brief, lang) {
  const r = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, messages: buildMessages(brief, lang), response_format: { type: 'json_object' }, temperature: 0.4 }) });
  if (!r.ok) throw new Error(`xAI ${r.status}: ${await r.text()}`);
  return JSON.parse((await r.json()).choices[0].message.content);
}
http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/generate') {
      let body = ''; for await (const c of req) body += c;
      const { brief, lang = 'zh' } = JSON.parse(body || '{}');
      const kit = KEY ? await grok(brief, lang) : mockKit(brief, lang);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ mode: KEY ? `grok:${MODEL}` : 'demo', kit, issues: check(brief, kit) }));
    }
    if (req.url === '/api/status') { res.writeHead(200,{'Content-Type':'application/json'}); return res.end(JSON.stringify({ mode: KEY ? `grok:${MODEL}` : 'demo' })); }
    const f = req.url === '/' ? 'index.html' : req.url.slice(1).replace(/\.\./g, '');
    const data = await readFile(new URL('./public/' + f, import.meta.url));
    res.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') ? 'text/javascript' : 'application/json' });
    res.end(data);
  } catch (e) { res.writeHead(e.code === 'ENOENT' ? 404 : 500); res.end(String(e.message)); }
}).listen(PORT, () => console.log(`ClubFree on http://localhost:${PORT} (${KEY ? 'Grok' : 'demo mode'})`));
