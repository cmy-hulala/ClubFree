// ClubFree core: prompt, mock generator, checker. Written fresh for Remote Control AI (Nov 2026).
const WD = { zh: ['日','一','二','三','四','五','六'], en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] };
export const FIELDS = ['club','title','speaker','date','time','venue','deadline','agenda','description','signupLink'];
const T = s => (s && String(s).trim()) || '待補';

export function weekday(dateStr, lang = 'zh') {
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d) ? null : WD[lang][d.getDay()];
}
function gcal(b) {
  const d = (b.date || '').replace(/-/g, '');
  const [s, e] = (b.time || '19:00-21:00').split('-').map(x => (x || '').replace(':', '') + '00');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(b.title||'')}&dates=${d}T${s}/${d}T${e||s}&location=${encodeURIComponent(b.venue||'')}&ctz=Asia/Taipei`;
}
export function systemPrompt(lang) {
  return `You are ClubFree, a copywriter for student clubs. Write in ${lang==='en'?'English':'Traditional Chinese (Taiwan)'}.
Return ONLY JSON with keys: signupForm, announcementEmail, line, instagram, reminderEmail, feedbackForm, thankYouEmail.
Rules: never invent facts; any missing field must be written as 待補. Never mention fees unless given. Always write dates as YYYY/MM/DD (weekday) with the correct weekday.
announcementEmail and reminderEmail and thankYouEmail are full HTML using table layout, inline styles only, max-width 600px, exactly ONE primary CTA button. Announcement email includes this Google Calendar link: {GCAL}.
signupForm and feedbackForm are plain-text form specs (title, description, numbered questions with type and required flag).
line: <= 300 chars with emoji. instagram: caption with hashtags.`;
}
export function buildMessages(b, lang) {
  return [{ role: 'system', content: systemPrompt(lang).replace('{GCAL}', gcal(b)) },
          { role: 'user', content: 'Event brief JSON:\n' + JSON.stringify(b, null, 2) }];
}
function btn(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto"><tr><td style="background:#2563eb;border-radius:6px"><a href="${href}" style="display:inline-block;padding:12px 28px;color:#ffffff;text-decoration:none;font-weight:bold;font-family:Arial,sans-serif">${label}</a></td></tr></table>`;
}
function email(title, body, cta) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#f3f4f6"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;font-family:Arial,sans-serif;color:#111827"><tr><td style="padding:24px 32px;background:#111827;color:#ffffff;font-size:20px;font-weight:bold">${title}</td></tr><tr><td style="padding:24px 32px;font-size:15px;line-height:1.7">${body}${cta}</td></tr></table></td></tr></table></body></html>`;
}
export function mockKit(b, lang = 'zh') {
  const zh = lang !== 'en';
  const wd = weekday(b.date, lang);
  const when = b.date ? `${b.date.replace(/-/g,'/')} (${wd}) ${T(b.time)}` : '待補';
  const link = T(b.signupLink), cal = gcal(b);
  const info = zh
    ? `<p>📅 時間：${when}<br>📍 地點：${T(b.venue)}<br>🎤 講者：${T(b.speaker)}<br>⏰ 報名截止：${T(b.deadline)}</p><p>${T(b.description)}</p><p><b>流程</b><br>${T(b.agenda).replace(/\n/g,'<br>')}</p><p><a href="${cal}" style="color:#2563eb">➕ 加入 Google 日曆</a></p>`
    : `<p>📅 When: ${when}<br>📍 Where: ${T(b.venue)}<br>🎤 Speaker: ${T(b.speaker)}<br>⏰ Sign up by: ${T(b.deadline)}</p><p>${T(b.description)}</p><p><b>Agenda</b><br>${T(b.agenda).replace(/\n/g,'<br>')}</p><p><a href="${cal}" style="color:#2563eb">➕ Add to Google Calendar</a></p>`;
  const L = zh ? {
    form:`【${T(b.title)}】報名表單\n說明：${T(b.club)} 主辦，${when}，${T(b.venue)}。\n1. 姓名（簡答，必填）\n2. 系級（簡答，必填）\n3. Email（簡答，必填）\n4. 想問講者的問題（段落，選填）`,
    ann:'立即報名', line:`📣 ${T(b.club)}｜${T(b.title)}\n🎤 ${T(b.speaker)}\n📅 ${when}\n📍 ${T(b.venue)}\n⏰ 報名至 ${T(b.deadline)}\n👉 ${link}`,
    ig:`✨ ${T(b.title)} ✨\n\n${T(b.description)}\n\n🎤 ${T(b.speaker)}\n📅 ${when}\n📍 ${T(b.venue)}\n報名連結在主頁 🔗\n\n#${(b.club||'club').replace(/\s/g,'')} #社團 #講座`,
    remT:`今天見！${T(b.title)}`, rem:`<p>提醒你，活動就在今天：</p>${info}`, remC:'查看活動資訊',
    fb:`【${T(b.title)}】課後回饋\n1. 整體滿意度（1–5 線性刻度，必填）\n2. 最有收穫的部分（段落，選填）\n3. 希望下次的主題（簡答，選填）`,
    thT:`謝謝你參加 ${T(b.title)}`, th:`<p>感謝參加！花 1 分鐘填回饋，幫我們辦得更好。</p>`, thC:'填寫回饋表單'
  } : {
    form:`[${T(b.title)}] Sign-up form\nHosted by ${T(b.club)}, ${when}, ${T(b.venue)}.\n1. Name (short answer, required)\n2. Department/year (short answer, required)\n3. Email (short answer, required)\n4. Question for the speaker (paragraph, optional)`,
    ann:'Sign up now', line:`📣 ${T(b.club)} | ${T(b.title)}\n🎤 ${T(b.speaker)}\n📅 ${when}\n📍 ${T(b.venue)}\n⏰ Sign up by ${T(b.deadline)}\n👉 ${link}`,
    ig:`✨ ${T(b.title)} ✨\n\n${T(b.description)}\n\n🎤 ${T(b.speaker)}\n📅 ${when}\n📍 ${T(b.venue)}\nLink in bio 🔗\n\n#${(b.club||'club').replace(/\s/g,'')} #studentclub #talk`,
    remT:`See you today: ${T(b.title)}`, rem:`<p>Reminder: the event is today.</p>${info}`, remC:'View event details',
    fb:`[${T(b.title)}] Feedback form\n1. Overall rating (1–5 scale, required)\n2. Most useful part (paragraph, optional)\n3. Topics for next time (short answer, optional)`,
    thT:`Thanks for joining ${T(b.title)}`, th:`<p>Thanks for coming! A 1-minute feedback form helps us do better.</p>`, thC:'Give feedback'
  };
  return {
    signupForm: L.form,
    announcementEmail: email(`${T(b.club)}｜${T(b.title)}`, info, btn(link, L.ann)),
    line: L.line, instagram: L.ig,
    reminderEmail: email(L.remT, L.rem, btn(link, L.remC)),
    feedbackForm: L.fb,
    thankYouEmail: email(L.thT, L.th, btn('待補', L.thC)),
  };
}
export function check(b, kit) {
  const issues = [];
  for (const f of FIELDS) if (!b[f] || !String(b[f]).trim()) issues.push({ level:'warn', msg:`Missing field "${f}" → must appear as 待補 (not invented)` });
  const all = Object.entries(kit);
  for (const [k, v] of all) {
    const text = String(v);
    for (const m of text.matchAll(/(20\d\d)[\/\-.](\d{1,2})[\/\-.](\d{1,2})\s*[（(]\s*(?:週|星期)?([日一二三四五六]|Sun|Mon|Tue|Wed|Thu|Fri|Sat)/g)) {
      const iso = `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
      const real = [weekday(iso,'zh'), weekday(iso,'en')];
      if (!real.includes(m[4])) issues.push({ level:'error', where:k, msg:`${m[0]}: weekday should be ${real.join('/')}` });
      if (b.date && k !== 'signupForm' && iso !== b.date && !String(b.deadline||'').includes(m[1])) issues.push({ level:'error', where:k, msg:`Date ${iso} differs from brief date ${b.date}` });
    }
    if (/href="(#|待補|https?:\/\/(example\.com|xxx)[^"]*)"/i.test(text) || /forms\.gle\/(x+|your)|bit\.ly\/x+|\{\{|TODO/i.test(text)) issues.push({ level:'warn', where:k, msg:'Placeholder link found' });
    if (/(NT\$|\$\d|元|費用|fee)/i.test(text) && !/(NT\$|\$|元|費用|fee)/i.test(JSON.stringify(b))) issues.push({ level:'error', where:k, msg:'Mentions a fee not in the brief' });
    if (/Email$/i.test(k)) {
      const ctas = (text.match(/<a [^>]*padding:12px/g) || []).length;
      if (ctas !== 1) issues.push({ level:'warn', where:k, msg:`Expected 1 primary CTA, found ${ctas}` });
      if (/<style|class=/.test(text)) issues.push({ level:'warn', where:k, msg:'Use inline styles only (email-safe)' });
    }
  }
  return issues;
}
