import fs from 'fs';
import path from 'path';

const distDir = path.resolve('./dist');
const htmlFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.html'));

console.log(`Auditing ${htmlFiles.length} generated pages in ./dist...`);

let errorsFound = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(distDir, file), 'utf-8');
  
  // 1. Check viewport tag
  if (!content.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0">')) {
    console.error(`[ERROR] ${file} is missing standard responsive viewport meta tag!`);
    errorsFound++;
  }

  // 2. Check mobile drawer & hamburger toggle exists (for interactive pages)
  if (file !== '404.html' && (!content.includes('class="mobile-drawer"') || !content.includes('class="menu-toggle"'))) {
    console.error(`[ERROR] ${file} is missing mobile drawer or menu toggle!`);
    errorsFound++;
  }

  // 3. Check for fixed oversized pixel widths in inline styles
  const fixedWidthMatch = content.match(/style="[^"]*width:\s*([3-9]\d{2}|[1-9]\d{3,})px/gi);
  if (fixedWidthMatch) {
    console.warn(`[WARN] ${file} has potentially hazardous fixed width in inline styles:`, fixedWidthMatch);
  }

  // 4. Check for unhandled horizontal overflows in grid definitions
  const hardcodedGridMatch = content.match(/grid-template-columns:\s*repeat\([3-9],\s*1fr\)/gi);
  if (hardcodedGridMatch) {
    console.warn(`[WARN] ${file} has hardcoded multi-column grid without media query:`, hardcodedGridMatch);
  }

  // 5. Check all internal links exist
  const hrefMatches = [...content.matchAll(/href="([^"#:]+)(#[^"]*)?"/g)];
  for (const match of hrefMatches) {
    const rawHref = match[1];
    if (rawHref.startsWith('http') || rawHref.startsWith('mailto') || rawHref.startsWith('tel')) continue;
    
    let targetPath = rawHref === '/' ? 'index.html' : rawHref.replace(/^\//, '');
    if (!fs.existsSync(path.join(distDir, targetPath))) {
      console.error(`[ERROR] ${file} links to non-existent route: ${rawHref}`);
      errorsFound++;
    }
  }

  // 6. Check images have alt text
  const imgTags = content.match(/<img[^>]*>/gi) || [];
  for (const img of imgTags) {
    if (!img.includes('alt=')) {
      console.warn(`[WARN] ${file} has img without alt:`, img);
    }
  }
}

// 7. Audit CSS for mobile-safety
const cssFile = fs.readdirSync(path.join(distDir, 'assets')).find(f => f.endsWith('.css'));
if (cssFile) {
  const css = fs.readFileSync(path.join(distDir, 'assets', cssFile), 'utf-8');
  
  // Check that html/body have overflow-x: hidden
  if (!css.includes('overflow-x:hidden')) {
    console.warn('[WARN] CSS missing overflow-x: hidden on html/body');
  }

  // Check that responsive breakpoints exist for 480px, 768px, 900px, 1024px
  const has480 = css.includes('480px');
  const has768 = css.includes('768px');
  const has900 = css.includes('900px');
  const has1024 = css.includes('1024px');
  
  console.log(`Responsive breakpoints present in compiled CSS: 480px (${has480}), 768px (${has768}), 900px (${has900}), 1024px (${has1024})`);
  
  if (!has480 || !has768 || !has900) {
    console.error('[ERROR] Essential responsive media queries missing from CSS');
    errorsFound++;
  }
}

if (errorsFound === 0) {
  console.log('✓ All responsive checks PASSED with 0 errors!');
} else {
  console.error(`Found ${errorsFound} errors during responsive audit.`);
  process.exit(1);
}
