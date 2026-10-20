import { describe, expect, it } from 'vitest';
import { normalizeSTIX, normalizeIPsum, normalizeFeodo, validateDataset } from '../scripts/normalize.mjs';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
describe('Veri doğruluğu', () => {
  it('dağıtılan veride yetim veya uydurma IOC ilişkisi yok', async () => {
    const d = JSON.parse(await readFile(new URL('../public/data/intelligence.json',import.meta.url),'utf8'));
    expect(validateDataset(d)).toBe(true);
    expect(d.relationships.every(r=>r.id.startsWith('relationship--'))).toBe(true);
    expect(d.relationships.some(r=>r.source.startsWith('ipsum:')||r.target.startsWith('feodo:'))).toBe(false);
    expect(d.sources.filter(s=>s.status==='ok').every(s=>s.fetchedAt && s.sha256)).toBe(true);
  });
  it('STIX iptal edilmiş nesneleri ve yetim kenarları dışlar', () => {
    const d=normalizeSTIX({type:'bundle',objects:[{type:'intrusion-set',id:'a',name:'Fixture actor'},{type:'attack-pattern',id:'b',name:'Fixture technique'},{type:'attack-pattern',id:'c',name:'Revoked',revoked:true},{type:'relationship',id:'r',source_ref:'a',target_ref:'b',relationship_type:'uses'},{type:'relationship',id:'bad',source_ref:'a',target_ref:'c'}]});
    expect(d.entities).toHaveLength(2); expect(d.relationships).toHaveLength(1);
  });
  it('IPsum skor eşiklerini uygular, gözlem tarihleri üretmez', () => {
    const d=normalizeIPsum('# comment\n192.0.2.1\t4\n192.0.2.2\t1\n999.1.1.1\t5');
    expect(d).toHaveLength(1); expect(d[0].lastSeen).toBeNull();
  });
  it('Feodo boş feedini kabul eder, bozuk şemayı reddeder', () => {
    expect(normalizeFeodo([])).toEqual([]); expect(()=>normalizeFeodo({})).toThrow(); expect(()=>normalizeFeodo([{bad:'schema'}])).toThrow();
  });
  it('kaynaklar erişilemediğinde snapshot kayıtlarını aynen korur', async () => {
    // Operates on a disposable copy rather than mutating the shipped snapshot.
    const { mkdtemp, mkdir, cp, rm }=await import('node:fs/promises'); const { fileURLToPath }=await import('node:url'); const { join }=await import('node:path');
    const work=fileURLToPath(new URL('../work/',import.meta.url)); await mkdir(work,{recursive:true});
    const temp=await mkdtemp(join(work,'tih-test-'));
    try {
      await cp(new URL('../scripts/',import.meta.url),join(temp,'scripts'),{recursive:true}); await mkdir(join(temp,'public/data'),{recursive:true});
      await cp(new URL('../public/data/intelligence.json',import.meta.url),join(temp,'public/data/intelligence.json'));
      const before=JSON.parse(await readFile(join(temp,'public/data/intelligence.json'),'utf8'));
      execFileSync(process.execPath,[join(temp,'scripts/update-data.mjs')],{env:{...process.env,DATA_OFFLINE:'1'},stdio:'pipe'});
      const after=JSON.parse(await readFile(join(temp,'public/data/intelligence.json'),'utf8'));
      expect(after.indicators).toEqual(before.indicators); expect(after.entities).toEqual(before.entities); expect(after.relationships).toEqual(before.relationships);
      expect(after.sources.every(s=>s.status==='stale')).toBe(true); expect(after.sources.map(s=>s.fetchedAt)).toEqual(before.sources.map(s=>s.fetchedAt));
    } finally { await rm(temp,{recursive:true,force:true}); }
  });
});
