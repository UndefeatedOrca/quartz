const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

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

function processFile(filePath) {
  const filename = path.basename(filePath);
  const parsed = parseFilename(filename);
  
  if (!parsed) {
    console.log(`⏭️  Skipping ${filename} (doesn't match format)`);
    return;
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Parse existing frontmatter if present
  const { data: existingFrontmatter, content } = matter(fileContent);
  
  // Extract tags from content
  const { tags: extractedTags, contentWithoutTags } = extractTags(content);
  
  // Merge frontmatter
  const newFrontmatter = { ...existingFrontmatter };
  
  // Add title if missing or empty
  if (!newFrontmatter.title || newFrontmatter.title.trim() === '') {
    newFrontmatter.title = parsed.title;
  }
  
  // Add created date if missing or empty
  if (!newFrontmatter.created || newFrontmatter.created.toString().trim() === '') {
    newFrontmatter.created = parsed.date;
  }
  
  // Merge tags - combine existing with extracted, remove duplicates
  const existingTags = Array.isArray(newFrontmatter.tags) 
    ? newFrontmatter.tags 
    : (newFrontmatter.tags ? [newFrontmatter.tags] : []);
  
  const allTags = [...new Set([...existingTags, ...extractedTags])];
  
  if (allTags.length > 0) {
    newFrontmatter.tags = allTags;
  }
  
  // Reconstruct file with updated frontmatter
  const newContent = matter.stringify(contentWithoutTags, newFrontmatter);
  
  if (DRY_RUN) {
    console.log(`\n📝 Would process: ${filename}`);
    console.log(`   Title: ${newFrontmatter.title} ${existingFrontmatter.title ? '(preserved)' : '(added)'}`);
    console.log(`   Date: ${newFrontmatter.created} ${existingFrontmatter.created ? '(preserved)' : '(added)'}`);
    console.log(`   Tags: ${allTags.join(', ') || 'none'} ${extractedTags.length > 0 ? `(+${extractedTags.length} from content)` : ''}`);
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