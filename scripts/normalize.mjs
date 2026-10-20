import { isIP } from 'node:net';
import { createHash } from 'node:crypto';
export const digest = text => createHash('sha256').update(text).digest('hex');
export const refs = o => (o.external_references || []).filter(r => r.url?.startsWith('https://')).map(r => ({ name: r.source_name, url: r.url }));
export function normalizeSTIX(bundle) {
  if (bundle.type !== 'bundle' || !Array.isArray(bundle.objects)) throw new Error('Geçersiz STIX bundle');
  const active = bundle.objects.filter(o => !o.revoked && !o.x_mitre_deprecated);
  const kinds = { 'intrusion-set': 'actor', 'attack-pattern': 'technique', campaign: 'campaign' };
  const entities = active.filter(o => kinds[o.type]).map(o => ({ id: o.id, kind: kinds[o.type], name: o.name, description: o.description || '', externalId: (o.external_references || []).find(r => r.source_name === 'mitre-attack')?.external_id || '', aliases: o.aliases || [], tactics: (o.kill_chain_phases || []).filter(p => p.kill_chain_name === 'mitre-attack').map(p => p.phase_name), references: refs(o), modified: o.modified || '' }));
  if (!entities.some(e => e.kind === 'technique') || !entities.some(e => e.kind === 'actor')) throw new Error('STIX çekirdek alanları eksik');
  const ids = new Set(entities.map(e => e.id));
  const relationships = active.filter(o => o.type === 'relationship' && ids.has(o.source_ref) && ids.has(o.target_ref)).map(o => ({ id: o.id, source: o.source_ref, target: o.target_ref, type: o.relationship_type, description: o.description || '', references: refs(o) }));
  const tactics = active.filter(o => o.type === 'x-mitre-tactic').map(o => ({ id: (o.external_references || []).find(r => r.source_name === 'mitre-attack')?.external_id || o.id, name: o.name, shortname: o.x_mitre_shortname, url: refs(o)[0]?.url || '' }));
  return { entities, relationships, tactics };
}
export function normalizeIPsum(text, limit = 10000) {
  const rows = text.split(/\r?\n/).filter(s => s && !s.startsWith('#')).map(line => line.trim().split(/\s+/)).filter(([ip, score]) => isIP(ip) && Number(score) >= 3).slice(0, limit);
  if (!rows.length) throw new Error('IPsum geçerli kayıt içermiyor');
  return rows.map(([value, score]) => ({ id: `ipsum:${value}`, type: 'ip', value, source: 'ipsum', firstSeen: null, lastSeen: null, context: `${score} kaynak listesinde raporlandı. Kaynak: IPsum. Aktör atfı veya kesin zararlılık sonucu değildir.` }));
}
export function normalizeFeodo(data) {
  if (!Array.isArray(data)) throw new Error('Feodo JSON dizisi bekleniyordu');
  const records = new Map();
  for (const row of data) {
    if (!isIP(row.ip_address)) continue;
    const value = row.ip_address;
    records.set(value, { id: `feodo:${value}`, type: 'ip', value, source: 'feodo', firstSeen: row.first_seen || null, lastSeen: row.last_online || null, context: `${row.malware || 'Belirtilmedi'}; port: ${row.port || 'belirtilmedi'}; durum: ${row.status || 'belirtilmedi'}. Kaynakta raporlanan C2 gözlemi; aktör atfı yok.` });
  }
  if (data.length && !records.size) throw new Error('Feodo şeması değişmiş veya tüm kayıtlar geçersiz');
  return [...records.values()];
}
export function validateDataset(d) {
  if (d.schemaVersion !== 1 || !Array.isArray(d.sources) || !Array.isArray(d.tactics) || !Array.isArray(d.entities) || !Array.isArray(d.indicators) || !Array.isArray(d.relationships)) throw new Error('Veri şeması geçersiz');
  const ids = new Set(d.entities.map(e => e.id));
  if (ids.size !== d.entities.length || new Set(d.indicators.map(i => i.id)).size !== d.indicators.length) throw new Error('Yinelenen kimlik');
  if (d.relationships.some(r => !ids.has(r.source) || !ids.has(r.target))) throw new Error('Yetim ilişki');
  if (d.indicators.some(i => !i.value || !['ip','domain','url','hash'].includes(i.type) || !d.sources.some(s => s.id === i.source))) throw new Error('Geçersiz IOC');
  return true;
}
