const fs = require('fs');
const path = require('path');

let replaced = 0;

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.jsx')) {
      let content = fs.readFileSync(p, 'utf8');
      
      const regex = /fontSize:\s*(\d+)(\s*[,}\n])/g;
      
      let newContent = content.replace(regex, (match, numStr, ending) => {
        replaced++;
        let num = parseInt(numStr);
        // Base + 4 to significantly increase font sizes as requested.
        // And use calc() + 0.5vw so it expands correctly on tablet/desktop.
        return `fontSize: 'calc(${num + 4}px + 0.5vw)'${ending}`;
      });

      if (newContent !== content) {
        fs.writeFileSync(p, newContent);
      }
    }
  });
}

walk('src');
console.log(`Replaced ${replaced} fontSize instances.`);
