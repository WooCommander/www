import fs from 'fs';
import path from 'path';

const tsPath = path.join(process.cwd(), 'src/data/questions.ts');
let content = fs.readFileSync(tsPath, 'utf-8');

// Extract the JSON array part
const match = content.match(/export const questions: Question\[\] = (\[[\s\S]*\]);/);

if (!match) {
    console.error('Could not find questions array in file');
    process.exit(1);
}

const questions = JSON.parse(match[1]);

// Transliteration helper
const transliterate = (str) => {
    const ru = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
        'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
        'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
        'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
        'э': 'e', 'ю': 'yu', 'я': 'ya'
    };

    return str.toLowerCase().split('').map(char => {
        return ru[char] || char;
    }).join('');
};

const generateSlug = (title) => {
    // 1. Remove numbering (e.g., "1. What is...")
    let cleanTitle = title.replace(/^\d+\.?\s*/, '');

    // 2. Remove parentheticals which often contain context like "(Events)"
    cleanTitle = cleanTitle.replace(/\([^)]*\)/g, '');

    // 3. Transliterate
    cleanTitle = transliterate(cleanTitle);

    // 4. Replace non-alphanumeric with dashes
    cleanTitle = cleanTitle.replace(/[^a-z0-9]+/g, '-');

    // 5. Trim dashes
    cleanTitle = cleanTitle.replace(/^-+|-+$/g, '');

    return cleanTitle || 'question';
};

const processedQuestions = questions.map(q => {
    // Only generate if missing (or we can overwrite to ensure consistency)
    // Overwriting is safer to ensure quality format
    const slug = generateSlug(q.title);
    return {
        ...q,
        slug: slug
    };
});

// Write back
const newContent = `import type { Question } from '../types';

export const questions: Question[] = ${JSON.stringify(processedQuestions, null, 4)};
`;

fs.writeFileSync(tsPath, newContent);
console.log('Slugs generated successfully');
