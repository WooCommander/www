
import fs from 'fs';
import path from 'path';

// Path to the questions file
const questionsPath = path.join('e:\\www\\src\\data\\questions.ts');

// Read the file content
let content = fs.readFileSync(questionsPath, 'utf-8');

// Extract the array part using regex
const match = content.match(/export const questions: Question\[\] = (\[[\s\S]*?\]);/);

if (!match) {
    console.error('Could not find questions array in the file');
    process.exit(1);
}

const jsonString = match[1];

let questions;
try {
    // We need to be careful with trailing commas if TS allows them but JSON doesn't. 
    // The current file seems to be cleaner JSON-like structure inside TS.
    // However, if there are trailing commas, JSON.parse will fail.
    // Let's rely on the file structure being mostly valid JSON.
    // If there are specific TS constructs, this might fail, but let's try.
    questions = JSON.parse(jsonString);
} catch (e) {
    console.error('Failed to parse JSON content. attempting loose parsing or manual regex replacement might be needed.', e);
    // Fallback: Use manual regex replacement if JSON.parse fails (likely due to trailing commas or comments)
    // But since the previous step generated this file, it might be clean.
    process.exit(1);
}

// Set to track unique IDs
const existingIds = new Set();
let nextId = 1000; // Start new IDs from a safe range if needed

const cleanTitle = (title) => {
    // Regex to remove leading numbers, dots, escaped dots, parentheses
    // Matches: "1. ", "1\\. ", "1) ", "1.1 "
    return title.replace(/^\d+([.\\\)]+)?\s*/g, '').trim();
};

const updatedQuestions = questions.map(q => {
    // Clean title
    q.title = cleanTitle(q.title);

    // Ensure unique ID
    if (existingIds.has(q.id)) {
        console.log(`Duplicate ID found: ${q.id}. Assigning new ID: ${nextId}`);
        q.id = nextId++;
    }
    existingIds.add(q.id);

    return q;
});

// Reconstruct the file content
const newContent = `import type { Question } from '../types';

export const questions: Question[] = ${JSON.stringify(updatedQuestions, null, 4)};`;

fs.writeFileSync(questionsPath, newContent, 'utf-8');

console.log(`Successfully processed ${updatedQuestions.length} questions.`);
