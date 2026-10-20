import ipaddr from 'ipaddr.js';
import Papa from 'papaparse';
import type { Indicator, IOCType } from './types';
export interface Finding { value: string; type: IOCType | 'cve' }
export function formatDate(value?: string | null): string {
  if (!value) return 'Kaynakta belirtilmedi';
  const dayOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const parsed = new Date(dayOnly ? `${value}T00:00:00Z` : value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  if (Number.isNaN(parsed.getTime())) return 'Geçersiz kaynak tarihi';
  return dayOnly ? parsed.toLocaleDateString('tr-TR', { dateStyle: 'medium', timeZone: 'UTC' }) : parsed.toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });
}
export function classify(input: string): Finding | null {
  const raw = input.trim().replace(/\[\.\]/g, '.').replace(/^hxxps:/i, 'https:').replace(/^hxxp:/i, 'http:');
  if (!raw || raw.length > 4096) return null;
  if (/^CVE-\d{4}-\d{4,}$/i.test(raw)) return { value: raw.toUpperCase(), type: 'cve' };
  if (/^(?:[a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64})$/i.test(raw)) return { value: raw.toLowerCase(), type: 'hash' };
  if (ipaddr.isValid(raw) && (/^[\d.]+$/.test(raw) ? /^\d{1,3}(\.\d{1,3}){3}$/.test(raw) : raw.includes(':'))) return { value: ipaddr.parse(raw).toString(), type: 'ip' };
  if (/^https?:\/\//i.test(raw)) {
    try { const url = new URL(raw); if (url.hostname && !url.username && !url.password) return { value: url.href, type: 'url' }; } catch { /* invalid URL */ }
    return null;
  }
  const domain = raw.toLowerCase().replace(/\.$/, '');
  if (domain.length <= 253 && /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) return { value: domain, type: 'domain' };
  return null;
}
export function extract(text: string): Finding[] {
  const result = new Map<string, Finding>();
  const candidates = text.replace(/\[\.\]/g, '.').match(/(?:https?|hxxps?):\/\/[^\s<>"'`]+|\bCVE-\d{4}-\d{4,}\b|[a-zA-Z0-9_:.[\]-]+/g) || [];
  for (const token of candidates) { const found = classify(token.replace(/[),;.!?]+$/, '')); if (found) result.set(`${found.type}:${found.value}`, found); }
  return [...result.values()];
}
export function importFile(text: string, filename: string): { findings: Finding[]; rejected: number } {
  let values: unknown[];
  if (filename.toLowerCase().endsWith('.json')) {
    const data: unknown = JSON.parse(text);
    if (Array.isArray(data)) values = data;
    else if (data && typeof data === 'object' && Array.isArray((data as { indicators?: unknown }).indicators)) values = (data as { indicators: unknown[] }).indicators;
    else throw new Error('JSON bir dizi veya indicators dizisi içeren nesne olmalı.');
  } else {
    const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: 'greedy', transformHeader: h => h.trim().toLowerCase().replace(/^\uFEFF/, '') });
    // A one-column IOC file has no delimiter to detect; PapaParse reports a warning.
    const errors = parsed.errors.filter(e => e.code !== 'UndetectableDelimiter');
    if (errors.length) throw new Error('CSV biçimi geçersiz: ' + errors[0].message);
    if (!parsed.meta.fields?.some(h => ['value', 'ioc', 'indicator'].includes(h))) throw new Error('CSV başlığı value, ioc veya indicator sütunu içermeli.');
    values = parsed.data;
  }
  if (values.length > 50000) throw new Error('En fazla 50.000 satır yüklenebilir.');
  const unique = new Map<string, Finding>(); let rejected = 0;
  for (const entry of values) {
    const v = typeof entry === 'string' ? entry : entry && typeof entry === 'object' ? ((entry as Record<string, unknown>).value ?? (entry as Record<string, unknown>).ioc ?? (entry as Record<string, unknown>).indicator) : null;
    const found = typeof v === 'string' ? classify(v) : null;
    if (found) unique.set(`${found.type}:${found.value}`, found); else rejected++;
  }
  return { findings: [...unique.values()], rejected };
}
export function toLocalIndicators(findings: Finding[]): Indicator[] {
  return findings.filter((f): f is Finding & { type: IOCType } => f.type !== 'cve').map(f => ({ ...f, id: `local:${f.type}:${f.value}`, source: 'local', firstSeen: null, lastSeen: null, context: 'Kullanıcının yerel verisi. Tehdit doğrulaması yapılmadı.', imported: true }));
}
export function csvExport(rows: Indicator[]) {
  return Papa.unparse(rows.map(({ value, type, source, firstSeen, lastSeen, context }) => ({ value, type, source, firstSeen, lastSeen, context })), { escapeFormulae: true });
}
export function safeURL(value: string): string | null {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.href : null; } catch { return null; }
}
export function download(name: string, content: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
