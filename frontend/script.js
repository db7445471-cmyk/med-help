document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.tab');
  // main page search inputs (scoped to the search-section) to avoid collisions with header AI input
  const mainInputs = document.querySelectorAll('.search-section .search-input');
  const mainSearchBtn = document.getElementById('main-search');
  const resultsGrid = document.getElementById('results-grid');
  let suggestionBox;

  let activeTab = 'medicine';

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.textContent.includes('Doctor') ? 'doctor' : 'medicine';

      if (activeTab === 'doctor') {
        if (mainInputs && mainInputs[0]) mainInputs[0].placeholder = 'Enter specialization or doctor name (e.g., Cardiologist)';
      } else {
        if (mainInputs && mainInputs[0]) mainInputs[0].placeholder = 'Enter medicine name (e.g., Paracetamol, Insulin)';
      }
    });
  });

  function renderResults(items, type, opts = {}) {
    if (!items || items.length === 0) {
      resultsGrid.innerHTML = '<p>⚠️ No results found.</p>';
      return;
    }

    resultsGrid.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'result-card';
    const nearbyBadge = (opts.nearby || item.nearbyRequested) ? `<span class="nearby-badge">Nearby</span>` : '';
    card.innerHTML = `
        <div class="result-header"><h3>${item.name || item.category || 'Unknown'}</h3></div>
        <div class="result-body">
          <p class="result-info"><i class="fa-solid fa-map-marker-alt"></i> ${item.location || ''}</p>
      ${type === 'doctor' && item.phone ? `<p class="result-info"><i class="fa-solid fa-phone"></i> ${item.phone}</p>` : ''}
      ${type === 'medicine' ? `<p class="result-info">Availability: <strong>${item.availability ?? 'N/A'}</strong></p>` : ''}
      ${nearbyBadge}
        </div>
      `;
      resultsGrid.appendChild(card);
    });
  }

  if (mainSearchBtn) mainSearchBtn.addEventListener('click', async function () {
    const q = (mainInputs && mainInputs[0]) ? mainInputs[0].value.trim() : '';
    const loc = (mainInputs && mainInputs[1]) ? mainInputs[1].value.trim() : '';

    if (!q || !loc) {
      alert('Please enter both search term and location.');
      return;
    }

    resultsGrid.innerHTML = '<p>🔎 Searching...</p>';

  const origin = window.location.origin || 'http://localhost:5000';
    let url;

    if (activeTab === 'doctor') {
      url = `${origin}/api/doctors/get?location=${encodeURIComponent(loc)}&category=${encodeURIComponent(q)}`;
    } else {
      url = `${origin}/api/medicines/get?location=${encodeURIComponent(loc)}&name=${encodeURIComponent(q)}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();

        if (!res.ok) {
          resultsGrid.innerHTML = `<p>⚠️ ${data.message || 'No results found.'}</p>`;
          return;
        }

        // check nearby checkbox state in the main search form
        const mainNearby = document.querySelector('.search-section #med-nearby') || document.querySelector('.search-section #doc-nearby');
        const nearbyFlag = mainNearby ? mainNearby.checked : false;
        renderResults(data, activeTab, { nearby: nearbyFlag });
    } catch (error) {
      console.error(error);
      resultsGrid.innerHTML = '<p>❌ Error fetching data. Is the backend running?</p>';
    }
  });

  // Location suggestions
  function createSuggestionBox() {
    suggestionBox = document.createElement('div');
    suggestionBox.style.position = 'absolute';
    suggestionBox.style.background = '#fff';
    suggestionBox.style.border = '1px solid #ddd';
    suggestionBox.style.zIndex = 1000;
    suggestionBox.style.width = '300px';
    suggestionBox.style.maxHeight = '200px';
    suggestionBox.style.overflow = 'auto';
    document.body.appendChild(suggestionBox);
  }

  async function fetchLocationSuggestions(q, inputEl) {
    if (!q) {
      suggestionBox && (suggestionBox.style.display = 'none');
      return;
    }

    try {
      const origin = window.location.origin || 'http://localhost:5000';
      const res = await fetch(`${origin}/api/locations/suggest?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!suggestionBox) createSuggestionBox();
      suggestionBox.innerHTML = '';
      suggestionBox.style.display = 'block';

      // Position below input
      const rect = inputEl.getBoundingClientRect();
      suggestionBox.style.left = `${rect.left}px`;
      suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;
      suggestionBox.style.width = `${rect.width}px`;

      if (!data || data.length === 0) {
        suggestionBox.style.display = 'none';
        return;
      }

      data.forEach(loc => {
        const item = document.createElement('div');
        item.style.padding = '8px 10px';
        item.style.cursor = 'pointer';
        item.textContent = loc;
        item.addEventListener('click', () => {
          inputEl.value = loc;
          suggestionBox.style.display = 'none';
        });
        suggestionBox.appendChild(item);
      });
    } catch (err) {
      console.error('Suggestion error', err);
    }
  }

  // Hook suggestion to second input (location) inside the main search form
  const locationInput = document.querySelectorAll('.search-section .search-input')[1];
  if (locationInput) {
    locationInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      fetchLocationSuggestions(q, e.target);
    });
  }

  document.addEventListener('click', (e) => {
    if (suggestionBox && !suggestionBox.contains(e.target) && !e.target.classList.contains('search-input')) {
      suggestionBox.style.display = 'none';
    }
  });

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      if (mainNav.style.display === 'block') {
        mainNav.style.display = 'none';
      } else {
        mainNav.style.display = 'block';
      }
    });
  }

  // Page-specific wiring: Find Medicine / Find Doctors
  const medSearchBtn = document.getElementById('med-search');
  const docSearchBtn = document.getElementById('doc-search');

  async function runMedSearch() {
    const nameEl = document.getElementById('med-name');
    const locEl = document.getElementById('med-location');
  const nearbyEl = document.getElementById('med-nearby');
    if (!nameEl || !locEl) return;
    const q = nameEl.value.trim();
    const loc = locEl.value.trim();
  if (!q || !loc) { alert('Please fill both fields'); return; }
    const origin = window.location.origin || 'http://localhost:5000';
  const params = new URLSearchParams({ location: loc, name: q });
  if (nearbyEl && nearbyEl.checked) params.set('nearby', '1');
  const res = await fetch(`${origin}/api/medicines/get?${params.toString()}`);
    const data = await res.json();
  if (!res.ok) { alert(data.message || 'No results'); return; }
  const medNearby = nearbyEl && nearbyEl.checked;
  renderResults(data, 'medicine', { nearby: medNearby });
  }

  async function runDocSearch() {
  const catEl = document.getElementById('doc-category');
  const locEl = document.getElementById('doc-location');
  const nearbyEl = document.getElementById('doc-nearby');
  const queryEl = document.getElementById('doc-query');
  if (!catEl || !locEl || !queryEl) return;
  // Prefer the free-text query (name or specialty), otherwise fall back to category + location
  const freeq = queryEl.value.trim();
  const q = freeq || catEl.value.trim();
  const loc = locEl.value.trim();
  if (!q || !loc) { alert('Please provide at least a search term and a location'); return; }
    const origin = window.location.origin || 'http://localhost:5000';
  const params = new URLSearchParams({ location: loc, category: q });
  if (nearbyEl && nearbyEl.checked) params.set('nearby', '1');
  const res = await fetch(`${origin}/api/doctors/get?${params.toString()}`);
    const data = await res.json();
  if (!res.ok) { alert(data.message || 'No results'); return; }
  const docNearby = nearbyEl && nearbyEl.checked;
  renderResults(data, 'doctor', { nearby: docNearby });
  }

  if (medSearchBtn) medSearchBtn.addEventListener('click', runMedSearch);
  if (docSearchBtn) docSearchBtn.addEventListener('click', runDocSearch);

  // support Enter key on doc-query to search
  const docQueryInput = document.getElementById('doc-query');
  if (docQueryInput) {
    docQueryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runDocSearch();
      }
    });
  }

  // Contact form: simple client-side handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cname').value.trim();
      const email = document.getElementById('cemail').value.trim();
      const msg = document.getElementById('cmsg').value.trim();
      if (!name || !email || !msg) { alert('Please complete all fields'); return; }
      // For demo, just show a message
      alert('Thanks, ' + name + '! Your message was received (demo).');
      contactForm.reset();
    });
  }

  // Header AI quick health query
  const aiInput = document.getElementById('ai-header-input');
  const aiBtn = document.getElementById('ai-header-btn');
  const aiModal = document.getElementById('ai-modal');
  const aiModalPre = document.getElementById('ai-modal-pre');
  const aiModalClose = document.getElementById('ai-modal-close');

  function showAiModal(text) {
    aiModalPre.textContent = text;
    aiModal.style.display = 'block';
  }
  function hideAiModal() { aiModal.style.display = 'none'; }

  if (aiModalClose) aiModalClose.addEventListener('click', hideAiModal);

  let lastAi = 0;
  if (aiBtn && aiInput) {
    aiBtn.addEventListener('click', async () => {
      const q = aiInput.value.trim();
      if (!q) return alert('Please type a health-related question.');
      // Basic client-side debounce/rate limit
      const now = Date.now();
      if (now - lastAi < 2000) return alert('Please wait a moment before sending another question.');
      lastAi = now;

      showAiModal('⏳ Asking the health assistant...');

      try {
        const origin = window.location.origin || 'http://localhost:5000';
        const res = await fetch(`${origin}/api/ai/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: q })
        });
        const data = await res.json();
        if (!res.ok) {
          // Handle missing API key as a friendly downtime message
          if (res.status === 503 || data.code === 'NO_AI_KEY') {
            showAiModal('Health assistant is temporarily unavailable. Please try again later.');
            return;
          }
          showAiModal(`Error: ${data.message || 'AI request failed.'}`);
          return;
        }
        const answer = data.answer || data.output || 'No answer returned.';
        showAiModal(answer + '\n\nDisclaimer: This is informational only and not medical advice.');
      } catch (err) {
        console.error('AI request failed', err);
        showAiModal('❌ Failed to contact the health assistant. Try again later.');
      }
    });
  }

  // AI specialist suggestions while typing
  let aiSuggestBox;
  function createAiSuggest() {
    aiSuggestBox = document.createElement('div');
    aiSuggestBox.className = 'ai-suggest-box';
    document.body.appendChild(aiSuggestBox);
  }

  async function fetchAiSuggestions(q, inputEl) {
    if (!q) { if (aiSuggestBox) aiSuggestBox.style.display = 'none'; return; }
    try {
      const origin = window.location.origin || 'http://localhost:5000';
      const res = await fetch(`${origin}/api/ai/suggest-specialist?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      const list = json.suggestions || [];
      if (!aiSuggestBox) createAiSuggest();
      aiSuggestBox.innerHTML = '';
      aiSuggestBox.style.display = 'block';

      const rect = inputEl.getBoundingClientRect();
      aiSuggestBox.style.left = `${rect.left}px`;
      aiSuggestBox.style.top = `${rect.bottom + window.scrollY}px`;
      aiSuggestBox.style.width = `${rect.width}px`;

      list.forEach(s => {
        const div = document.createElement('div');
        div.className = 'ai-suggest-item';
        div.textContent = s;
        div.addEventListener('click', () => {
          // prefill input and optionally switch to doctor search
          aiInput.value = `I have a problem related to ${s}. Please advise.`;
          aiSuggestBox.style.display = 'none';
          // Also open doctor tab and prefill doctor search inputs if present
          const tabs = document.querySelectorAll('.tab');
          tabs.forEach(t => t.classList.remove('active'));
          const docTab = Array.from(tabs).find(t => t.textContent.includes('Doctor'));
          if (docTab) docTab.classList.add('active');
          const mainInputs = document.querySelectorAll('.search-input');
          if (mainInputs && mainInputs.length >= 2) {
            mainInputs[0].value = s; // specialization
            // focus location
            mainInputs[1].focus();
          }
        });
        aiSuggestBox.appendChild(div);
      });
    } catch (err) {
      console.error('Suggestion fetch failed', err);
    }
  }

  if (aiInput) {
    let aiTimer = 0;
    aiInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      clearTimeout(aiTimer);
      aiTimer = setTimeout(() => fetchAiSuggestions(q, e.target), 300);
    });
  }

  document.addEventListener('click', (e) => {
    if (aiSuggestBox && !aiSuggestBox.contains(e.target) && e.target !== aiInput) {
      aiSuggestBox.style.display = 'none';
    }
  });
});
