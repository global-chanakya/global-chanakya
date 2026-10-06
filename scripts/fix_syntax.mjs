import fs from 'fs/promises';
import path from 'path';

const WEB_DIR = path.join(process.cwd(), 'apps/web/src');

async function processDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      await processFile(fullPath);
    }
  }
}

async function processFile(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let originalContent = content;

  // Find all className="..." or className={`...`}
  // This regex matches className followed by = and then either "" or {}
  content = content.replace(/(?:className|class)=(["']|`)(.*?)\1/g, (match, quote, inner) => {
    // inside inner, replace ' )]/50 ', ' )]/5 ', ' )] ' with empty string
    // also handle multiple spaces
    let fixed = inner.replace(/\s+\)\](\/\d+)?\s+/g, ' ');
    fixed = fixed.replace(/\s+\)\](\/\d+)?$/g, ''); // at the end
    fixed = fixed.replace(/^\)\](\/\d+)?\s+/g, ''); // at the start
    return `className=${quote}${fixed}${quote}`;
  });

  if (content !== originalContent) {
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`Fixed syntax in ${filePath}`);
  }
}

processDirectory(WEB_DIR).then(() => {
  console.log('Done fixing syntax.');
}).catch(err => {
  console.error(err);
});
