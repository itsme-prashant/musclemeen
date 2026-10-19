/* =====================================================================
   MuscularMen media composer
   ---------------------------------------------------------------------
   Renders sample exercise media from the app's own original artwork:
     • TFMedia.image(id)  → 1280×720 PNG illustration (anatomy figure in two key positions,
                            muscle map, form cues)
     • TFMedia.video(id)  → 1280×720 MP4 demo (animated reps with step
                            captions, rep counter and muscle map)
   It is injected into index.html by tools/make_media.py and relies on the
   app globals EX, bodySVG, muscleMapSVG, MUSCLE_GROUPS…
   ===================================================================== */
(() => {
  const W = 1280, H = 720;
  const C = { bg: '#0A0C0F', surface: '#13161B', surface2: '#1B1F26', border: '#2A303A', text: '#F3F5F7', muted: '#98A2B3', accent: '#C6FF00', ink: '#0A0C0F', danger: '#FF6B6B' };
  const FONT = "'Segoe UI', Arial, sans-serif";
  const DISPLAY = "Impact, 'Arial Narrow', 'Arial Black', sans-serif";

  const STYLE = `<style>
    svg { --mm-body:#4A4F58; --mm-muscle:#6E747E; --mm-line:#23272E; --mm-primary:#FF4A2B; --mm-primary-2:#FF9A3C; --mm-secondary:#F2A65A; --mm-arrow:#FFE11A; }
    .mm .body { fill:var(--mm-body); stroke:var(--mm-line); stroke-width:1.2; }
    .mm .ms { fill:var(--mm-muscle); stroke:var(--mm-line); stroke-width:1; stroke-linejoin:round; }
    .mm .ms.sec { fill:var(--mm-secondary); }
    .mm .det { fill:none; stroke:var(--mm-line); stroke-width:1; stroke-linecap:round; opacity:.8; }
    .mm .lbl { font:700 11px ${FONT}; letter-spacing:.14em; fill:${C.muted}; text-anchor:middle; }
    .mm .arrow { stroke:var(--mm-arrow); stroke-width:7; stroke-linecap:round; fill:none; }
    .mm .arrow-head { fill:var(--mm-arrow); }
    .mm .arrow-edge { stroke:#000; stroke-opacity:.55; stroke-width:10; stroke-linecap:round; fill:none; }
  </style>`;

  /* ---------- helpers ---------- */
  const x = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wrap = (text, max) => {
    const lines = []; let cur = '';
    String(text).split(/\s+/).forEach(w => { if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) lines.push(cur);
    return lines;
  };
  const tspans = (lines, px, dy) => lines.map((l, i) => `<tspan x="${px}" dy="${i ? dy : 0}">${x(l)}</tspan>`).join('');

  /* Anatomy figure (from the app's bodySVG) placed at x, y with a given size; k = 0 pose A, 1 pose B */
  const figure = (ex, k, px, py, size) => bodySVG(ex, k).replace('<svg class="body-fig"', `<svg class="body-fig" x="${px}" y="${py}" width="${size}" height="${size}"`);

  /* ---------- shared layout: header, panels, muscle map, legend ---------- */
  function chrome(ex, leftTitle) {
    const mm = muscleMapSVG(ex).replace('<svg class="mm"', '<svg class="mm" x="800" y="196" width="420" height="380"');
    const legend = [];
    let ly = 612;
    const item = (color, label, text) => {
      const lines = wrap(`${label}: ${text}`, 46).slice(0, 2);
      legend.push(`<rect x="806" y="${ly - 13}" width="14" height="14" rx="4" fill="${color}"/>
        <text x="830" y="${ly}" font-family="${FONT}" font-size="17" fill="${C.text}">${tspans(lines, 830, 21)}</text>`);
      ly += 22 * lines.length + 8;
    };
    item('#FF5A2E', 'Primary', ex.primary);
    if (ex.secondary && ex.secondary !== '—') item('#F2A65A', 'Secondary', ex.secondary);
    return `
      <defs><radialGradient id="glow" cx="1" cy="0" r="0.9"><stop offset="0" stop-color="${C.accent}" stop-opacity=".14"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="${C.bg}"/><rect width="${W}" height="${H}" fill="url(#glow)"/>
      <svg x="44" y="33" width="30" height="30" viewBox="0 0 100 100" fill="${C.accent}"><rect x="4" y="46" width="92" height="8" rx="4"/><rect x="9" y="38" width="7" height="24" rx="2.5"/><rect x="84" y="38" width="7" height="24" rx="2.5"/><rect x="17" y="20" width="15" height="60" rx="5"/><rect x="68" y="20" width="15" height="60" rx="5"/><path d="M25 27 L50 61 L75 27" fill="none" stroke="${C.accent}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <text x="82" y="54" font-family="${FONT}" font-weight="800" font-size="15" letter-spacing="4" fill="${C.accent}">MUSCULARMEN · EXERCISE GUIDE</text>
      <text x="46" y="112" font-family="${DISPLAY}" font-size="54" fill="${C.text}">${x(ex.name.toUpperCase())}</text>
      <text x="1232" y="108" text-anchor="end" font-family="${FONT}" font-weight="600" font-size="18" fill="${C.muted}">${x(MUSCLE_GROUPS[ex.group])} · ${x(EQUIP_LABELS[ex.equip])} · ${x(LEVEL_LABELS[ex.level])}</text>
      <rect x="40" y="140" width="720" height="540" rx="24" fill="${C.surface}" stroke="${C.border}"/>
      <rect x="780" y="140" width="460" height="540" rx="24" fill="${C.surface}" stroke="${C.border}"/>
      <text x="64" y="178" font-family="${FONT}" font-weight="800" font-size="14" letter-spacing="3" fill="${C.muted}">${leftTitle}</text>
      <text x="806" y="178" font-family="${FONT}" font-weight="800" font-size="14" letter-spacing="3" fill="${C.muted}">MUSCLES WORKED</text>
      ${mm}
      ${legend.join('')}
      <text x="48" y="706" font-family="${FONT}" font-weight="700" font-size="14" fill="${C.danger}">Pain, not discomfort? Stop the exercise.</text>
      <text x="1232" y="706" text-anchor="end" font-family="${FONT}" font-size="13" fill="${C.muted}">Sample media · original MuscularMen artwork · not medical advice</text>`;
  }
  const svgDoc = inner => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${STYLE}${inner}</svg>`;

  async function svgToImage(svg) {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const img = new Image();
    img.src = url;
    await img.decode();
    URL.revokeObjectURL(url);
    return img;
  }
  const blobToB64 = blob => new Promise(res => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.readAsDataURL(blob); });
  const canvas = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };

  /* ---------- PNG illustration ---------- */
  function imageSVG(ex) {
    const cues = ex.cues.slice(0, 3).map((c, i) => `
      <circle cx="84" cy="${578 + i * 32}" r="11" fill="${C.accent}"/>
      <text x="84" y="${583 + i * 32}" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="13" fill="${C.ink}">${i + 1}</text>
      <text x="106" y="${584 + i * 32}" font-family="${FONT}" font-size="19" fill="${C.text}">${x(c)}</text>`).join('');
    return svgDoc(`${chrome(ex, 'KEY POSITIONS')}
      <rect x="64" y="196" width="320" height="300" rx="18" fill="${C.surface2}"/>
      <rect x="416" y="196" width="320" height="300" rx="18" fill="${C.surface2}"/>
      ${figure(ex, 0, 79, 196, 290)}${figure(ex, 1, 431, 196, 290)}
      <circle cx="400" cy="346" r="22" fill="${C.accent}"/><path d="M390 346 H408 M401 338 L409 346 L401 354" stroke="${C.ink}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="224" y="526" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="15" letter-spacing="3" fill="${C.accent}">POSITION 1</text>
      <text x="576" y="526" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="15" letter-spacing="3" fill="${C.accent}">POSITION 2</text>
      <text x="64" y="556" font-family="${FONT}" font-weight="800" font-size="14" letter-spacing="3" fill="${C.muted}">FORM CUES</text>
      ${cues}`);
  }
  async function image(id) {
    const ex = EX[id];
    if (!ex) throw new Error('Unknown exercise ' + id);
    const c = canvas();
    c.getContext('2d').drawImage(await svgToImage(imageSVG(ex)), 0, 0);
    return c.toDataURL('image/png').split(',')[1];
  }

  /* ---------- MP4 demo video ---------- */
  async function video(id, { fps = 30, reps = 3, rep = 2.8 } = {}) {
    const ex = EX[id];
    if (!ex) throw new Error('Unknown exercise ' + id);
    const total = reps * rep, frames = Math.round(total * fps), perRep = Math.round(rep * fps);
    const FIG = 372;   // figure frame size in px
    const figFrames = [];
    for (let i = 0; i < perRep; i++) {
      const phase = (1 - Math.cos(2 * Math.PI * (i / perRep))) / 2;   // A → B → A, eased
      const svg = bodySVG(ex, phase).replace('<svg class="body-fig"', `<svg class="body-fig" width="${FIG}" height="${FIG}"`);
      figFrames.push(await createImageBitmap(await svgToImage(svg)));
    }
    const bg = await svgToImage(svgDoc(`${chrome(ex, 'STEP-BY-STEP DEMO')}
      <rect x="64" y="196" width="672" height="370" rx="18" fill="${C.surface2}"/>
      <rect x="64" y="580" width="672" height="78" rx="16" fill="${C.surface2}"/>`));
    const c = canvas(), ctx = c.getContext('2d');

    const drawFrame = i => {
      const t = i / fps, repIdx = Math.min(reps - 1, Math.floor(t / rep));
      ctx.drawImage(bg, 0, 0);
      ctx.drawImage(figFrames[i % perRep], 400 - FIG / 2, 196);
      // rep counter + tempo
      ctx.font = `800 20px ${FONT}`; ctx.fillStyle = C.accent; ctx.textAlign = 'right';
      ctx.fillText(`REP ${repIdx + 1} / ${reps}`, 720, 228);
      ctx.font = `600 15px ${FONT}`; ctx.fillStyle = C.muted;
      ctx.fillText('Slow & controlled', 720, 250);
      // step caption (one instruction step per rep)
      const step = ex.steps[repIdx % ex.steps.length];
      ctx.textAlign = 'center'; ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(104, 619, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink; ctx.font = `800 20px ${FONT}`; ctx.fillText(String((repIdx % ex.steps.length) + 1), 104, 626);
      ctx.textAlign = 'left'; ctx.fillStyle = C.text; ctx.font = `500 19px ${FONT}`;
      const lines = wrap(step, 56).slice(0, 2);
      lines.forEach((l, j) => ctx.fillText(l, 138, (lines.length === 1 ? 626 : 612) + j * 26));
      // progress bar
      ctx.fillStyle = C.border; ctx.fillRect(64, 668, 672, 6);
      ctx.fillStyle = C.accent; ctx.fillRect(64, 668, 672 * Math.min(1, t / total), 6);
    };

    drawFrame(0);
    const stream = c.captureStream(0), track = stream.getVideoTracks()[0];
    const mime = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 1000000 });
    const chunks = [];
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const stopped = new Promise(r => { rec.onstop = r; });
    rec.start();
    const t0 = performance.now();
    await new Promise(resolve => {
      let last = -1;
      const tick = () => {
        const i = Math.floor((performance.now() - t0) / 1000 * fps);
        if (i >= frames) { resolve(); return; }
        if (i !== last) { drawFrame(i); track.requestFrame(); last = i; }
        setTimeout(tick, 4);
      };
      tick();
    });
    rec.stop();
    await stopped;
    return { mime, ext: mime.startsWith('video/mp4') ? 'mp4' : 'webm', b64: await blobToB64(new Blob(chunks, { type: mime })) };
  }

  window.TFMedia = { image, video, imageSVG };
})();
