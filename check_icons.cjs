const lr = require('./node_modules/lucide-react/dist/cjs/lucide-react.js');
const fs = require('fs');
const path = require('path');

function findJsx(dir) {
  let r = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory() && !f.name.includes('node_modules')) r.push(...findJsx(p));
    else if (f.name.endsWith('.jsx')) r.push(p);
  }
  return r;
}

const files = findJsx('./src');
const missing = [];
const skipNames = ['Icon','SectionIcon','StatIcon','BadgeIcon','NutritionIcons','StatusIcons','RoleIcons'];

for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const matches = c.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"].*Icons['"]/g);
  for (const m of matches) {
    const names = m[1].split(',').map(s => s.trim()).filter(s => s && !skipNames.includes(s));
    for (const n of names) {
      if (!lr[n]) {
        missing.push(n + ' -> ' + path.basename(f));
      }
    }
  }
}

if (missing.length === 0) {
  console.log('All icons OK!');
} else {
  console.log('Missing icons:');
  missing.forEach(m => console.log('  ' + m));
}
