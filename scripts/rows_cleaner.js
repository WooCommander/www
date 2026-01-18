
const fs = require('fs');
const path = require('path');

const files = [
    path.join(__dirname, 'src/data/questions.ts'),
    path.join(__dirname, 'questions_dump.json')
];

files.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    console.log(`Processing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');

    // Stats before
    const initialCount = (content.match(/["']title["']\s*:\s*["']\d+(\.|\\\\.)\s*/g) || []).length;
    console.log(`Found ${initialCount} titles to clean.`);

    // Regex to find "title": "123. " or "title": "123\\. " and replace with "title": "
    // We capture the "title": " part (group 1) and keep it, discarding the number and dot/space.
    const newContent = content.replace(/(["']title["']\s*:\s*["'])\d+(?:\.|\\\\.)\s*/g, '$1');

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${filePath}.`);
    } else {
        console.log(`No changes needed for ${filePath}.`);
    }
});
