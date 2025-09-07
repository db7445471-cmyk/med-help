const fs = require('fs');
(async ()=>{
  try{
    const env = fs.readFileSync('.env','utf8');
    const m = env.match(/GEMINI_API_KEY=(.*)/);
    if (!m) { console.error('No key in .env'); process.exit(2); }
    const key = m[1].trim();
    const modelName = process.env.GEMINI_MODEL || 'models/gemini-1.5-pro-002';
    const url = `https://generativelanguage.googleapis.com/v1/models:generate?key=${encodeURIComponent(key)}`;
    console.log('URL:', url);
    const body = {
      model: modelName,
      prompt: { text: 'Short health test query' },
      temperature: 0.2,
      maxOutputTokens: 64
    };
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    console.log('STATUS', r.status);
    const txt = await r.text();
    console.log('BODY', txt);
  }catch(e){ console.error('ERR', e && e.stack ? e.stack : e); process.exit(1);} 
})();
