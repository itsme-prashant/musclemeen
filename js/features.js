/* =====================================================================
   MuscularMen – advanced features
   Loaded after the main app script. Registers extra pages (VIEWS),
   actions (ACTIONS) and navigation entries before the app boots.
     More hub · Tools (plates, warm-ups, 1RM) · Progress photos ·
     Food log · Meal plan + grocery list · AI coach · Trainer dashboard ·
     Account & cloud sync · Install / offline controls
   ===================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     Shared setup
     ------------------------------------------------------------------ */
  Object.assign(ICON_PATHS, {
    menu: 'M4 6h16M4 12h16M4 18h16',
    camera: 'M3 8h4l2-3h6l2 3h4v12H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    chat: 'M4 5h16v11H9l-5 4z',
    users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-4 3-6 7-6s7 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c0-3-1.5-5-4-5.7',
    cloud: 'M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18z',
    calc: 'M6 3h12v18H6zM9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01',
    utensils: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2 6 0 8v10',
    cart: 'M3 4h2l2.5 11h11L21 7H6.5M9 20h.01M18 20h.01',
    download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
    plus: 'M12 5v14M5 12h14',
    trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  });

  // Navigation: Nutrition and the new pages live under "More" on phones
  NAV.splice(0, NAV.length,
    { r: 'home', icon: 'home', mobile: false },
    { r: 'today', icon: 'dumbbell', mobile: true },
    { r: 'plan', icon: 'calendar', mobile: true },
    { r: 'library', icon: 'grid', mobile: true },
    { r: 'progress', icon: 'chart', mobile: true },
    { r: 'nutrition', icon: 'leaf', mobile: false },
    { r: 'more', icon: 'menu', mobile: true },
    { r: 'profile', icon: 'user', mobile: false, top: false },
  );
  OPEN_ROUTES.push('more', 'tools', 'trainer', 'account');

  S.food = Store.get('food', {});               // { 'YYYY-MM-DD': [entries] }
  S.customFoods = Store.get('customFoods', []);
  S.grocery = Store.get('grocery', { seed: 1, checked: {} });
  S.coachChat = Store.get('coachChat', []);
  S.clients = Store.get('clients', []);
  S.account = Store.get('account', null);

  // Remember when synced data last changed on this device (for cloud sync)
  const SYNC_KEYS = ['profile', 'logs', 'measures', 'food', 'customFoods', 'settings'];
  const rawSet = Store.set.bind(Store);
  Store.set = (k, v) => { rawSet(k, v); if (SYNC_KEYS.includes(k) && !Store.__syncing) rawSet('localChangedAt', Date.now()); };

  const isHttp = () => /^https?:$/.test(location.protocol);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const sum = (arr, f) => arr.reduce((a, x) => a + (f ? f(x) : x), 0);
  const r1 = n => Math.round(n * 10) / 10;
  const pageHead = (eyebrow, title, sub) => `<section class="stack-s"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ''}</section>`;
  function openSheet(html) {
    $('#modalBody').innerHTML = html;
    $('#modal').hidden = false;
    $('.modal-card').scrollTop = 0;
    document.body.style.overflow = 'hidden';
    $('#modalClose').focus();
  }
  function download(name, text, type = 'application/json') {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ------------------------------------------------------------------
     MORE hub + install / offline
     ------------------------------------------------------------------ */
  function viewMore() {
    const items = [
      ['nutrition', 'leaf', 'Nutrition', 'Calorie & protein targets, Indian meal ideas'],
      ['food', 'utensils', 'Food log', 'Track meals from 85 Indian foods'],
      ['mealplan', 'cart', 'Meal plan & grocery list', 'Auto-plan a day that hits your targets'],
      ['tools', 'calc', 'Gym tools', 'Plate calculator, warm-up sets, 1RM calculator'],
      ['photos', 'camera', 'Progress photos', 'Private before/after comparisons'],
      ['coach', 'chat', 'AI coach', 'Ask questions about training, pain, food'],
      ['trainer', 'users', 'Trainer dashboard', 'Track clients from their backup files'],
      ['account', 'cloud', 'Account & sync', 'Back up and sync across devices'],
      ['profile', 'user', 'Profile & settings', 'Goal, injuries, language, voice coach'],
    ];
    const standalone = window.matchMedia && matchMedia('(display-mode: standalone)').matches;
    app.innerHTML = `<div class="page">
      ${pageHead('MuscularMen', t('more.title'))}
      <div class="grid-2">${items.map(([r, ic, ti, d]) => `<a class="card feature more-link" href="#/${r}"><span class="ic">${icon(ic)}</span><div><h3>${ti}</h3><p class="muted small">${d}</p></div></a>`).join('')}</div>
      <section class="card stack">
        <h2>Use it like an app</h2>
        ${standalone ? '<p class="muted">Installed ✓ – you are using the app version.</p>'
          : window.__installPrompt ? `<p class="muted">Add MuscularMen to your home screen – it opens full-screen and works offline.</p><button class="btn btn-primary btn-lg" type="button" data-action="install-app">${icon('download')} Install MuscularMen</button>`
          : `<p class="muted">${isHttp() ? 'On Android (Chrome): menu ⋮ → <strong>Install app</strong>. On iPhone (Safari): Share → <strong>Add to Home Screen</strong>.' : 'Installing and offline mode need the site to be opened from a web address (http/https), e.g. after hosting it or running the included server.'}</p>`}
        <div class="stack-s"><strong>Offline workouts</strong>
          <p class="small muted">The app itself works offline after your first visit. Demo videos and illustrations are saved as you watch them – or save them all now (about 100 MB, best on Wi-Fi).</p>
          <div class="row"><button class="btn" type="button" data-action="cache-media" ${isHttp() && 'serviceWorker' in navigator ? '' : 'disabled'}>${icon('download')} Save all videos for offline</button><span class="small muted" id="cacheStatus"></span></div>
        </div>
      </section>
    </div>`;
    updateCacheStatus();
  }
  async function updateCacheStatus() {
    const el = $('#cacheStatus');
    if (!el || !('caches' in window)) return;
    try { const c = await caches.open('tf-media-v1'); const keys = await c.keys(); el.textContent = keys.length ? `${keys.length} media files saved` : ''; } catch (e) {}
  }

  /* ------------------------------------------------------------------
     TOOLS – plate calculator, warm-up sets, 1RM
     ------------------------------------------------------------------ */
  const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
  const PLATE_COLORS = { 25: '#E5484D', 20: '#3E7BFA', 15: '#F5B014', 10: '#3DBE8B', 5: '#E8E8E8', 2.5: '#9AA0A8', 1.25: '#6B7079' };
  function platesFor(total, bar) {
    let side = (total - bar) / 2;
    if (side < 0) return { plates: [], achieved: bar, ok: total >= bar };
    const plates = [];
    PLATES.forEach(p => { while (side >= p - 1e-9) { plates.push(p); side -= p; } });
    return { plates, achieved: bar + 2 * sum(plates), ok: side < 1e-9 };
  }
  function barSVG(plates) {
    let x = 70;
    const parts = plates.map(p => {
      const h = 20 + p * 2.2, w = p >= 10 ? 9 : 6;
      const s = `<rect x="${x}" y="${40 - h / 2}" width="${w}" height="${h}" rx="2" fill="${PLATE_COLORS[p]}" stroke="#111" stroke-width=".8"/>`;
      x += w + 2;
      return s;
    }).join('');
    return `<svg viewBox="0 0 220 80" class="bar-svg" aria-hidden="true"><rect x="0" y="37" width="70" height="6" rx="2" fill="#9AA0A8"/><rect x="62" y="31" width="8" height="18" rx="2" fill="#7B8189"/>${parts}<rect x="${x}" y="37" width="${Math.max(0, 200 - x)}" height="6" rx="2" fill="#9AA0A8"/></svg>`;
  }
  function plateCard(weight, bar) {
    const r = platesFor(weight, bar);
    const counts = {};
    r.plates.forEach(p => { counts[p] = (counts[p] || 0) + 1; });
    return `${barSVG(r.plates)}
      <p><strong>Each side:</strong> ${r.plates.length ? Object.entries(counts).sort((a, b) => b[0] - a[0]).map(([p, n]) => `<span class="plate-chip" style="--pc:${PLATE_COLORS[p]}">${n} × ${p} kg</span>`).join(' ') : 'no plates – just the bar'}</p>
      ${r.ok ? '' : `<p class="small muted">Closest you can load: <strong>${r.achieved} kg</strong>.</p>`}`;
  }
  function warmups(work, bar) {
    if (!(work > bar)) return [];
    const steps = [[0, 10], [0.4, 8], [0.6, 5], [0.75, 3], [0.85, 1]];
    const out = [];
    steps.forEach(([pct, reps]) => {
      const w = pct ? Math.max(bar, roundTo(work * pct, 2.5)) : bar;
      if (!out.length || w > out[out.length - 1].w) if (w < work) out.push({ w, reps });
    });
    return out;
  }
  const TOOLS = { weight: 60, bar: 20, w1: 60, r1: 8 };
  function toolsHTML() {
    const wu = warmups(TOOLS.weight, TOOLS.bar);
    const est = TOOLS.r1 > 0 && TOOLS.w1 > 0 ? (e1rm(TOOLS.w1, TOOLS.r1) + TOOLS.w1 * 36 / (37 - Math.min(TOOLS.r1, 36))) / 2 : 0;
    return `<section class="card stack" id="plateTool">
        <h2>Plate calculator</h2>
        <div class="form-grid">
          <label class="field"><span>Target weight (kg)</span><input class="input" id="tWeight" type="number" inputmode="decimal" step="any" value="${TOOLS.weight}"></label>
          <label class="field"><span>Bar</span><select class="input" id="tBar">${[[20, 'Olympic bar – 20 kg'], [15, "Women's bar – 15 kg"], [10, 'Technique bar – 10 kg'], [7, 'EZ / small bar – 7 kg']].map(([v, l]) => `<option value="${v}" ${+TOOLS.bar === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        </div>
        <div id="plateOut">${plateCard(TOOLS.weight, TOOLS.bar)}</div>
      </section>
      <section class="card stack">
        <h2>Warm-up sets</h2>
        <p class="small muted">Ramp up to your working weight of ${TOOLS.weight} kg without tiring yourself out.</p>
        ${wu.length ? `<ul class="mini-list">${wu.map(s => `<li><span><strong>${s.w} kg</strong> × ${s.reps}</span><span>${platesFor(s.w, TOOLS.bar).plates.join(' + ') || 'bar only'}</span></li>`).join('')}<li><span><strong>${TOOLS.weight} kg</strong> – working sets</span><span>${platesFor(TOOLS.weight, TOOLS.bar).plates.join(' + ') || 'bar only'}</span></li></ul>` : '<p class="muted">Enter a working weight heavier than the bar.</p>'}
      </section>
      <section class="card stack">
        <h2>1-rep-max calculator</h2>
        <div class="form-grid">
          <label class="field"><span>Weight lifted (kg)</span><input class="input" id="tW1" type="number" inputmode="decimal" step="any" value="${TOOLS.w1}"></label>
          <label class="field"><span>Reps (1–12 most accurate)</span><input class="input" id="tR1" type="number" inputmode="numeric" value="${TOOLS.r1}"></label>
        </div>
        ${est ? `<div class="stat accent"><span class="l">Estimated 1RM</span><span class="v">${roundTo(est, 0.5)}<small> kg</small></span></div>
        <div class="table-wrap"><table><thead><tr><th>% of 1RM</th><th class="num">Weight</th><th class="num">≈ Reps</th></tr></thead><tbody>
          ${[[95, 2], [90, 4], [85, 6], [80, 8], [75, 10], [70, 12], [65, 15], [60, 20]].map(([p, reps]) => `<tr><td>${p}%</td><td class="num">${roundTo(est * p / 100, 2.5)} kg</td><td class="num">${reps}</td></tr>`).join('')}
        </tbody></table></div>` : ''}
        <p class="small muted">Average of the Epley and Brzycki formulas. Estimates only – never test a true max without a spotter.</p>
      </section>`;
  }
  function viewTools() {
    app.innerHTML = `<div class="page">${pageHead('Gym tools', 'Tools', 'Plate maths, warm-ups and strength estimates – all offline.')}<div id="toolsBody">${toolsHTML()}</div></div>`;
  }

  /* ------------------------------------------------------------------
     PROGRESS PHOTOS – stored privately in IndexedDB on this device
     ------------------------------------------------------------------ */
  const PhotoDB = {
    db: null,
    open() {
      return new Promise((res, rej) => {
        if (this.db) return res(this.db);
        if (!('indexedDB' in window)) return rej(new Error('IndexedDB unavailable'));
        const req = indexedDB.open('transformfit', 1)   /* storage name kept so existing photos survive the rename */;
        req.onupgradeneeded = () => req.result.createObjectStore('photos', { keyPath: 'id' });
        req.onsuccess = () => { this.db = req.result; res(this.db); };
        req.onerror = () => rej(req.error);
      });
    },
    async tx(mode, fn) {
      const db = await this.open();
      return new Promise((res, rej) => {
        const t = db.transaction('photos', mode), st = t.objectStore('photos'), r = fn(st);
        t.oncomplete = () => res(r && r.result);
        t.onerror = () => rej(t.error);
      });
    },
    all() { return this.tx('readonly', st => st.getAll()); },
    put(rec) { return this.tx('readwrite', st => st.put(rec)); },
    del(id) { return this.tx('readwrite', st => st.delete(id)); },
  };
  let photoURLs = [];
  const PHOTO = { a: null, b: null, angle: 'front' };
  async function shrink(file) {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1080 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return new Promise(res => c.toBlob(res, 'image/jpeg', 0.82));
  }
  async function viewPhotos() {
    app.innerHTML = `<div class="page">${pageHead('Progress', 'Progress photos', 'Stored only on this device – never uploaded or included in backups.')}<div id="photoBody" class="stack"><p class="muted">Loading…</p></div></div>`;
    photoURLs.forEach(u => URL.revokeObjectURL(u)); photoURLs = [];
    let photos = [];
    try { photos = (await PhotoDB.all()) || []; } catch (e) { $('#photoBody').innerHTML = '<div class="alert danger">Photo storage isn’t available in this browser (private mode?).</div>'; return; }
    if (route.r !== 'photos') return;
    photos.sort((a, b) => a.date < b.date ? 1 : -1);
    const url = p => { const u = URL.createObjectURL(p.blob); photoURLs.push(u); return u; };
    const dates = [...new Set(photos.filter(p => p.angle === PHOTO.angle).map(p => p.date))].sort();
    if (!dates.includes(PHOTO.a)) PHOTO.a = dates[0] || null;
    if (!dates.includes(PHOTO.b)) PHOTO.b = dates[dates.length - 1] || null;
    const pick = d => photos.find(p => p.date === d && p.angle === PHOTO.angle);
    const weightOn = d => { const m = S.measures.filter(x => x.weight && x.date <= d).sort((a, b) => a.date < b.date ? 1 : -1)[0]; return m ? `${m.weight} kg` : ''; };
    const side = d => { const p = d && pick(d); return p ? `<figure><img src="${url(p)}" alt="${PHOTO.angle} photo ${fmtShort(d)}"><figcaption>${fmtShort(d)} ${weightOn(d) ? '· ' + weightOn(d) : ''}</figcaption></figure>` : '<figure class="empty-photo">No photo</figure>'; };
    $('#photoBody').innerHTML = `
      <form id="photoForm" class="card stack">
        <h2>Add a photo</h2>
        <p class="small muted">Same spot, same light, same time of day – ideally every 2–4 weeks. Front, side and back.</p>
        <div class="form-grid">
          <label class="field"><span>Date</span><input class="input" name="date" type="date" value="${todayISO()}" max="${todayISO()}"></label>
          <label class="field"><span>Angle</span><select class="input" name="angle"><option value="front">Front</option><option value="side">Side</option><option value="back">Back</option></select></label>
        </div>
        <label class="btn btn-primary btn-lg" style="cursor:pointer">${icon('camera')} Take or choose photo<input class="sr-only" type="file" accept="image/*" capture="environment" id="photoFile"></label>
      </form>
      ${photos.length ? `<section class="card stack">
        <div class="row-between"><h2>Compare</h2><div class="tabs">${['front', 'side', 'back'].map(a => `<button type="button" class="${PHOTO.angle === a ? 'active' : ''}" data-action="photo-angle" data-a="${a}">${a[0].toUpperCase() + a.slice(1)}</button>`).join('')}</div></div>
        ${dates.length ? `<div class="form-grid"><label class="field"><span>Before</span><select class="input" id="photoA">${dates.map(d => `<option ${d === PHOTO.a ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
          <label class="field"><span>After</span><select class="input" id="photoB">${dates.map(d => `<option ${d === PHOTO.b ? 'selected' : ''}>${d}</option>`).join('')}</select></label></div>
          <div class="compare">${side(PHOTO.a)}${side(PHOTO.b)}</div>` : `<p class="muted">No ${PHOTO.angle} photos yet.</p>`}
      </section>
      <section class="card stack"><h2>All photos</h2><div class="photo-grid">${photos.map(p => `<figure><img src="${url(p)}" alt="${p.angle} photo ${fmtShort(p.date)}" loading="lazy"><figcaption>${fmtShort(p.date)} · ${p.angle}<button class="icon-btn" type="button" data-action="photo-del" data-id="${p.id}" aria-label="Delete photo">${icon('trash', 16)}</button></figcaption></figure>`).join('')}</div></section>` : ''}`;
  }

  /* ------------------------------------------------------------------
     FOOD LOG
     ------------------------------------------------------------------ */
  let foodDate = todayISO(), foodQ = '';
  const MEALS_ORDER = ['breakfast', 'lunch', 'snack', 'dinner'];
  const MEAL_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snacks', dinner: 'Dinner' };
  const defaultMeal = () => { const h = new Date().getHours(); return h < 11 ? 'breakfast' : h < 16 ? 'lunch' : h < 19 ? 'snack' : 'dinner'; };
  const allFoods = () => FOOD_DB.concat(S.customFoods);
  const foodById = id => FOOD[id] || S.customFoods.find(f => f.id === id);
  function dayTotals(date) {
    const list = S.food[date] || [];
    return { kcal: sum(list, e => e.kcal), p: sum(list, e => e.p), c: sum(list, e => e.c), f: sum(list, e => e.f) };
  }
  function targets() {
    const p = S.profile;
    if (!p || !(p.age && p.height && p.weight)) return null;
    const n = nutrition(p);
    return { kcal: n.target, p: n.protein, c: n.carbs, f: n.fat };
  }
  function bar(label, val, target, unit) {
    const pct = target ? Math.min(100, val / target * 100) : 0, over = target && val > target * 1.08;
    return `<div class="macro-row"><div class="row-between"><span>${label}</span><span><strong>${Math.round(val)}</strong>${target ? ` / ${target}` : ''} ${unit}</span></div><div class="progress"><i style="width:${pct}%;${over ? 'background:var(--warn)' : ''}"></i></div></div>`;
  }
  function foodResults() {
    const q = foodQ.trim().toLowerCase();
    const list = q ? allFoods().filter(f => (f.name + ' ' + (f.cat || '')).toLowerCase().includes(q)).slice(0, 10) : [];
    const recent = [];
    Object.keys(S.food).sort().reverse().forEach(d => (S.food[d] || []).forEach(e => { if (e.food && !recent.includes(e.food) && foodById(e.food)) recent.push(e.food); }));
    const rows = (q ? list : recent.slice(0, 8).map(foodById)).map(f => `<div class="food-row">
        <div><strong>${esc(f.name)}</strong><br><span class="small muted">${esc(f.serving)} · ${f.kcal} kcal · ${f.p} g protein</span></div>
        <div class="food-add"><select class="input input-sm" data-qty="${f.id}" aria-label="Servings">${[0.5, 1, 1.5, 2, 3].map(n => `<option ${n === 1 ? 'selected' : ''}>${n}</option>`).join('')}</select>
        <button class="btn btn-sm btn-primary" type="button" data-action="food-add" data-id="${f.id}" aria-label="Add ${esc(f.name)}">${icon('plus', 16)}</button></div></div>`).join('');
    return rows ? `${q ? '' : '<div class="eyebrow">Recent</div>'}${rows}` : (q ? '<p class="muted small">No match – add it as a custom food below.</p>' : '<p class="muted small">Search above – e.g. “paneer”, “roti”, “chicken”.</p>');
  }
  function viewFood() {
    const tg = targets(), tot = dayTotals(foodDate), d = parseISO(foodDate), list = S.food[foodDate] || [];
    app.innerHTML = `<div class="page">
      ${pageHead('Nutrition', t('nav.food'))}
      <div class="datebar"><button class="icon-btn" type="button" data-action="food-day" data-d="-1" aria-label="Previous day">${icon('left')}</button>
        <div class="datebar-mid"><strong>${fmtDate(d, { weekday: 'long', day: 'numeric', month: 'short' })}</strong>${foodDate === todayISO() ? '' : '<a href="#/food" data-action="food-today">Today</a>'}</div>
        <button class="icon-btn" type="button" data-action="food-day" data-d="1" aria-label="Next day" ${foodDate >= todayISO() ? 'disabled' : ''}>${icon('right')}</button></div>
      <section class="card stack">
        ${bar('Calories', tot.kcal, tg && tg.kcal, 'kcal')}${bar('Protein', tot.p, tg && tg.p, 'g')}${bar('Carbs', tot.c, tg && tg.c, 'g')}${bar('Fat', tot.f, tg && tg.f, 'g')}
        ${tg ? `<p class="small muted">${tot.p >= tg.p ? '✓ Protein target hit – great work.' : `${Math.round(tg.p - tot.p)} g protein to go – paneer, eggs, chicken, soya, dal or a whey shake.`}</p>` : '<p class="small muted"><a href="#/nutrition">Add your age, height and weight</a> to see targets.</p>'}
      </section>
      <section class="card stack">
        <h2>Add food</h2>
        <div class="row"><input class="input" id="foodQ" type="search" placeholder="Search 85 Indian foods…" value="${esc(foodQ)}" aria-label="Search foods" style="flex:1">
          <select class="input" id="foodMeal" style="width:auto" aria-label="Meal">${MEALS_ORDER.map(m => `<option value="${m}" ${m === defaultMeal() ? 'selected' : ''}>${MEAL_LABEL[m]}</option>`).join('')}</select></div>
        <div id="foodResults" class="stack-s">${foodResults()}</div>
        <details class="more"><summary>Add a custom food ${icon('right', 18)}</summary>
          <form id="customFood" class="form-grid cols-3" style="padding:8px 0">
            <label class="field full"><span>Name & serving</span><input class="input" name="name" required maxlength="60" placeholder="e.g. Mom's rajma (1 bowl)"></label>
            <label class="field"><span>kcal</span><input class="input" name="kcal" type="number" inputmode="decimal" required></label>
            <label class="field"><span>Protein g</span><input class="input" name="p" type="number" inputmode="decimal" value="0"></label>
            <label class="field"><span>Carbs g</span><input class="input" name="c" type="number" inputmode="decimal" value="0"></label>
            <label class="field"><span>Fat g</span><input class="input" name="f" type="number" inputmode="decimal" value="0"></label>
            <button class="btn btn-primary full" type="submit">Save & add</button>
          </form></details>
      </section>
      <section class="card stack">
        <div class="row-between"><h2>Logged</h2>${list.length ? '' : `<button class="btn btn-sm" type="button" data-action="food-copy">Copy yesterday</button>`}</div>
        ${list.length ? MEALS_ORDER.filter(m => list.some(e => e.meal === m)).map(m => `<div><div class="eyebrow">${MEAL_LABEL[m]} · ${Math.round(sum(list.filter(e => e.meal === m), e => e.kcal))} kcal</div>
          <ul class="mini-list">${list.filter(e => e.meal === m).map(e => `<li><span>${e.qty} × ${esc(e.name)}</span><span>${Math.round(e.kcal)} kcal · ${r1(e.p)} g P <button class="icon-btn icon-sm" type="button" data-action="food-del" data-id="${e.id}" aria-label="Remove ${esc(e.name)}">${icon('trash', 14)}</button></span></li>`).join('')}</ul></div>`).join('') : '<p class="muted">Nothing logged yet.</p>'}
      </section>
      <p class="footer-note">Values are estimates for home-style cooking – restaurant food usually has more oil.</p>
    </div>`;
  }
  function addFood(f, qty, meal, date = foodDate) {
    S.food[date] = (S.food[date] || []).concat({ id: uid(), food: f.id, name: f.name, serving: f.serving, qty, kcal: f.kcal * qty, p: f.p * qty, c: f.c * qty, f: f.f * qty, meal });
    persist('food');
  }

  /* ------------------------------------------------------------------
     MEAL PLAN + GROCERY LIST
     ------------------------------------------------------------------ */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t2 = Math.imul(a ^ (a >>> 15), 1 | a); t2 = (t2 + Math.imul(t2 ^ (t2 >>> 7), 61 | t2)) ^ t2; return ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296; }; }
  const COUNTABLE = /roti|egg|idli|bread|banana|apple|orange|guava|paratha|chilla|dosa|scoop/i;
  function planDay(seed, diet, tg) {
    const rand = rng(seed), rank = DIET_RANK[diet] ?? 0;
    const meals = MEALS_ORDER.map(m => {
      const opts = MEAL_TEMPLATES[m].filter(o => DIET_RANK[o.diet] <= rank);
      const pick = opts[Math.floor(rand() * opts.length)];
      return { meal: m, items: pick.items.map(([id, q]) => ({ id, q })) };
    });
    const totals = () => { const all = meals.flatMap(x => x.items); return { kcal: sum(all, i => FOOD[i.id].kcal * i.q), p: sum(all, i => FOOD[i.id].p * i.q) }; };
    const roundQ = (id, q) => COUNTABLE.test(FOOD[id].name + FOOD[id].serving) ? Math.max(1, Math.round(q)) : Math.max(0.5, Math.round(q * 2) / 2);
    if (tg) {
      // 1) scale portions toward the calorie target, 2) top up protein with lean add-ons
      const k = clamp(tg.kcal / totals().kcal, 0.7, 1.45);
      meals.forEach(x => x.items.forEach(i => { i.q = roundQ(i.id, i.q * k); }));
      const boosters = PROTEIN_BOOSTERS[diet] || PROTEIN_BOOSTERS.veg;
      for (let n = 0; n < 4 && totals().p < tg.p - 8; n++) {
        const id = boosters[n % boosters.length], snack = meals.find(x => x.meal === (n % 2 ? 'breakfast' : 'snack'));
        const ex = snack.items.find(i => i.id === id);
        if (ex) ex.q += 1; else snack.items.push({ id, q: 1 });
      }
    }
    return { meals, totals: totals() };
  }
  function viewMealPlan() {
    const p = S.profile || {}, diet = p.diet || 'veg', tg = targets();
    const plan = planDay(S.grocery.seed * 7 + 1, diet, tg);
    const all = plan.meals.flatMap(x => x.items);
    const macros = { c: sum(all, i => FOOD[i.id].c * i.q), f: sum(all, i => FOOD[i.id].f * i.q) };
    // Weekly grocery list from 7 generated days
    const groc = {}, other = {};
    for (let d = 0; d < 7; d++) planDay(S.grocery.seed * 7 + 1 + d, diet, tg).meals.forEach(x => x.items.forEach(i => {
      const f = FOOD[i.id];
      if (f.raw) { const [name, g] = f.raw, key = name; groc[f.cat] = groc[f.cat] || {}; groc[f.cat][key] = (groc[f.cat][key] || 0) + g * i.q; }
      else other[f.name] = (other[f.name] || 0) + i.q;
    }));
    const fmtQty = (name, v) => /\(count\)|slices|scoops/.test(name) ? `${Math.ceil(v)}` : /\(ml\)/.test(name) ? `${(Math.ceil(v / 250) * 0.25).toFixed(2).replace(/\.?0+$/, '')} L` : v >= 1000 ? `${(Math.ceil(v / 100) / 10)} kg` : `${Math.ceil(v / 50) * 50} g`;
    const cleanName = n => n.replace(/ \((count|ml|slices|scoops)\)/, '').replace('(slices)', '');
    app.innerHTML = `<div class="page">
      ${pageHead('Nutrition', 'Meal plan & grocery list', 'A sample Indian day built around your calorie and protein targets.')}
      <section class="card stack">
        <div class="row-between"><div class="tabs">${[['veg', 'Veg'], ['egg', 'Egg'], ['nonveg', 'Non-veg']].map(([k, l]) => `<button type="button" class="${diet === k ? 'active' : ''}" data-action="plan-diet" data-diet="${k}">${l}</button>`).join('')}</div>
          <button class="btn btn-sm" type="button" data-action="plan-new">↻ New plan</button></div>
        ${tg ? `<div class="stats"><div class="stat accent"><span class="l">Plan calories</span><span class="v">${Math.round(plan.totals.kcal)}<small> / ${tg.kcal}</small></span></div><div class="stat"><span class="l">Protein</span><span class="v">${Math.round(plan.totals.p)}<small> / ${tg.p} g</small></span></div><div class="stat"><span class="l">Carbs</span><span class="v">${Math.round(macros.c)}<small> g</small></span></div><div class="stat"><span class="l">Fat</span><span class="v">${Math.round(macros.f)}<small> g</small></span></div></div>`
          : '<div class="alert info">Add your age, height and weight on the <a href="#/nutrition">Nutrition</a> page to size portions to your targets.</div>'}
        ${plan.meals.map(x => `<div><div class="eyebrow">${MEAL_LABEL[x.meal]}</div><ul class="mini-list">${x.items.map(i => { const f = FOOD[i.id]; return `<li><span>${i.q} × ${esc(f.name)} <span class="muted small">(${esc(f.serving)})</span></span><span>${Math.round(f.kcal * i.q)} kcal · ${r1(f.p * i.q)} g P</span></li>`; }).join('')}</ul></div>`).join('')}
        <button class="btn btn-primary btn-block" type="button" data-action="plan-log">${icon('plus', 18)} Add this day to today's food log</button>
      </section>
      <section class="card stack print-area">
        <div class="row-between"><h2>Grocery list · 7 days</h2><button class="btn btn-sm" type="button" data-action="print">Print</button></div>
        <p class="small muted">For 7 generated days like the one above (one person). Tick items as you shop.</p>
        ${Object.entries(groc).sort().map(([cat, items]) => `<div><div class="eyebrow">${cat}</div>${Object.entries(items).sort().map(([n, v]) => `<label class="groc-item"><input type="checkbox" data-groc="${esc(n)}" ${S.grocery.checked[n] ? 'checked' : ''}> <span>${esc(cleanName(n))}</span><strong>${fmtQty(n, v)}</strong></label>`).join('')}</div>`).join('')}
        ${Object.keys(other).length ? `<div><div class="eyebrow">Ready-made</div>${Object.entries(other).map(([n, v]) => `<label class="groc-item"><input type="checkbox" data-groc="${esc(n)}" ${S.grocery.checked[n] ? 'checked' : ''}> <span>${esc(n)}</span><strong>${v} servings</strong></label>`).join('')}</div>` : ''}
        <p class="small muted">Plus staples: onions, tomatoes, ginger-garlic, green chillies, spices, lemons, coriander and a little oil/ghee.</p>
      </section>
    </div>`;
  }

  /* ------------------------------------------------------------------
     AI COACH (needs the optional MuscularMen server – see server/README)
     ------------------------------------------------------------------ */
  let coachOnline = null, coachBusy = false;
  const COACH_PROMPTS = ['My knee hurts on squats – what should I change?', 'Give me a 30-minute version of today’s workout', 'What should I eat before and after training?', 'Am I progressing well? What should I focus on?'];
  function coachContext() {
    const p = S.profile;
    if (!p) return { note: 'No profile set up yet.' };
    const today = todayISO(), plan = dayPlan(today), fat = fatigueCheck(), sd = strengthData();
    const lifts = {};
    Object.entries(sd).forEach(([k, v]) => { const d = Object.keys(v).sort().pop(); if (d) lifts[KEY_LIFTS[k]] = `${roundTo(v[d].v, 0.5)} kg e1RM (${d})`; });
    const since = iso(addDays(new Date(), -28)), recent = Object.keys(S.logs).filter(d => d >= since && S.logs[d].completed).length;
    const lastM = [...S.measures].sort((a, b) => a.date < b.date ? -1 : 1).pop();
    return {
      athlete: { name: p.name || undefined, gender: p.gender, age: p.age, heightCm: p.height, weightKg: p.weight, targetWeightKg: p.targetWeight, goal: GOALS[p.goal], experience: p.level, daysPerWeek: p.days, sessionMinutes: p.session, equipment: EQUIPMENT_PROFILES[p.equipment].label, injuries: (p.injuries || []).map(a => INJURY_AREAS[a]), diet: p.diet || 'veg' },
      program: { week: currentWeek(), split: SPLIT_NAMES[p.days] },
      today: plan.status === 'train' ? { title: plan.title, exercises: plan.exercises.map(it => `${it.ex.name}: ${rxText(it.rx)}, rest ${it.rx.rest}s, RPE ${it.rx.rpe}`), finisher: plan.finisher.title } : { status: plan.status },
      last28Days: { workoutsCompleted: recent, avgRpe14d: fat.avg ? r1(fat.avg) : null, stalledLifts: fat.stalled },
      keyLifts: lifts,
      latestMeasurements: lastM || null,
      nutritionTargets: targets(),
      foodToday: dayTotals(today),
    };
  }
  function md(text) {   // tiny, safe markdown: escape first, then bold / lists / line breaks
    return esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^#{1,3} (.+)$/gm, '<strong>$1</strong>').replace(/^[-•] (.+)$/gm, '• $1').replace(/\n/g, '<br>');
  }
  async function checkCoach() {
    if (!isHttp()) { coachOnline = false; return; }
    try { const r = await fetch('api/health', { cache: 'no-store' }); const j = await r.json(); coachOnline = j && j.ok ? (j.coach === false ? 'nokey' : true) : false; } catch (e) { coachOnline = false; }
  }
  function renderChat() {
    const box = $('#chatLog');
    if (!box) return;
    box.innerHTML = S.coachChat.length ? S.coachChat.map(m => `<div class="msg ${m.role}">${m.role === 'assistant' ? md(m.content) : esc(m.content)}</div>`).join('') : `<div class="msg assistant">Hi${S.profile && S.profile.name ? ' ' + esc(S.profile.name) : ''}! I can see your program, recent workouts and targets. Ask me anything about training, form, pain, recovery or food.</div>`;
    box.scrollTop = box.scrollHeight;
  }
  async function viewCoach() {
    app.innerHTML = `<div class="page">${pageHead('Powered by Claude', t('nav.coach'))}<div id="coachBody"><p class="muted">Connecting…</p></div></div>`;
    if (coachOnline === null) await checkCoach();
    if (route.r !== 'coach') return;
    $('#coachBody').innerHTML = coachOnline === 'nokey' ? `
      <section class="card stack">
        <h2>Almost there – add an API key</h2>
        <p class="muted">The MuscularMen server is running, but it has no Anthropic API key, so the coach can't answer yet.</p>
        <ol class="list"><li>Create a key at <strong>console.anthropic.com</strong>.</li><li>Stop the server, set <code>ANTHROPIC_API_KEY=your-key</code> in that terminal, and run <code>npm start</code> again.</li></ol>
        <button class="btn" type="button" data-action="coach-retry">Check again</button>
      </section>` : coachOnline ? `
      <div class="alert info small">${icon('shield')}<div>The coach gives general guidance, not medical advice. For pain, injury, pregnancy or medical conditions, see a doctor or physiotherapist.</div></div>
      <section class="card chat">
        <div id="chatLog" class="chat-log" aria-live="polite"></div>
        <div class="chips">${COACH_PROMPTS.map(q => `<button type="button" class="chip chip-btn" data-action="coach-ask" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
        <form id="coachForm" class="chat-input"><textarea class="input" name="q" rows="2" maxlength="2000" placeholder="Ask your coach…" aria-label="Message" required></textarea><button class="btn btn-primary" type="submit" ${coachBusy ? 'disabled' : ''}>Send</button></form>
        ${S.coachChat.length ? '<button class="btn btn-sm" type="button" data-action="coach-clear">Clear conversation</button>' : ''}
      </section>` : `
      <section class="card stack">
        <h2>Set up the AI coach</h2>
        <p class="muted">The coach uses Claude through a small server, so your API key never sits in the browser. Run it on your computer (or host it):</p>
        <ol class="list">
          <li>Install <strong>Node.js 18+</strong>.</li>
          <li>In the <code>gym/server</code> folder run <code>npm install</code>.</li>
          <li>Set your key: <code>ANTHROPIC_API_KEY=…</code> (from console.anthropic.com).</li>
          <li>Run <code>npm start</code> and open <strong>http://localhost:8080</strong>.</li>
        </ol>
        <p class="small muted">The same server also enables accounts & cloud sync. Everything else in MuscularMen works without it.</p>
        <button class="btn" type="button" data-action="coach-retry">Check again</button>
      </section>`;
    renderChat();
  }
  async function askCoach(q) {
    if (coachBusy || !q.trim()) return;
    coachBusy = true;
    S.coachChat.push({ role: 'user', content: q.trim().slice(0, 2000) });
    S.coachChat.push({ role: 'assistant', content: '' });
    renderChat();
    const btn = $('#coachForm button'); if (btn) btn.disabled = true;
    const reply = S.coachChat[S.coachChat.length - 1];
    try {
      const res = await fetch('api/coach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: S.coachChat.slice(0, -1).slice(-20), context: coachContext(), lang: S.settings.lang }),
      });
      if (!res.ok || !res.body) throw new Error((await res.text()) || 'Coach unavailable');
      const reader = res.body.getReader(), dec = new TextDecoder();
      let buf = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf('\n\n')) >= 0) {
          const line = buf.slice(0, i).replace(/^data: /, ''); buf = buf.slice(i + 2);
          let ev; try { ev = JSON.parse(line); } catch (e) { continue; }
          if (ev.type === 'text') reply.content += ev.text;
          else if (ev.type === 'error') reply.content += (reply.content ? '\n\n' : '') + '⚠ ' + ev.message;
          renderChat();
        }
      }
      if (!reply.content) reply.content = 'Sorry – I couldn’t answer that. Please try rephrasing.';
    } catch (e) {
      reply.content = '⚠ ' + (e.message || 'Could not reach the coach server.');
    }
    if (/API key/.test(reply.content)) coachOnline = 'nokey';
    S.coachChat = S.coachChat.slice(-30);
    persist('coachChat');
    coachBusy = false;
    renderChat();
    const b2 = $('#coachForm button'); if (b2) b2.disabled = false;
  }

  /* ------------------------------------------------------------------
     TRAINER DASHBOARD – clients share their backup file with the coach
     ------------------------------------------------------------------ */
  function withData(data, fn) {
    const saved = { profile: S.profile, logs: S.logs, measures: S.measures };
    S.profile = data.profile; S.logs = data.logs || {}; S.measures = data.measures || [];
    planCache.clear();
    try { return fn(); } finally { Object.assign(S, saved); planCache.clear(); }
  }
  function clientSummary(c) {
    return withData(c.data, () => {
      const today = todayISO();
      let planned = 0, done = 0;
      for (let i = 1; i <= 28; i++) { const ds = iso(addDays(new Date(), -i)); if (scheduleFor(ds).status === 'train') { planned++; if (S.logs[ds] && S.logs[ds].completed) done++; } }
      const st = workoutStats(), fat = fatigueCheck(), sd = strengthData();
      const best = k => { const v = Object.values(sd[k]); return v.length ? roundTo(Math.max(...v.map(x => x.v)), 0.5) : null; };
      const ms = [...S.measures].filter(m => m.weight).sort((a, b) => a.date < b.date ? -1 : 1);
      const lastDone = Object.keys(S.logs).filter(d => S.logs[d].completed && d <= today).sort().pop();
      return {
        goal: GOALS[S.profile.goal], week: currentWeek(), adherence: planned ? Math.round(done / planned * 100) : null, streak: st.streak,
        lastDone, weightChange: ms.length > 1 ? r1(ms[ms.length - 1].weight - ms[0].weight) : null,
        squat: best('squat'), bench: best('bench'), deadlift: best('deadlift'), avgRpe: fat.avg ? r1(fat.avg) : null, flag: fat.high, prs: personalRecords().length,
        sessions: Object.keys(S.logs).filter(d => S.logs[d].completed).sort().reverse().slice(0, 6).map(d => `${fmtShort(d)} – ${S.logs[d].title || 'Workout'}`),
      };
    });
  }
  function viewTrainer() {
    const rows = S.clients.map(c => { let s; try { s = clientSummary(c); } catch (e) { s = null; } return { c, s }; });
    app.innerHTML = `<div class="page">
      ${pageHead('For coaches', t('nav.trainer'), 'Ask each client for their backup file (Profile → Export backup), import it here, and see everyone at a glance. Data stays on this device.')}
      <section class="card stack">
        <div class="row"><label class="btn btn-primary" style="cursor:pointer">${icon('plus', 18)} Import client backups<input class="sr-only" type="file" accept="application/json,.json" multiple id="clientFiles"></label>
        <button class="btn" type="button" data-action="trainer-plan">Create a program file for a client</button></div>
      </section>
      ${rows.length ? `<section class="card stack"><h2>Clients (${rows.length})</h2><div class="table-wrap"><table>
        <thead><tr><th>Client</th><th>Goal</th><th class="num">Week</th><th class="num">Adherence 4 wk</th><th class="num">Streak</th><th>Last workout</th><th class="num">Weight Δ</th><th class="num">Squat / Bench / DL e1RM</th><th class="num">RPE 14 d</th><th></th></tr></thead>
        <tbody>${rows.map(({ c, s }) => s ? `<tr>
          <td><strong>${esc(c.name)}</strong>${s.flag ? ' <span class="badge warn">Fatigue</span>' : ''}<br><span class="small muted">Imported ${fmtShort(iso(new Date(c.importedAt)))}</span></td>
          <td>${s.goal}</td><td class="num">${s.week}</td>
          <td class="num"><span class="badge ${s.adherence === null ? '' : s.adherence >= 80 ? 'ok' : s.adherence >= 50 ? 'warn' : 'danger-b'}">${s.adherence === null ? '—' : s.adherence + '%'}</span></td>
          <td class="num">${s.streak}</td><td>${s.lastDone ? fmtShort(s.lastDone) : '—'}</td>
          <td class="num">${s.weightChange === null ? '—' : (s.weightChange > 0 ? '+' : '') + s.weightChange + ' kg'}</td>
          <td class="num">${[s.squat, s.bench, s.deadlift].map(v => v ?? '—').join(' / ')}</td><td class="num">${s.avgRpe ?? '—'}</td>
          <td><button class="btn btn-sm" type="button" data-action="client-del" data-id="${c.id}">Remove</button></td></tr>` : `<tr><td>${esc(c.name)}</td><td colspan="9" class="muted">Couldn’t read this file.</td></tr>`).join('')}</tbody></table></div></section>
        <div class="grid-2">${rows.filter(r => r.s).map(({ c, s }) => `<section class="card stack"><h3>${esc(c.name)}</h3><p class="small muted">${s.prs} personal records · ${s.sessions.length ? 'recent sessions:' : 'no sessions yet'}</p><ul class="mini-list">${s.sessions.map(x => `<li><span>${esc(x)}</span></li>`).join('')}</ul></section>`).join('')}</div>`
      : '<p class="muted">No clients yet.</p>'}
    </div>`;
  }
  function trainerPlanForm() {
    const sel = (name, label, map) => `<label class="field"><span>${label}</span><select class="input" name="${name}">${Object.entries(map).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>`;
    openSheet(`<h2 id="modalTitle">Program file for a client</h2>
      <p class="muted small" style="margin:8px 0 14px">Your client imports this on their phone (Profile → Import backup). It sets up their program; their logged workouts are kept.</p>
      <form id="trainerPlanForm" class="form-grid">
        <label class="field full"><span>Client name</span><input class="input" name="name" required maxlength="40"></label>
        ${sel('gender', 'Gender', { female: 'Female', male: 'Male' })}${sel('goal', 'Goal', GOALS)}${sel('level', 'Experience', LEVELS)}
        ${sel('days', 'Days / week', { 3: '3', 4: '4', 5: '5', 6: '6' })}${sel('session', 'Session', { 45: '45 min', 60: '60 min', 90: '90 min' })}
        ${sel('equipment', 'Equipment', Object.fromEntries(Object.entries(EQUIPMENT_PROFILES).map(([k, e]) => [k, e.label])))}${sel('emphasis', 'Emphasis', EMPHASIS)}
        <label class="field"><span>Start (Monday)</span><input class="input" name="startDate" type="date" value="${iso(addDays(mondayOf(new Date()), 7))}"></label>
        <div class="full chips">${Object.entries(INJURY_AREAS).map(([k, v]) => `<label class="chip chip-check"><input type="checkbox" name="injuries" value="${k}"> ${v}</label>`).join('')}</div>
        <button class="btn btn-primary btn-lg full" type="submit">${icon('download', 18)} Download program file</button>
      </form>`);
  }

  /* ------------------------------------------------------------------
     ACCOUNT & CLOUD SYNC (optional MuscularMen server)
     ------------------------------------------------------------------ */
  async function api(path, opts = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, S.account && S.account.token ? { Authorization: 'Bearer ' + S.account.token } : {});
    const res = await fetch('api/' + path, Object.assign({}, opts, { headers }));
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || `Server error ${res.status}`);
    return j;
  }
  const localBundle = () => ({ profile: S.profile, logs: S.logs, measures: S.measures, food: S.food, customFoods: S.customFoods, settings: S.settings });
  function applyBundle(d) {
    Store.__syncing = true;
    try {
      ['profile', 'logs', 'measures', 'food', 'customFoods', 'settings'].forEach(k => { if (d[k] !== undefined) { S[k] = k === 'settings' ? Object.assign({}, DEFAULT_SETTINGS, d[k]) : d[k]; persist(k); } });
    } finally { Store.__syncing = false; }
    planCache.clear(); applyTheme(); renderNav();
  }
  async function viewAccount() {
    app.innerHTML = `<div class="page">${pageHead('Backup', t('nav.account'))}<div id="accBody"><p class="muted">Checking server…</p></div></div>`;
    let online = false;
    if (isHttp()) { try { online = !!(await (await fetch('api/health', { cache: 'no-store' })).json()).ok; } catch (e) {} }
    if (route.r !== 'account') return;
    const acc = S.account, lastSync = Store.get('lastSync', 0), changed = Store.get('localChangedAt', 0);
    $('#accBody').innerHTML = !online ? `<section class="card stack"><h2>Cloud sync needs the MuscularMen server</h2>
        <p class="muted">Accounts and sync run on the small server in the <code>server/</code> folder (the same one that powers the AI coach). Start it with <code>npm start</code> and open the app from its address. Until then, use <strong>Profile → Export backup</strong> to move data between phones.</p></section>`
      : !acc ? `<section class="card stack"><h2>Sign in or create an account</h2>
        <form id="accForm" class="stack"><label class="field"><span>Email</span><input class="input" name="email" type="email" autocomplete="email" required></label>
          <label class="field"><span>Password (8+ characters)</span><input class="input" name="password" type="password" autocomplete="current-password" minlength="8" required></label>
          <div class="row"><button class="btn btn-primary" type="submit" name="mode" value="login">Sign in</button><button class="btn" type="submit" name="mode" value="register">Create account</button></div></form>
        <p class="small muted">Your data is stored on the server you run. Passwords are salted and hashed (scrypt).</p></section>`
      : `<section class="card stack"><h2>Signed in</h2><p class="muted">${esc(acc.email)}</p>
        <p class="small muted">Last synced: ${lastSync ? new Date(lastSync).toLocaleString('en-IN') : 'never'}${changed > lastSync ? ' · changes on this device not uploaded yet' : ''}</p>
        <div class="row"><button class="btn btn-primary" type="button" data-action="sync-now">${icon('cloud', 18)} Sync now</button><button class="btn" type="button" data-action="sync-pull">Replace this device with cloud copy</button></div>
        <div class="row"><button class="btn btn-sm" type="button" data-action="logout">Sign out</button><button class="btn btn-sm btn-danger" type="button" data-action="delete-account">Delete account & cloud data</button></div></section>`;
  }
  async function syncNow() {
    const lastSync = Store.get('lastSync', 0), changed = Store.get('localChangedAt', 0);
    const cloud = await api('sync');
    const cloudNewer = cloud.updatedAt && cloud.updatedAt > lastSync, localNewer = changed > lastSync || !cloud.updatedAt;
    if (cloudNewer && localNewer && !confirm('Both this device and the cloud have changes. OK = keep THIS DEVICE (upload), Cancel = use the CLOUD copy.')) {
      applyBundle(cloud.data);
    } else if (cloudNewer && !localNewer) {
      applyBundle(cloud.data);
    } else if (localNewer) {
      const r = await api('sync', { method: 'PUT', body: JSON.stringify({ data: localBundle() }) });
      Store.set('lastSync', r.updatedAt);
      toast('Uploaded ✓'); return;
    }
    Store.set('lastSync', Date.now());
    toast('Synced ✓');
  }

  /* ------------------------------------------------------------------
     Register pages & titles
     ------------------------------------------------------------------ */
  Object.assign(VIEWS, { more: viewMore, tools: viewTools, photos: viewPhotos, food: viewFood, mealplan: viewMealPlan, coach: viewCoach, trainer: viewTrainer, account: viewAccount });
  Object.assign(TITLES, { more: 'More', tools: 'Tools', photos: 'Progress photos', food: 'Food log', mealplan: 'Meal plan', coach: 'AI coach', trainer: 'Trainer dashboard', account: 'Account' });

  /* ------------------------------------------------------------------
     Actions (clicks)
     ------------------------------------------------------------------ */
  Object.assign(ACTIONS, {
    async 'install-app'() { const p = window.__installPrompt; if (!p) return; p.prompt(); await p.userChoice.catch(() => {}); window.__installPrompt = null; viewMore(); },
    async 'cache-media'(el) {
      const urls = [...new Set(Object.values(EXERCISE_VIDEOS).concat(Object.values(EXERCISE_IMAGES)))];
      el.disabled = true;
      const c = await caches.open('tf-media-v1');
      let n = 0;
      for (const u of urls) {
        try { if (!(await c.match(u))) { const r = await fetch(u); if (r.ok) await c.put(u, r); } } catch (e) {}
        n++; const s = $('#cacheStatus'); if (s) s.textContent = `Saving… ${n}/${urls.length}`;
      }
      toast('All demo media saved for offline use ✓'); el.disabled = false; updateCacheStatus();
    },
    plates(el) {
      const card = el.closest('.ex-card'), inp = card && $('input[data-log="w"]', card);
      const w = num(inp && (inp.value || inp.placeholder)) || num(el.dataset.w) || 60;
      TOOLS.weight = w;
      openSheet(`<h2 id="modalTitle">Load the bar</h2><p class="muted small" style="margin:6px 0 12px">For ${w} kg on a ${TOOLS.bar} kg bar</p>${plateCard(w, TOOLS.bar)}
        <h4 style="margin-top:16px">Warm-up sets</h4><ul class="mini-list">${warmups(w, TOOLS.bar).map(s => `<li><span>${s.w} kg × ${s.reps}</span><span>${platesFor(s.w, TOOLS.bar).plates.join(' + ') || 'bar only'}</span></li>`).join('') || '<li>Bar only</li>'}</ul>
        <a class="btn btn-sm" href="#/tools" data-action="close-modal">Open full tools</a>`);
    },
    'photo-angle'(el) { PHOTO.angle = el.dataset.a; viewPhotos(); },
    async 'photo-del'(el) { if (!confirm('Delete this photo permanently?')) return; await PhotoDB.del(el.dataset.id); viewPhotos(); },
    'food-day'(el) { const d = addDays(parseISO(foodDate), +el.dataset.d); if (iso(d) <= todayISO()) { foodDate = iso(d); viewFood(); } },
    'food-today'() { foodDate = todayISO(); viewFood(); },
    'food-add'(el) {
      const f = foodById(el.dataset.id); if (!f) return;
      const qty = +($(`select[data-qty="${el.dataset.id}"]`) || {}).value || 1;
      addFood(f, qty, ($('#foodMeal') || {}).value || defaultMeal());
      toast(`Added ${qty} × ${f.name}`); viewFood();
    },
    'food-del'(el) { S.food[foodDate] = (S.food[foodDate] || []).filter(e => e.id !== el.dataset.id); persist('food'); viewFood(); },
    'food-copy'() {
      const y = iso(addDays(parseISO(foodDate), -1)), src = S.food[y] || [];
      if (!src.length) { toast('Nothing logged the day before.'); return; }
      S.food[foodDate] = src.map(e => Object.assign({}, e, { id: uid() })); persist('food'); viewFood();
    },
    'plan-diet'(el) { if (S.profile) { S.profile.diet = el.dataset.diet; persist('profile'); } viewMealPlan(); },
    'plan-new'() { S.grocery.seed = (S.grocery.seed % 9973) + 1; S.grocery.checked = {}; persist('grocery'); viewMealPlan(); },
    'plan-log'() {
      const plan = planDay(S.grocery.seed * 7 + 1, (S.profile || {}).diet || 'veg', targets()), today = todayISO();
      plan.meals.forEach(x => x.items.forEach(i => addFood(FOOD[i.id], i.q, x.meal, today)));
      toast('Added to today’s food log ✓'); foodDate = today; location.hash = '#/food';
    },
    print() { window.print(); },
    'coach-ask'(el) { askCoach(el.dataset.q); },
    'coach-clear'() { if (!confirm('Clear the conversation?')) return; S.coachChat = []; persist('coachChat'); viewCoach(); },
    async 'coach-retry'() { coachOnline = null; viewCoach(); },
    'trainer-plan'() { trainerPlanForm(); },
    'client-del'(el) { if (!confirm('Remove this client from the dashboard?')) return; S.clients = S.clients.filter(c => c.id !== el.dataset.id); persist('clients'); viewTrainer(); },
    async 'sync-now'() { try { await syncNow(); viewAccount(); } catch (e) { toast(e.message); } },
    async 'sync-pull'() {
      if (!confirm('Replace everything on this device with the cloud copy?')) return;
      try { const c = await api('sync'); if (!c.data) { toast('No cloud copy yet.'); return; } applyBundle(c.data); Store.set('lastSync', Date.now()); toast('Restored from cloud ✓'); viewAccount(); } catch (e) { toast(e.message); }
    },
    async logout() { try { await api('logout', { method: 'POST' }); } catch (e) {} S.account = null; persist('account'); viewAccount(); },
    async 'delete-account'() {
      if (!confirm('Delete your account and ALL cloud data? Data on this device is kept.')) return;
      try { await api('account', { method: 'DELETE' }); S.account = null; persist('account'); toast('Account deleted'); viewAccount(); } catch (e) { toast(e.message); }
    },
  });

  /* ------------------------------------------------------------------
     Inputs, changes and forms for the new pages
     ------------------------------------------------------------------ */
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.id === 'foodQ') { foodQ = el.value; $('#foodResults').innerHTML = foodResults(); }
    else if (['tWeight', 'tW1', 'tR1'].includes(el.id)) {
      TOOLS.weight = num($('#tWeight').value) || 0; TOOLS.w1 = num($('#tW1').value) || 0; TOOLS.r1 = num($('#tR1').value) || 0;
      if (el.id === 'tWeight') { $('#plateOut').innerHTML = plateCard(TOOLS.weight, TOOLS.bar); clearTimeout(viewTools._t); viewTools._t = setTimeout(() => { const f = document.activeElement && document.activeElement.id; $('#toolsBody').innerHTML = toolsHTML(); if (f) { const n = $('#' + f); if (n) { n.focus(); n.setSelectionRange && n.type === 'text' && n.setSelectionRange(99, 99); } } }, 700); }
      else { const f = el.id; $('#toolsBody').innerHTML = toolsHTML(); const n = $('#' + f); if (n) n.focus(); }
    }
  });
  document.addEventListener('change', async e => {
    const el = e.target;
    if (el.id === 'tBar') { TOOLS.bar = +el.value; $('#toolsBody').innerHTML = toolsHTML(); }
    else if (el.id === 'photoA' || el.id === 'photoB') { PHOTO[el.id === 'photoA' ? 'a' : 'b'] = el.value; viewPhotos(); }
    else if (el.id === 'photoFile' && el.files[0]) {
      const form = el.closest('form'), d = new FormData(form);
      try {
        const blob = await shrink(el.files[0]);
        await PhotoDB.put({ id: uid(), date: d.get('date') || todayISO(), angle: d.get('angle') || 'front', blob });
        PHOTO.angle = d.get('angle') || 'front';
        toast('Photo saved privately on this device ✓'); viewPhotos();
      } catch (err) { toast('Couldn’t save that photo.'); }
    } else if (el.matches('input[data-groc]')) { S.grocery.checked[el.dataset.groc] = el.checked; persist('grocery'); }
    else if (el.id === 'clientFiles' && el.files.length) {
      let added = 0;
      for (const file of el.files) {
        try {
          const data = JSON.parse(await file.text());
          if (!data || !['MuscularMen', 'MuscularMen'].includes(data.app) || !data.profile || !data.profile.startDate) throw new Error();
          const name = data.profile.name || file.name.replace(/\.json$/i, '').replace(/^(muscularmen|transformfit)-backup-?/, '') || 'Client';
          const existing = S.clients.findIndex(c => c.name === name);
          const rec = { id: existing >= 0 ? S.clients[existing].id : uid(), name, importedAt: new Date().toISOString(), data: { profile: data.profile, logs: data.logs || {}, measures: data.measures || [] } };
          if (existing >= 0) S.clients[existing] = rec; else S.clients.push(rec);
          added++;
        } catch (err) { toast(`${file.name} isn’t a MuscularMen backup.`); }
      }
      persist('clients');
      if (added) toast(`Imported ${added} client file(s) ✓`);
      viewTrainer();
    }
  });
  document.addEventListener('submit', async e => {
    const form = e.target;
    if (form.id === 'customFood') {
      e.preventDefault(); e.stopImmediatePropagation();
      const d = Object.fromEntries(new FormData(form).entries());
      const kcal = num(d.kcal);
      if (!d.name || !(kcal >= 0)) { toast('Enter a name and calories.'); return; }
      const f = { id: 'c-' + uid(), name: d.name.trim().slice(0, 60), serving: '1 serving', kcal, p: num(d.p) || 0, c: num(d.c) || 0, f: num(d.f) || 0, diet: 'veg', cat: 'Other' };
      S.customFoods.push(f); persist('customFoods');
      addFood(f, 1, ($('#foodMeal') || {}).value || defaultMeal());
      toast('Custom food saved & added ✓'); viewFood();
    } else if (form.id === 'coachForm') {
      e.preventDefault(); e.stopImmediatePropagation();
      const q = form.q.value; form.q.value = ''; askCoach(q);
    } else if (form.id === 'trainerPlanForm') {
      e.preventDefault(); e.stopImmediatePropagation();
      const fd = new FormData(form), d = Object.fromEntries(fd.entries());
      const profile = Object.assign({}, DEFAULT_PROFILE, { name: d.name.trim().slice(0, 40), gender: d.gender, goal: d.goal, level: d.level, days: +d.days, session: +d.session, equipment: d.equipment, emphasis: d.emphasis, injuries: fd.getAll('injuries'), startDate: iso(mondayOf(parseISO(d.startDate || todayISO()))) });
      download(`muscularmen-program-${profile.name.replace(/\W+/g, '-').toLowerCase() || 'client'}.json`, JSON.stringify({ app: 'MuscularMen', type: 'coach-plan', version: 1, createdAt: new Date().toISOString(), profile }, null, 2));
      closeModal(); toast('Program file downloaded – send it to your client.');
    } else if (form.id === 'accForm') {
      e.preventDefault(); e.stopImmediatePropagation();
      const d = Object.fromEntries(new FormData(form).entries()), mode = (e.submitter && e.submitter.value) || 'login';
      try {
        const r = await api(mode === 'register' ? 'register' : 'login', { method: 'POST', body: JSON.stringify({ email: d.email, password: d.password }) });
        S.account = { email: r.email, token: r.token }; persist('account');
        toast(mode === 'register' ? 'Account created ✓' : 'Signed in ✓');
        await syncNow().catch(err => toast(err.message));
        viewAccount();
      } catch (err) { toast(err.message); }
    }
  }, true);   // capture: runs before the main app's submit handler
})();
