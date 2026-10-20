import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { normalizeSTIX, normalizeIPsum, normalizeFeodo, validateDataset, digest } from './normalize.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const target = `${root}public/data/intelligence.json`;
let previous;
try { previous = JSON.parse(await readFile(target, 'utf8')); validateDataset(previous); } catch { previous = null; }
const now = new Date().toISOString();
const configs = [
  { id: 'mitre', name: 'MITRE ATT&CK Enterprise', url: 'https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json', license: 'MITRE ATT&CK Terms of Use', licenseUrl: 'https://github.com/mitre-attack/attack-stix-data/blob/master/LICENSE.txt' },
  { id: 'ipsum', name: 'IPsum', url: 'https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt', license: 'Unlicense', licenseUrl: 'https://github.com/stamparm/ipsum/blob/master/LICENSE', limit: 10000 },
  { id: 'feodo', name: 'Feodo Tracker', url: 'https://feodotracker.abuse.ch/downloads/ipblocklist.json', license: 'CC0', licenseUrl: 'https://feodotracker.abuse.ch/blocklist/#tos' }
];
const next = { schemaVersion: 1, generatedAt: now, indicators: [], entities: previous?.entities || [], relationships: previous?.relationships || [], tactics: previous?.tactics || [], sources: [] };
await mkdir(`${root}public/data`, { recursive: true });
await mkdir(`${root}public/licenses`, { recursive: true });
for (const config of configs) {
  const old = previous?.sources.find(s => s.id === config.id);
  try {
    if (process.env.DATA_OFFLINE === '1') throw new Error('Çevrimdışı test modu');
    const response = await fetch(config.url, { signal: AbortSignal.timeout(90000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (text.length > 100 * 1024 * 1024) throw new Error('Kaynak boyutu sınırı aşıldı');
    let count;
    if (config.id === 'mitre') { const data = normalizeSTIX(JSON.parse(text)); Object.assign(next, data); count = data.entities.length; }
    else { const data = config.id === 'ipsum' ? normalizeIPsum(text, config.limit) : normalizeFeodo(JSON.parse(text)); next.indicators.push(...data); count = data.length; }
    next.sources.push({ ...config, status: 'ok', fetchedAt: now, attemptedAt: now, count, sha256: digest(text), upstreamModified: response.headers.get('last-modified') });
    console.log(`${config.id}: ${count} kayıt`);
  } catch (error) {
    const retained = previous?.indicators.filter(i => i.source === config.id) || [];
    next.indicators.push(...retained);
    next.sources.push({ ...config, ...old, status: old?.fetchedAt ? 'stale' : 'unavailable', fetchedAt: old?.fetchedAt || null, attemptedAt: now, count: old?.count || 0, error: String(error.message).slice(0, 300) });
    console.warn(`${config.id}: ${error.message}; önceki veri korunuyor`);
  }
}
if (!next.entities.length && !next.indicators.length) throw new Error('İlk veri seti oluşturulamadı; mevcut dosya değiştirilmedi');
validateDataset(next);
await writeFile(`${target}.tmp`, JSON.stringify(next));
await rename(`${target}.tmp`, target);
// Redistribution notices are preserved locally; license-download failures do not affect the data snapshot.
if (process.env.DATA_OFFLINE !== '1') for (const [name, url] of [['MITRE.txt', 'https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/LICENSE.txt'], ['IPsum.txt', 'https://raw.githubusercontent.com/stamparm/ipsum/master/LICENSE']]) {
  try { const r = await fetch(url, { signal: AbortSignal.timeout(15000) }); if (r.ok) await writeFile(`${root}public/licenses/${name}`, await r.text()); } catch { console.warn(`${name}: mevcut lisans korunuyor`); }
}
