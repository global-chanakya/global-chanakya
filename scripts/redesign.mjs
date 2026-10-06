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

  // Safe targeted class replacements
  content = content.replace(/\brounded-3xl\b/g, 'rounded-lg');
  content = content.replace(/\brounded-2xl\b/g, 'rounded-sm');
  content = content.replace(/\brounded-xl\b/g, 'rounded-sm');
  
  content = content.replace(/\bshadow-2xl\b/g, 'shadow-sm');
  content = content.replace(/\bshadow-xl\b/g, 'shadow-sm');
  content = content.replace(/\bshadow-lg\b/g, 'shadow-sm');
  content = content.replace(/shadow-\[[^\]]+\]/g, ''); // colored shadows
  
  content = content.replace(/\bglass-card\b/g, 'bg-[var(--surface)]');
  content = content.replace(/\bbackdrop-blur-[a-z0-9]+\b/g, '');
  content = content.replace(/\bbackdrop-blur\b/g, '');
  
  // Gradients
  content = content.replace(/\bbg-gradient-to-[a-z]+\b/g, '');
  content = content.replace(/\bfrom-[a-zA-Z0-9-\[\]\(\),#%]+\b/g, '');
  content = content.replace(/\bvia-[a-zA-Z0-9-\[\]\(\),#%]+\b/g, '');
  content = content.replace(/\bto-[a-zA-Z0-9-\[\]\(\),#%]+\b/g, '');
  
  content = content.replace(/\btext-transparent\b/g, 'text-[var(--text)]');
  content = content.replace(/\bbg-clip-text\b/g, '');
  
  content = content.replace(/\bhover:shadow-[a-zA-Z0-9-\[\]\(\),#%]+\b/g, '');
  content = content.replace(/\bdrop-shadow-[a-zA-Z0-9-\[\]\(\),#%]+\b/g, '');
  
  // Specific border color tweaks based on our new color variables
  content = content.replace(/border-\[var\(--gold\)\]\/[0-9]+/g, 'border-[var(--accent)]');
  content = content.replace(/border-\[var\(--cyan\)\]\/[0-9]+/g, 'border-[var(--border)]');

  // Specific orb backgrounds removal (blur-[...])
  content = content.replace(/\bblur-\[[0-9]+px\]\b/g, '');

  if (content !== originalContent) {
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

processDirectory(WEB_DIR).then(() => {
  console.log('Done replacing vibe-coded classes safely.');
}).catch(err => {
  console.error(err);
});
