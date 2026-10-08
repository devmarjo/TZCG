import { execFileSync } from 'node:child_process';
const output=execFileSync(process.platform==='win32'?'npm.cmd':'npm',['pack','--dry-run','--json','--ignore-scripts'],{encoding:'utf8'});
const [pack]=JSON.parse(output);
const allowed=/^(dist\/(index\.(js|cjs|d\.ts|d\.cts)|styles\.css)|README\.md|LICENSE|THIRD_PARTY_NOTICES\.md|package\.json|outputs\/DADOS\.json)$/;
for(const file of pack.files) if(!allowed.test(file.path))throw Error(`Unexpected package file: ${file.path}`);
for(const path of ['dist/index.js','dist/index.cjs','dist/index.d.ts','dist/index.d.cts','dist/styles.css','LICENSE','THIRD_PARTY_NOTICES.md','outputs/DADOS.json'])if(!pack.files.some(f=>f.path===path))throw Error(`Missing package file: ${path}`);
console.log(`Package verified: ${pack.files.length} files; ${(pack.size/1024/1024).toFixed(2)} MB compressed`);
