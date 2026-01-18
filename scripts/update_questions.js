import fs from 'fs';
import path from 'path';

const jsonPath = path.join(process.cwd(), 'questions_dump.json');
const tsPath = path.join(process.cwd(), 'src/data/questions.ts');

const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const fileContent = `import type { Question } from '../types';

export const questions: Question[] = ${JSON.stringify(questions, null, 4)};
`;

fs.writeFileSync(tsPath, fileContent);
console.log(`Updated ${tsPath} with ${questions.length} questions.`);
