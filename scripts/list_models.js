const fs = require('fs');
(async ()=>{
  try{
    const env = fs.readFileSync('.env','utf8');
    const m = env.match(/GEMINI_API_KEY=(.*)/);
    if (!m) { console.error('No key in .env'); process.exit(2); }
    const key = m[1].trim();
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(key)}`;
    console.log('URL:', url);
    const r = await fetch(url);
    console.log('STATUS', r.status);
    const txt = await r.text();
    console.log('BODY', txt);
  }catch(e){ console.error('ERR', e && e.stack ? e.stack : e); process.exit(1);} 
})();
