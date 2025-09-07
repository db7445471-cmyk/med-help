const fs = require('fs');
(async ()=>{
  try{
    const env = fs.existsSync('.env') ? fs.readFileSync('.env','utf8') : process.env;
    let key = null;
    if (typeof env === 'string'){
      const m = env.match(/GEMINI_API_KEY=(.*)/);
      if (m) key = m[1].trim();
    } else if (process.env.GEMINI_API_KEY){
      key = process.env.GEMINI_API_KEY;
    }
    if(!key){ console.error('GEMINI_API_KEY not found'); process.exit(2); }

  const modelName = process.env.GEMINI_MODEL || 'models/gemini-1.5-pro-002';
  const url = `https://generativelanguage.googleapis.com/v1/${modelName}:generate?key=${encodeURIComponent(key)}`;
    console.log('URL:', url);

    const body = {
      prompt: { text: 'This is a short health test query' },
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
  }catch(e){
    console.error('ERROR', e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
