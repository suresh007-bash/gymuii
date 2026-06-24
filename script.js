const fs = require('fs');
const path = require('path');
function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.jsx')) {
      let code = fs.readFileSync(p, 'utf8');
      let modified = code.replace(/fontSize:\s*(\d+)/g, (m, p1) => {
        let s = parseInt(p1);
        if (s >= 10 && s <= 18) {
          let min = s < 12 ? s + 2 : s + 1;
          let max = s + 4;
          let vw = (s * 0.2).toFixed(1);
          return 'fontSize: \'clamp(' + min + 'px, ' + vw + 'vw, ' + max + 'px)\'';
        }
        return m;
      });
      // also replace display: flex with .nutrition-rings-grid in ScheduleFoods if possible, but let's do it manually
      if (code !== modified) {
        fs.writeFileSync(p, modified);
        console.log('Updated fonts in ' + p);
      }
    }
  });
}
walk('src/pages');
