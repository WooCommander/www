import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'js.md');
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
const questions = [];
let currentQuestion = null;
let currentCategory = 'General'; // Default category

// Helper to map known sections to categories
const getCategory = (text) => {
    if (text.includes('Основы JavaScript')) return 'JavaScript Fundamentals';
    if (text.includes('Объекты и функции')) return 'Objects & Functions';
    if (text.includes('Типы данных')) return 'Data Types';
    if (text.includes('Продвинутая работа')) return 'Advanced Functions';
    if (text.includes('DOM API')) return 'DOM API';
    if (text.includes('Работа с событиями')) return 'Events';
    if (text.includes('Прототипы')) return 'Prototypes';
    if (text.includes('Классы')) return 'Classes';
    if (text.includes('Асинхронность') || text.includes('Event Loop') || text.includes('Промисы')) return 'Async & Event Loop';
    if (text.includes('Запросы') || text.includes('Network')) return 'Network';
    return currentCategory;
};

let questionId = 100; // Start from 100 to avoid collision with existing

for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Attempt to detect category headers (rough heuristic based on TOC format or section headers)
    if ((line.match(/^[#]+ /) || line.match(/^[A-ZА-Я\s\(\)]+$/)) && line.length < 50 && line.length > 5) {
        // Potential category change, but risky. Let's rely on basic mapping if possible, 
        // but for now, we'll stick to a simple parser for '###' questions.
    }

    if (line.startsWith('### ')) {
        // Save previous question
        if (currentQuestion) {
            currentQuestion.answer = currentQuestion.answer.trim();
            questions.push(currentQuestion);
        }

        // Start new question
        const title = line.replace('###', '').trim().replace(/^\d+\.\s*/, '');
        currentQuestion = {
            id: questionId++,
            title: title,
            answer: '',
            category: currentCategory, // We might need to post-process categories
            difficulty: 'Medium'
        };
    } else if (currentQuestion && !line.startsWith('---')) {
        currentQuestion.answer += line + '\n';

        // Try to detect code blocks for the 'code' field
        // Simple heuristic: if answer contains ``` code ```, extract it
        // actually easier to just keep it in answer markdown for now, 
        // OR try to extract if specific request. 
        // User asked for "interface choice by topics", so we need good categories.
    }
}

// Push last question
if (currentQuestion) {
    currentQuestion.answer = currentQuestion.answer.trim();
    questions.push(currentQuestion);
}

// Post-processing for categories based on keywords in title
questions.forEach(q => {
    const t = q.title.toLowerCase();
    if (t.includes('dom') || t.includes('элемент')) q.category = 'DOM API';
    else if (t.includes('событи') || t.includes('event')) q.category = 'Events';
    else if (t.includes('объект') || t.includes('object') || t.includes('прототип') || t.includes('this')) q.category = 'Objects & Classes';
    else if (t.includes('функци') || t.includes('замыкание')) q.category = 'Functions';
    else if (t.includes('promise') || t.includes('async') || t.includes('loop')) q.category = 'Async';
    else if (t.includes('тип')) q.category = 'Types';
    else if (t.includes('массив')) q.category = 'Arrays';
    else if (t.includes('http') || t.includes('fetch') || t.includes('url')) q.category = 'Network';
    else q.category = 'General';
});

fs.writeFileSync('questions_dump.json', JSON.stringify(questions, null, 2));
console.log('Done writing to questions_dump.json');
