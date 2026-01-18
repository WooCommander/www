import fs from 'fs';
import path from 'path';

const tsPath = path.join(process.cwd(), 'src/data/questions.ts');
let content = fs.readFileSync(tsPath, 'utf-8');

const match = content.match(/export const questions: Question\[\] = (\[[\s\S]*\]);/);
if (!match) {
    console.error('Could not find questions array');
    process.exit(1);
}

let questions = JSON.parse(match[1]);

// Define Category Order
const categoryOrder = [
    'General',
    'JavaScript Fundamentals',
    'Types',
    'Utility Types',
    'Advanced Types',
    'Objects & Classes',
    'Objects & Prototypes',
    'Functions',
    'Advanced Functions',
    'Arrays',
    'Async & Event Loop',
    'Async',
    'DOM API',
    'Events',
    'Network',
    'Configuration',
    'OOP',
    'Data Types'
];

// Helper to get category index (1-based)
const getCatIndex = (cat) => {
    const idx = categoryOrder.indexOf(cat);
    if (idx === -1) {
        // Add new categories to the end if not in list
        categoryOrder.push(cat);
        return categoryOrder.length;
    }
    return idx + 1;
};

// Group by category to assign internal indices
const questionsByCategory = {};

questions.forEach(q => {
    // Normalize category
    if (q.category === 'Objects & Functions') q.category = 'Functions';
    // (Simple normalization if needed, but let's trust existing)

    if (!questionsByCategory[q.category]) {
        questionsByCategory[q.category] = [];
    }
    questionsByCategory[q.category].push(q);
});

let processedQuestions = [];

// Iterate through defined order to build the new list
categoryOrder.forEach((cat, catIdx) => {
    if (!questionsByCategory[cat]) return;

    const catNum = catIdx + 1;

    questionsByCategory[cat].forEach((q, qIdx) => {
        const qNum = qIdx + 1;

        // 1. New ID: "1.1", "1.2", etc.
        const newId = `${catNum}.${qNum}`;

        // 2. Clean Title
        // Remove leading "1. ", "1\\. ", "10. " etc.
        // Also remove leading "Question " if exists
        let newTitle = q.title
            .replace(/^[\d\\]+\.?\s*/, '') // Remove "1. ", "1\. "
            .replace(/^\d+\s+/, '')         // Remove "1 "
            .trim();

        // Capitalize first letter just in case
        newTitle = newTitle.charAt(0).toUpperCase() + newTitle.slice(1);

        processedQuestions.push({
            ...q,
            id: newId,
            title: newTitle,
            category: cat // Ensure consistent category name if we normalized
        });
    });
});

const newContent = `import type { Question } from '../types';

export const questions: Question[] = ${JSON.stringify(processedQuestions, null, 4)};
`;

fs.writeFileSync(tsPath, newContent);
console.log('Questions renumbered and titles cleaned.');
