const express = require('express');
const fetch = global.fetch || require('node-fetch');

const router = express.Router();

// GET /api/ai/status -> returns whether AI key is configured (safe admin/info)
router.get('/status', (req, res) => {
  const configured = !!process.env.GEMINI_API_KEY;
  res.json({ aiEnabled: configured });
});

// Basic health keyword whitelist for domain restriction
const HEALTH_KEYWORDS = [
  'health','doctor','medicine','symptom','symptoms','treatment','diagnosis','pharmacy','clinic','hospital','vaccine','fever','pain','infection','allergy','prescription','dose','emergency','medical','illness','disease','therapy','surgery','medication','patient','healthcare','wellness','injury','wound','bleeding','nausea','vomiting','diarrhea','constipation','headache','migraine','fatigue','weakness','dizziness','chest pain','shortness of breath','cough','cold','flu','covid','diabetes','hypertension','blood pressure','heart','lung','kidney','liver','stomach','brain','cancer','tumor','rash','itch','swelling','inflammation'
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
    console.warn('GEMINI_API_KEY not set; AI requests will be unavailable.');
    return res.status(503).json({
      message: 'Health assistant is temporarily unavailable. Please try again later or contact a healthcare professional.',
      code: 'NO_AI_KEY'
    });
  }

  try {
    // Use the correct Gemini API endpoint and format
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `You are a helpful medical assistant. Provide accurate, safe, and concise health information. Always recommend consulting healthcare professionals for serious concerns. User query: ${userQuery}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return res.status(502).json({ 
        message: 'AI service temporarily unavailable. Please try again later.',
        detail: response.status === 429 ? 'Rate limit exceeded' : 'Service error'
      });
    }

    const data = await response.json();
    
    // Extract the response text from Gemini's response format
    let answer = 'Sorry, I could not generate a response.';
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        answer = candidate.content.parts[0].text;
      }
    }

    res.json({ answer });
  } catch (err) {
    console.error('AI route error:', err);
    res.status(500).json({ 
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

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

module.exports = router;