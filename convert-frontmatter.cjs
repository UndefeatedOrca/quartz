const fs = require('fs');
const path = require('path');

// Configuration
const CONTENT_DIR = './content'; // Adjust if needed
const DRY_RUN = false; // Set to false to actually modify files

function parseFilename(filename) {
  // Match YY-M-D - Title.md (supports single or double digit months/days)
  const match = filename.match(/^(\d{2})-(\d{1,2})-(\d{1,2})\s*-\s*(.+)\.md$/);
  if (!match) return null;
  
  const [, year, month, day, title] = match;
  const fullYear = `20${year}`; // Assumes 20XX
  // Pad month and day with leading zeros if needed
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');
  const date = `${fullYear}-${paddedMonth}-${paddedDay}`;
  
  // Keep day in title for chronological reference
  const newTitle = `${day} - ${title}`;
  
  return { date, title: newTitle };
}

function extractTags(content) {
  const lines = content.split('\n');
  
  // Find all lines from the end that contain tags
  let tagLineIndices = [];
  let allTags = [];
  
  // Scan from end, collecting lines with tags
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (line === '') continue;
    
    // Check if line contains tags
    const tagMatches = line.match(/#[\w\/-]+/g);
    
    if (tagMatches) {
      tagLineIndices.push(i);
      allTags.push(...tagMatches.map(tag => tag.slice(1)));
    } else {
      // Stop at first non-tag, non-empty line
      break;
    }
  }
  
  if (allTags.length === 0) {
    return { tags: [], contentWithoutTags: content };
  }
  
  // Find the earliest tag line index
  const firstTagLineIndex = Math.min(...tagLineIndices);
  
  // Remove tag lines and trailing empty lines
  const contentLines = lines.slice(0, firstTagLineIndex);
  const contentWithoutTags = contentLines.join('\n').trimEnd();
  
  return { tags: allTags, contentWithoutTags };
}

function addFrontmatter(content, metadata) {
  const { date, title, tags } = metadata;
  
  let frontmatter = '---\n';
  frontmatter += `title: "${title}"\n`;
  frontmatter += `created: ${date}\n`;
  
  if (tags && tags.length > 0) {
    frontmatter += 'tags:\n';
    tags.forEach(tag => {
      frontmatter += `  - ${tag}\n`;
    });
  }
  
  frontmatter += '---\n\n';
  
  return frontmatter + content;
}

function processFile(filePath) {
  const filename = path.basename(filePath);
  const parsed = parseFilename(filename);
  
  if (!parsed) {
    console.log(`⏭️  Skipping ${filename} (doesn't match format)`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has frontmatter
  if (content.startsWith('---')) {
    console.log(`⏭️  Skipping ${filename} (already has frontmatter)`);
    return;
  }
  
  const { tags, contentWithoutTags } = extractTags(content);
  const newContent = addFrontmatter(contentWithoutTags, {
    date: parsed.date,
    title: parsed.title,
    tags,
  });
  
  if (DRY_RUN) {
    console.log(`\n📝 Would process: ${filename}`);
    console.log(`   Date: ${parsed.date}`);
    console.log(`   Title: ${parsed.title}`);
    console.log(`   Tags: ${tags.join(', ') || 'none'}`);
  } else {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Processed: ${filename}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath); // Recursively process subdirectories
    } else if (file.endsWith('.md')) {
      processFile(filePath);
    }
  });
}

// Main execution
console.log(`🚀 Starting batch conversion...`);
console.log(`📂 Content directory: ${CONTENT_DIR}`);
console.log(`🔍 Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE (files will be modified)'}\n`);

if (!fs.existsSync(CONTENT_DIR)) {
  console.error(`❌ Content directory not found: ${CONTENT_DIR}`);
  process.exit(1);
}

processDirectory(CONTENT_DIR);

console.log(`\n✨ Done!`);
if (DRY_RUN) {
  console.log(`\n⚠️  This was a dry run. Set DRY_RUN = false to actually modify files.`);
}