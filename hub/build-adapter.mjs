import {readFile,writeFile} from 'node:fs/promises';
const source=await readFile(new URL('../frontend/src/App.jsx',import.meta.url),'utf8');
if(!source.includes('export function HighlandPreview'))throw new Error('HighlandPreview export is required');
await writeFile(new URL('./preview.jsx',import.meta.url),source.replace("from 'react-router-dom'","from 'react-router'").replace("from './api/contentApi'","from './contentApi.js'"));
await writeFile(new URL('./contentApi.js',import.meta.url),await readFile(new URL('../frontend/src/api/contentApi.js',import.meta.url)));
await writeFile(new URL('./styles.js',import.meta.url),'export const highlandCss='+JSON.stringify(await readFile(new URL('../frontend/src/index.css',import.meta.url),'utf8'))+';\n');
console.log('Exported original Highland renderer and CSS; content defaults are unchanged.');
