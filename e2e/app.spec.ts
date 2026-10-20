import { test, expect } from '@playwright/test';
test('modüller, arama, analiz, dışa aktarma ve graph çalışır', async ({ page }, testInfo) => {
  const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/'); await expect(page.getByRole('heading',{name:'Ne araştırmak istiyorsunuz?'})).toBeVisible();
  await expect(page.locator('.task-card')).toHaveCount(3);
  await expect(page.locator('nav a[href="#graph"]')).not.toBeVisible();
  await page.screenshot({path:`work/${testInfo.project.name}-dashboard.png`,fullPage:true});
  const nav = async(id:string)=>{await page.goto(`/#${id}`); await expect(page.locator('main .panel').first()).toBeVisible();};
  await nav('iocs'); await expect(page.getByRole('heading',{name:'Gösterge Kütüphanesi'})).toBeVisible();
  await page.getByLabel('Hızlı arama').fill('unlikely-nonexistent-value'); await expect(page.getByText('Kayıt bulunamadı')).toBeVisible();
  await page.getByLabel('Hızlı arama').fill(''); await page.getByRole('combobox',{name:'IOC türü',exact:true}).selectOption('domain'); await expect(page.getByText('Kayıt bulunamadı')).toBeVisible();
  await page.getByRole('combobox',{name:'IOC türü',exact:true}).selectOption('ip');
  const download=page.waitForEvent('download'); await page.getByRole('button',{name:'CSV',exact:true}).click(); expect((await download).suggestedFilename()).toBe('threat-iocs.csv');
  await page.locator('.value-button').first().click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
  await nav('attack'); await page.getByLabel('Hızlı arama').fill('T1059'); await expect(page.locator('.technique-list')).toContainText('T1059'); await page.locator('.technique-list>button').first().click(); await expect(page.getByRole('dialog')).toContainText('Kaynak Bağlantıları'); await page.keyboard.press('Escape');
  await nav('actors'); await page.getByLabel('Hızlı arama').fill('APT29'); await expect(page.locator('.actor-card')).toHaveCount(1); await page.locator('.actor-card').click(); await expect(page.getByRole('dialog')).toContainText('Bilinen Takma İsimler'); await page.keyboard.press('Escape');
  await nav('analyzer'); await page.getByLabel('Analiz edilecek metin').fill('192.0.2.1 example.org CVE-2024-12345'); await page.getByRole('button',{name:'Kontrol Et',exact:true}).click(); await expect(page.locator('tbody')).toContainText('Eşleşme yok'); await page.getByRole('button',{name:'Listeye Ekle'}).click(); await expect(page.locator('tbody')).toContainText('Yalnızca kullanıcı verisi');
  await page.getByLabel('IOC dosyası yükle').setInputFiles({name:'test.csv',mimeType:'text/csv',buffer:Buffer.from('value\nexample.org\nnot-valid\n')}); await expect(page.getByRole('status')).toContainText('1 geçersiz satır');
  await page.getByLabel('IOC dosyası yükle').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{broken')}); await expect(page.getByRole('alert')).toBeVisible();
  await nav('graph'); await expect(page.locator('.graph canvas').first()).toBeVisible(); await page.getByRole('combobox',{name:'Düğüm türü'}).selectOption('indicator'); await page.getByRole('button',{name:'Grafiği yakınlaştır'}).click(); await page.getByRole('button',{name:'Grafiği sığdır'}).click();
  await nav('sources'); await expect(page.getByRole('heading',{name:'IPsum',exact:true})).toBeVisible(); await page.locator('.source-card').filter({has:page.getByRole('heading',{name:'IPsum',exact:true})}).getByText('Kaynak bilgileri',{exact:true}).click(); await expect(page.getByText('Unlicense',{exact:true})).toBeVisible();
  expect(errors).toEqual([]);
  if(testInfo.project.name==='mobile') expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('veri dosyası hatası kontrollü gösterilir',async({page})=>{await page.route('**/data/intelligence.json',route=>route.fulfill({status:503,body:'offline'}));await page.goto('/');await expect(page.getByText('Statik veri dosyası okunamadı.',{exact:false})).toBeVisible();});
test('menüler, hızlı yönlendirme ve gerçek feed eşleştirmesi',async({page},testInfo)=>{
  await page.goto('/'); await expect(page.locator('.stats-grid')).toBeVisible();
  await page.getByLabel('Hızlı arama').fill('APT29'); await page.getByLabel('Hızlı arama').press('Enter');
  await expect(page).toHaveURL(/#actors$/); await expect(page.locator('.actor-card')).toHaveCount(1);
  if(testInfo.project.name==='mobile') await page.getByRole('button',{name:'Menüyü aç'}).click();
  await page.locator('nav a[href="#analyzer"]').click(); await expect(page.getByLabel('Analiz edilecek metin')).toBeVisible();
  const data=await (await page.request.get('/data/intelligence.json')).json(); const value=data.indicators[0].value;
  await page.getByLabel('IOC dosyası yükle').setInputFiles({name:'sample.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify([{value}]))});
  await expect(page.locator('tbody')).toContainText('Açık kaynak eşleşmesi');
  await page.locator('tbody .text-button').first().click(); await expect(page.getByRole('dialog')).toContainText(value); await page.keyboard.press('Escape');
  if(testInfo.project.name==='mobile') await page.getByRole('button',{name:'Menüyü aç'}).click();
  await page.locator('nav a[href="#dashboard"]').click(); await expect(page.locator('.stats-grid')).toBeVisible();
});
test('GitHub Pages proje alt yolu ve hash yenilemesi çalışır',async({page})=>{
  await page.route('**/test-repo/**',async route=>{const url=new URL(route.request().url());url.pathname=url.pathname.replace('/test-repo/','/');const response=await route.fetch({url:url.href});await route.fulfill({response});});
  await page.goto('/test-repo/#attack'); await expect(page.locator('.technique-list')).toBeVisible();
  await page.reload(); await expect(page.locator('.technique-list')).toBeVisible();
});

