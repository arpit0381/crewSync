const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // Backgrounds
  { regex: /\bbg-zinc-950\/(\d+)\b/g, replacement: 'bg-background/$1' },
  { regex: /\bbg-zinc-950\b/g, replacement: 'bg-background' },
  { regex: /\bbg-zinc-900\/(\d+)\b/g, replacement: 'bg-card/$1' },
  { regex: /\bbg-zinc-900\b/g, replacement: 'bg-card' },
  { regex: /\bbg-zinc-850\/(\d+)\b/g, replacement: 'bg-muted/$1' },
  { regex: /\bbg-zinc-850\b/g, replacement: 'bg-muted' },
  { regex: /\bbg-zinc-800\/(\d+)\b/g, replacement: 'bg-muted/$1' },
  { regex: /\bbg-zinc-800\b/g, replacement: 'bg-muted' },
  { regex: /\bbg-zinc-955\b/g, replacement: 'bg-background' }, // if any
  
  // Hover Backgrounds
  { regex: /\bhover:bg-zinc-950\b/g, replacement: 'hover:bg-background' },
  { regex: /\bhover:bg-zinc-900\b/g, replacement: 'hover:bg-accent' },
  { regex: /\bhover:bg-zinc-850\b/g, replacement: 'hover:bg-accent' },
  { regex: /\bhover:bg-zinc-800\b/g, replacement: 'hover:bg-accent' },

  // Borders
  { regex: /\bborder-zinc-900\/(\d+)\b/g, replacement: 'border-border/$1' },
  { regex: /\bborder-zinc-900\b/g, replacement: 'border-border' },
  { regex: /\bborder-zinc-850\/(\d+)\b/g, replacement: 'border-border/$1' },
  { regex: /\bborder-zinc-850\b/g, replacement: 'border-border' },
  { regex: /\bborder-zinc-800\/(\d+)\b/g, replacement: 'border-border/$1' },
  { regex: /\bborder-zinc-800\b/g, replacement: 'border-border' },
  { regex: /\bborder-zinc-700\b/g, replacement: 'border-border' },
  
  // Hover Borders
  { regex: /\bhover:border-zinc-700\b/g, replacement: 'hover:border-border' },
  { regex: /\bhover:border-zinc-800\b/g, replacement: 'hover:border-border' },

  // Text Colors
  { regex: /\btext-white\b/g, replacement: 'text-foreground' },
  { regex: /\btext-zinc-300\b/g, replacement: 'text-foreground' },
  { regex: /\btext-zinc-400\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-zinc-500\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-zinc-550\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-zinc-600\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-zinc-700\b/g, replacement: 'text-muted-foreground' },
  
  // Placeholders
  { regex: /\bplaceholder-zinc-500\b/g, replacement: 'placeholder-muted-foreground' },
  { regex: /\bplaceholder-zinc-505\b/g, replacement: 'placeholder-muted-foreground' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  for (const r of replacements) {
    content = content.replace(r.regex, r.replacement);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated: ${filePath}`);
  }
}

console.log('Starting refactoring...');
processDirectory(directoryPath);
console.log('Refactoring complete!');
