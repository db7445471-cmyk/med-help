const fs = require('fs');
(async ()=>{
  try{
    const env = fs.readFileSync('.env','utf8');
    const m = env.match(/GEMINI_API_KEY=(.*)/);
    if (!m) { console.error('No key in .env'); process.exit(2); }
    const key = m[1].trim();
    const modelName = process.env.GEMINI_MODEL || 'models/gemini-1.5-pro-002';
    const perModelUrl = `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${encodeURIComponent(key)}`;
    const bulkUrl = `https://generativelanguage.googleapis.com/v1/models:generateContent?key=${encodeURIComponent(key)}`;

    const probes = [
      { name: 'prompt_obj', body: { prompt: { text: 'Hello from probe' } } },
      { name: 'prompt_str', body: { prompt: 'Hello from probe' } },
      { name: 'input_obj', body: { input: { text: 'Hello from probe' } } },
      { name: 'input_text', body: { inputText: 'Hello from probe' } },
      { name: 'text_field', body: { text: 'Hello from probe' } },
      { name: 'content_array', body: { content: [ { type: 'text', text: 'Hello from probe' } ] } },
      { name: 'instances', body: { instances: [ { content: 'Hello from probe' } ] } },
      { name: 'messages_simple', body: { messages: [ { author: 'user', content: [ { type: 'text', text: 'Hello from probe' } ] } ] } },
      { name: 'messages_str', body: { messages: [ { role: 'user', content: 'Hello from probe' } ] } },
      { name: 'model_in_body', body: { model: modelName, prompt: { text: 'Hello from probe' } } }
    ];

    async function tryUrl(url, body){
      try{
        const r = await fetch(url, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) });
        const txt = await r.text();
        return { status: r.status, body: txt };
      }catch(e){ return { error: String(e) }; }
    }

    for(const p of probes){
      console.log('\n--- Probe', p.name, '-> per-model');
      const res1 = await tryUrl(perModelUrl, p.body);
      console.log(res1);

      console.log('--- Probe', p.name, '-> bulk');
      const res2 = await tryUrl(bulkUrl, p.body);
      console.log(res2);
    }

  }catch(e){ console.error('ERR', e && e.stack ? e.stack : e); process.exit(1);} 
})();
