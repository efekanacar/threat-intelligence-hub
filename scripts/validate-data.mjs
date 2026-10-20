import { readFile } from 'node:fs/promises';
import { validateDataset } from './normalize.mjs';
const data = JSON.parse(await readFile(new URL('../public/data/intelligence.json', import.meta.url), 'utf8'));
validateDataset(data);
console.log(`Doğrulandı: ${data.indicators.length} IOC kaydı, ${data.entities.length} varlık, ${data.relationships.length} kaynak ilişkisi.`);
