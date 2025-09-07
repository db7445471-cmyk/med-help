const express = require('express');
const fetch = global.fetch || require('node-fetch');

const router = express.Router();

// Basic health keyword whitelist for domain restriction
const HEALTH_KEYWORDS = [
  'health','doctor','medicine','symptom','symptoms','treatment','diagnosis','pharmacy','clinic','hospital','vaccine','fever','pain','infection','allergy','prescription','dose','emergency'
];

function isHealthQuery(text){
  if(!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  return HEALTH_KEYWORDS.some(k => lower.includes(k));
}

// POST /api/ai/query accepts { query } OR { prompt }
router.post('/query', async (req, res) => {
  const { query, prompt, text: t, promptText } = req.body || {};
  const userQuery = (query || prompt || promptText || t || '').toString().trim();
  if (!userQuery) return res.status(400).json({ message: 'Missing query/prompt in request body' });

  if (!isHealthQuery(userQuery)) {
    return res.status(403).json({ message: 'Only health-related queries are allowed on this endpoint.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Log for server/admin, but return a safe, user-friendly message to clients
    console.warn('GEMINI_API_KEY not set; AI requests will be unavailable.');
    return res.status(503).json({
      message: 'Health assistant is temporarily unavailable. Please try again later or contact a healthcare professional.',
      code: 'NO_AI_KEY'
    });
  }

  try {
    // Use Google's Generative Language endpoint (text-bison) as default
    const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate?key=${encodeURIComponent(apiKey)}`;

    const promptTextForModel = `You are a helpful medical assistant. Answer concisely and safely. User query: ${userQuery}`;

    const body = {
      prompt: { text: promptTextForModel },
      temperature: 0.2,
      maxOutputTokens: 512
    };

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error('AI provider returned non-OK:', r.status, errText);
      return res.status(502).json({ message: 'AI provider error', detail: errText });
    }

    const j = await r.json();
    // Different versions may return content in candidates[0].content or output[0].content
    let text = null;
    if (j.candidates && j.candidates.length) {
      text = j.candidates[0].content || j.candidates[0].output || null;
    } else if (j.output && Array.isArray(j.output) && j.output.length) {
      text = j.output.map(o => o.content || o).join('\n');
    } else if (j.text) {
      text = j.text;
    } else if (j.generatedText) {
      text = j.generatedText;
    }

    if (!text) text = JSON.stringify(j);

    // Return AI text directly
    res.json({ answer: text });
  } catch (err) {
    console.error('AI route error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

// Suggest specialist(s) based on a user query (lightweight keyword mapping)
function suggestSpecialists(query) {
  if (!query || typeof query !== 'string') return ['General Practitioner'];
  const q = query.toLowerCase();
  const matches = new Set();

  const add = (name) => { if (name) matches.add(name); };

  // mapping keywords -> specialists
  if (/\b(heart|chest pain|palpitations|angina|cardiac|cardiologist)\b/.test(q)) add('Cardiologist');
  if (/\b(bone|fracture|sprain|joint|orthopedic|orthopaedic|orthopedist)\b/.test(q)) add('Orthopedist');
  if (/\b(ear|nose|throat|hearing|sinus|tonsillitis|otolaryngologist|ent)\b/.test(q)) add('ENT (Otolaryngologist)');
  if (/\b(skin|rash|acne|eczema|dermatitis|itching|dermatologist)\b/.test(q)) add('Dermatologist');
  if (/\b(brain|headache|migraine|seizure|stroke|neurologist|neurology)\b/.test(q)) add('Neurologist');
  if (/\b(depress|anxiety|mental|psychiatry|psychiatrist|suicid)\b/.test(q)) add('Psychiatrist');
  if (/\b(child|baby|pediatric|paediatric|pediatrics)\b/.test(q)) add('Pediatrician');
  if (/\b(stomach|abdominal|gastric|diarrhea|vomit|nausea|gastro)\b/.test(q)) add('Gastroenterologist');
  if (/\b(lung|cough|breath|asthma|pneumonia|pulmon)\b/.test(q)) add('Pulmonologist');
  if (/\b(diabet|thyroid|endocrine|hormone|endocrinologist)\b/.test(q)) add('Endocrinologist');
  if (/\b(kidney|renal|dialysis|nephrologist)\b/.test(q)) add('Nephrologist');
  if (/\b(urine|urinary|prostate|bladder|urologist)\b/.test(q)) add('Urologist');
  if (/\b(eye|vision|blurred vision|ophthalm|retina|ophthalmologist)\b/.test(q)) add('Ophthalmologist');
  if (/\b(allerg|allergy|anaphylaxis|allergist)\b/.test(q)) add('Allergist / Immunologist');
  if (/\b(pregn|pregnancy|obstetric|gyne|gynecology|obgyn|obstetrician|gynaecologist)\b/.test(q)) add('OB/GYN');
  if (/\b(emergency|accident|injury|trauma|emergenc)\b/.test(q)) add('Emergency Medicine');
  if (/\b(general|gp|physician|doctor|family)\b/.test(q)) add('General Practitioner');

  // fallback
  if (matches.size === 0) return ['General Practitioner'];

  // return up to 5 suggestions
  return Array.from(matches).slice(0, 5);
}

// GET /api/ai/suggest-specialist?q=...
router.get('/suggest-specialist', (req, res) => {
  const q = req.query.q || '';
  try {
    const suggestions = suggestSpecialists(q);
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
