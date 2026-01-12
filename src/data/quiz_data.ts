export type QuizQuestionType = 'single' | 'multiple' | 'input';

export interface QuizOption {
    id: string;
    text: string;
    isCorrect?: boolean; // For input type, this might be the correct answer string
}

export interface QuizQuestion {
    id: string;
    text: string;
    type: QuizQuestionType;
    options?: QuizOption[]; // For 'single' and 'multiple'
    correctAnswer?: string | string[]; // For 'input' (string) or 'multiple' (array of ids)
    explanation?: string;
}

export interface QuizTopic {
    id: string;
    title: string;
    questions: QuizQuestion[];
}

export const topic100: QuizTopic = {
    id: '100',
    title: 'Variables & Constants (Topic 100)',
    questions: [
        {
            id: 'q100_1',
            text: 'Как правильно объявить переменную, которую можно будет изменить в будущем?',
            type: 'single',
            options: [
                { id: 'a', text: 'const count = 0;' },
                { id: 'b', text: 'let count = 0;', isCorrect: true },
                { id: 'c', text: 'var count = 0;' },
                { id: 'd', text: 'variable count = 0;' }
            ],
            explanation: '`let` используется для переменных, которые могут быть переприсвоены. `const` для констант, `var` устарел.'
        },
        {
            id: 'q100_2',
            text: 'В каких случаях возникает "Temporal Dead Zone" (TDZ)?',
            type: 'multiple',
            options: [
                { id: 'a', text: 'При использовании var до объявления' },
                { id: 'b', text: 'При использовании let до объявления', isCorrect: true },
                { id: 'c', text: 'При использовании const до объявления', isCorrect: true },
                { id: 'd', text: 'При использовании любой переменной' }
            ],
            explanation: 'TDZ возникает для `let` и `const` переменных в период от начала блока кода до момента их объявления.'
        },
        {
            id: 'q100_3',
            text: 'Введите ключевое слово для объявления переменной, которая не должна меняться после инициализации.',
            type: 'input',
            correctAnswer: 'const',
            explanation: '`const` создает константу, которую нельзя переприсвоить.'
        },
        {
            id: 'q100_4',
            text: 'Какое ключевое слово имеет функциональную область видимости (function scope), а не блочную?',
            type: 'input',
            correctAnswer: 'var',
            explanation: '`var` ограничивается только функцией, в которой объявлен, игнорируя блоки if/for.'
        },
        {
            id: 'q100_5',
            text: 'Что выведет этот код? \n\nconsole.log(x);\nvar x = 5;',
            type: 'single',
            options: [
                { id: 'a', text: 'ReferenceError' },
                { id: 'b', text: 'undefined', isCorrect: true },
                { id: 'c', text: '5' },
                { id: 'd', text: 'null' }
            ],
            explanation: 'Из-за всплытия (hoisting) объявление `var x` поднимается наверх, но инициализация остается на месте, поэтому `undefined`.'
        },
        {
            id: 'q100_6',
            text: 'Выберите правильные утверждения о `const`:',
            type: 'multiple',
            options: [
                { id: 'a', text: 'Значение примитивной переменной нельзя изменить', isCorrect: true },
                { id: 'b', text: 'Свойства объекта, объявленного через const, нельзя менять' },
                { id: 'c', text: 'Переменную обязательно нужно инициализировать при объявлении', isCorrect: true },
                { id: 'd', text: 'Можно объявить без значения (const x;)' }
            ],
            explanation: '`const` запрещает переприсваивание самой переменной, но не делает объекты неизменяемыми (их свойства можно менять). Инициализация обязательна сразу.'
        }
    ]
};

export const quizzes: QuizTopic[] = [topic100];
