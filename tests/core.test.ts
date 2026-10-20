import { describe, expect, it } from 'vitest';
import { classify, csvExport, extract, formatDate, importFile, safeURL, toLocalIndicators } from '../src/core';
describe('IOC ayrıştırma', () => {
  it('IPv4 ve IPv6 adreslerini doğrular, geçersiz IPyi reddeder', () => {
    expect(classify('192.0.2.1')).toEqual({ type: 'ip', value: '192.0.2.1' });
    expect(classify('2001:0db8::1')).toEqual({ type: 'ip', value: '2001:db8::1' });
    expect(classify('999.999.1.1')).toBeNull(); expect(classify('127.1')).toBeNull();
  });
  it('URL yolunu korur, hostname ve hash değerini normalleştirir', () => {
    expect(classify('hxxps://EXAMPLE[.]ORG/Case?a=X')?.value).toBe('https://example.org/Case?a=X');
    expect(classify('ABCDEF0123456789ABCDEF0123456789')?.value).toBe('abcdef0123456789abcdef0123456789');
    expect(classify('EXAMPLE.ORG.')?.value).toBe('example.org');
  });
  it('metinden göstergeleri çıkarır, tekrarı kaldırır, URL içinden ek domain uydurmaz', () => {
    expect(extract('IP: 192.0.2.1 192.0.2.1 hxxps://example[.]org/a CVE-2024-12345')).toEqual([
      {type:'ip',value:'192.0.2.1'}, {type:'url',value:'https://example.org/a'}, {type:'cve',value:'CVE-2024-12345'}
    ]);
  });
  it('credential içeren veya JavaScript URLlerini reddeder', () => {
    expect(classify('https://user:pass@example.org')).toBeNull();
    expect(safeURL('javascript:alert(1)')).toBeNull(); expect(safeURL('https://attack.mitre.org/')).toBeTruthy();
  });
});
describe('yerel dosyalar ve dışa aktarma', () => {
  it('yalnızca gün belirten kaynak tarihine saat uydurmaz', () => {
    expect(formatDate('2026-03-07')).not.toMatch(/\d{2}:\d{2}/);
    expect(formatDate('2026-03-07')).toContain('2026');
    expect(formatDate(null)).toBe('Kaynakta belirtilmedi');
    expect(formatDate('not-a-date')).toBe('Geçersiz kaynak tarihi');
  });
  it('CSV alıntılarını ve geçersiz satırları ele alır', () => {
    const result = importFile('value,context\n"example.org","a,b"\ninvalid,no\n','sample.csv');
    expect(result.findings).toEqual([{ value:'example.org',type:'domain' }]); expect(result.rejected).toBe(1);
  });
  it('tek sütunlu CSV şablonunu destekler', () => {
    const result=importFile('value\nexample.org\nnot-valid\n','template.csv');
    expect(result.findings).toHaveLength(1); expect(result.rejected).toBe(1);
  });
  it('JSON gösterge dizisini destekler ve yanlış şemayı reddeder', () => {
    expect(importFile('{"indicators":[{"value":"192.0.2.1"}]}','sample.json').findings).toHaveLength(1);
    expect(() => importFile('{"hello":1}','bad.json')).toThrow();
    expect(() => importFile('foo\nexample.org','bad.csv')).toThrow();
  });
  it('yerel girdiyi doğrulanmış veya tarihli tehdit olarak göstermez', () => {
    const records = toLocalIndicators([{ type:'ip',value:'192.0.2.1' },{type:'cve',value:'CVE-2024-12345'}]);
    expect(records).toHaveLength(1); expect(records[0].imported).toBe(true); expect(records[0].firstSeen).toBeNull();
  });
  it('CSV formül enjeksiyonunu kaçırır', () => {
    const records = toLocalIndicators([{type:'domain',value:'example.org'}]); records[0].context='=HYPERLINK("https://example.org")';
    expect(csvExport(records)).toContain("'=HYPERLINK");
  });
});
