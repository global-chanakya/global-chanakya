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

  content = content.replace(/(?:className|class)=(["']|`)(.*?)\1/g, (match, quote, inner) => {
    // 1. replace ' hover:/10 ' with empty
    let fixed = inner.replace(/\bhover:\/\d+\b/g, '');
    fixed = fixed.replace(/\bgroup-hover:\/\d+\b/g, '');
    
    // 2. replace standalone 'hover:' or 'group-hover:'
    fixed = fixed.replace(/\bhover:\s+(?![\w-])/g, ' ');
    fixed = fixed.replace(/\bgroup-hover:\s+(?![\w-])/g, ' ');
    
    // Also clean up any lingering multiple spaces
    fixed = fixed.replace(/\s{2,}/g, ' ').trim();
    
    return `className=${quote}${fixed}${quote}`;
  });

  if (content !== originalContent) {
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`Fixed prefix remnants in ${filePath}`);
  }
}

processDirectory(WEB_DIR).then(() => {
  console.log('Done fixing prefix remnants.');
}).catch(err => {
  console.error(err);
});
