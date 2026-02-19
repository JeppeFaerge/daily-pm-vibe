// script.js — simpel, kommenteret JavaScript
// Formål: Fra brugerens "fokus" generér 3 prioriterede opgaver + 1 kort ledelsesråd.
// Kører helt lokalt i browseren, ingen data sendes nogen steder.

(function () {
  // Elementer
  const focusEl = document.getElementById('focus');
  const generateBtn = document.getElementById('generate');
  const clearBtn = document.getElementById('clear');
  const resultCard = document.getElementById('result');
  const tasksList = document.getElementById('tasks');
  const adviceEl = document.getElementById('advice');
  const metaText = document.getElementById('metaText');
  const hint = document.getElementById('hint');

  // Små tekstbanker til variation (rolige, erfarne råd)
  const adviceBank = [
    "Kommuniker klart: ét mål du vil have folk til at kunne gentage efter mødet.",
    "Hold møder korte — start med forventningen: hvad sker der efter mødet?",
    "Sikre ejerskab: udpeg én ansvarlig per opgave og tjek op næste dag.",
    "Fjern blokeringer først — fremdrift kommer fra små, stadige sejre.",
    "Prioritér beslutninger over diskussioner; beslutninger skaber fremdrift."
  ];

  const genericTasks = [
    "Afklar omfang og acceptkriterier",
    "Prioritér essentielle leverancer",
    "Fjern kendte blokeringer",
    "Koordiner med afhængige teams",
    "Gennemfør hurtig risikovurdering",
    "Sæt korte checkpoints (daily / 15 min)"
  ];

  // Hjælpefunktion: simple "hash" for deterministisk valg baseret på input
  function simpleHash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return h >>> 0;
  }

  // Ekstraher nøgleord: vælg ord > 3 tegn, uden almindelige dansk/engelsk stopwords
  function extractKeywords(text) {
    if (!text) return [];
    const stop = new Set([
      "og","i","på","til","med","for","af","er","det","en","et","the","a","to","of","in","at"
    ]);
    const words = text
      .toLowerCase()
      .replace(/[^\wæøåÆØÅ\s-]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 3 && !stop.has(w));
    // Unikke og op til 3
    const uniq = [...new Set(words)];
    return uniq.slice(0, 3);
  }

  // Byg tre opgaver ud fra nøgleord (hvis der er nøgleord) ellers brug generiske
  function buildTasks(keywords) {
    const tasks = [];
    if (keywords.length === 0) {
      // Returner tre generiske forslag
      return shuffle(genericTasks).slice(0, 3);
    }

    // Templates for opgaver
    const templates = [
      kw => `Afklar scope for "${kw}" og definér acceptance criteria`,
      kw => `Prioritér leverancer relateret til "${kw}" — hvad er must-have?`,
      kw => `Identificér og fjern blokeringer på "${kw}"`,
      kw => `Book hurtig sync med nøglepersoner omkring "${kw}"`,
      kw => `Lav en lille risikovurdering for "${kw}" og mitigations`
    ];

    // For hvert keyword, vælg en template (cyklisk) og fyld op til 3
    for (let i = 0; tasks.length < 3 && i < keywords.length; i++) {
      const tpl = templates[(i) % templates.length];
      tasks.push(tpl(keywords[i]));
    }

    // Hvis stadig under 3 (fx 1 keyword), tilføj flere templates for samme kw
    let idx = 0;
    while (tasks.length < 3) {
      const kw = keywords[idx % keywords.length];
      const tpl = templates[(idx + keywords.length) % templates.length];
      const candidate = tpl(kw);
      if (!tasks.includes(candidate)) tasks.push(candidate);
      idx++;
    }

    return tasks;
  }

  // Shuffle helper (ikke krypteret) — bruges for generiske forslag
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Vælg et råd deterministisk baseret på inputhash
  function pickAdvice(text) {
    const h = simpleHash(text || ""); // tom streng hvis ingen input
    return adviceBank[h % adviceBank.length];
  }

  // Render resultat i DOM
  function showResult(tasks, advice, inputText) {
    // Ryd liste
    tasksList.innerHTML = "";
    tasks.forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      tasksList.appendChild(li);
    });

    adviceEl.textContent = advice;
    metaText.textContent = `Genereret: ${new Date().toLocaleString()}`;
    resultCard.classList.remove('hidden');
    hint.classList.add('hidden');

    // Let animation: fokus på resultat
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Event: generér
  generateBtn.addEventListener('click', () => {
    const text = focusEl.value.trim();
    const keywords = extractKeywords(text);
    const tasks = buildTasks(keywords);
    const advice = pickAdvice(text);
    showResult(tasks, advice, text);
  });

  // Event: ryd
  clearBtn.addEventListener('click', () => {
    focusEl.value = "";
    resultCard.classList.add('hidden');
    hint.classList.remove('hidden');
    focusEl.focus();
  });

  // Enter/Cmd+Enter support: Cmd/Ctrl+Enter genererer også
  focusEl.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      generateBtn.click();
    }
  });

  // Init: eventuelt forudfyld med et eksempel (fjern hvis du vil have blank start)
  // focusEl.value = "Release v1.2; QA; koordinering med design";
})();
