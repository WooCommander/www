export type QuizQuestionType = 'single' | 'multiple' | 'input';

export interface QuizOption {
    id: string;
    text: string;
    isCorrect?: boolean;
}

export interface QuizQuestion {
    id: string;
    text: string;
    type: QuizQuestionType;
    options?: QuizOption[];
    correctAnswer?: string | string[];
    explanation?: string;
    codeSnippet?: string; // Optional code block for context
}

export interface QuizTopic {
    id: string;
    title: string;
    category: string; // Added category grouping
    questions: QuizQuestion[];
}

export const quizzes: QuizTopic[] = [
    {
        id: '100',
        title: 'Variables & Constants (100)',
        category: 'JavaScript Core',
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
                text: 'Какое ключевое слово имеет функциональную область видимости, а не блочную?',
                type: 'input',
                correctAnswer: 'var',
                explanation: '`var` ограничивается только функцией, в которой объявлен, игнорируя блоки if/for.'
            },
            {
                id: 'q100_5',
                text: 'Что выведет этот код?',
                codeSnippet: 'console.log(x);\nvar x = 5;',
                type: 'single',
                options: [
                    { id: 'a', text: 'ReferenceError' },
                    { id: 'b', text: 'undefined', isCorrect: true },
                    { id: 'c', text: '5' },
                    { id: 'd', text: 'null' }
                ],
                explanation: 'Из-за всплытия (hoisting) объявление `var x` поднимается наверх, но инициализация остается на месте.'
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
                explanation: '`const` запрещает переприсваивание самой переменной, но не делает объекты неизменяемыми.'
            }
        ]
    },
    {
        id: '101',
        title: 'Data Types (101)',
        category: 'Types & Variables',
        questions: [
            {
                id: 'q101_1',
                text: 'Что вернет оператор typeof для null?',
                type: 'input',
                correctAnswer: 'object',
                explanation: 'Это известный исторический баг в JavaScript: typeof null возвращает "object".'
            },
            {
                id: 'q101_2',
                text: 'Какой результат выполнения будет у следующего выражения?',
                codeSnippet: 'console.log(5 / 0);',
                type: 'input',
                correctAnswer: 'Infinity',
                explanation: 'Деление положительного числа на 0 в JavaScript возвращает Infinity.'
            },
            {
                id: 'q101_3',
                text: 'Выберите все "Falsy" (ложные) значения в JavaScript:',
                type: 'multiple',
                options: [
                    { id: 'a', text: '0', isCorrect: true },
                    { id: 'b', text: '"0"' },
                    { id: 'c', text: 'undefined', isCorrect: true },
                    { id: 'd', text: 'NaN', isCorrect: true },
                    { id: 'e', text: '[]' },
                    { id: 'f', text: 'null', isCorrect: true }
                ],
                explanation: 'Falsy значения: false, 0, -0, 0n, "", null, undefined, NaN. Пустой массив [] и строка "0" являются Truthy.'
            },
            {
                id: 'q101_4',
                text: 'Примитивы передаются по значению, а объекты по ссылке. Что выведет код?',
                codeSnippet: 'let a = { x: 1 };\nlet b = a;\nb.x = 2;\nconsole.log(a.x);',
                type: 'single',
                options: [
                    { id: 'a', text: '1' },
                    { id: 'b', text: '2', isCorrect: true },
                    { id: 'c', text: 'undefined' },
                    { id: 'd', text: 'Error' }
                ],
                explanation: 'Так как объекты передаются по ссылке, b ссылается на тот же объект, что и a. Изменение b.x меняет и a.x.'
            }
        ]
    },
    {
        id: '102',
        title: 'Type Coercion (102)',
        category: 'Types & Variables',
        questions: [
            {
                id: 'q102_1',
                text: 'Что выведет выражение "10" - 2?',
                type: 'single',
                options: [
                    { id: 'a', text: '"8"' },
                    { id: 'b', text: '8', isCorrect: true },
                    { id: 'c', text: '"102"' },
                    { id: 'd', text: 'NaN' }
                ],
                explanation: 'Оператор "-" не работает со строками, поэтому JavaScript пытается привести строку к числу.'
            },
            {
                id: 'q102_2',
                text: 'Что выведет выражение "5" + 1?',
                type: 'single',
                options: [
                    { id: 'a', text: '6' },
                    { id: 'b', text: '"51"', isCorrect: true },
                    { id: 'c', text: 'NaN' }
                ],
                explanation: 'Оператор "+" работает как конкатенация, если хотя бы один операнд - строка.'
            },
            {
                id: 'q102_3',
                text: 'Чему равно Number(null)?',
                type: 'input',
                correctAnswer: '0',
                explanation: 'При явном преобразовании к числу, null становится 0.'
            }
        ]
    },
    {
        id: '103',
        title: 'Basic Operators (103)',
        category: 'JavaScript Core',
        questions: [
            {
                id: 'q103_1',
                text: 'Какой оператор имеет более высокий приоритет?',
                type: 'single',
                options: [
                    { id: 'a', text: '*', isCorrect: false },
                    { id: 'b', text: '** (возведение в степень)', isCorrect: true },
                    { id: 'c', text: '+' },
                    { id: 'd', text: '-' }
                ],
                explanation: 'Оператор возведения в степень (**) имеет приоритет 13 (MDN), выше чем умножение/деление (12).'
            },
            {
                id: 'q103_2',
                text: 'Чему равно 10 % 3?',
                type: 'input',
                correctAnswer: '1',
                explanation: 'Оператор % возвращает остаток от деления. 10 разделить на 3 равно 3 с остатком 1.'
            },
            {
                id: 'q103_3',
                text: 'Какова ассоциативность оператора ** (возведение в степень)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Слева направо' },
                    { id: 'b', text: 'Справа налево', isCorrect: true }
                ],
                explanation: '2 ** 3 ** 2 вычисляется как 2 ** (3 ** 2).'
            }
        ]
    },
    {
        id: '104',
        title: 'Equality Operators (104)',
        category: 'JavaScript Core',
        questions: [
            {
                id: 'q104_1',
                text: 'Какое сравнение вернет true?',
                type: 'multiple',
                options: [
                    { id: 'a', text: 'null == undefined', isCorrect: true },
                    { id: 'b', text: 'null === undefined' },
                    { id: 'c', text: '0 == ""', isCorrect: true },
                    { id: 'd', text: '0 === ""' }
                ],
                explanation: 'null == undefined (специальное правило). 0 == "" (оба приводятся к 0 false).'
            },
            {
                id: 'q104_2',
                text: 'При использовании оператора === происходит ли приведение типов?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да' },
                    { id: 'b', text: 'Нет', isCorrect: true }
                ],
                explanation: '=== проверяет и значение, и тип без приведения.'
            }
        ]
    },
    {
        id: '105',
        title: 'Conditional Branching (105)',
        category: 'Functions',
        questions: [
            {
                id: 'q105_1',
                text: 'Какое ключевое слово используется для "умолчательного" случая в switch?',
                type: 'input',
                correctAnswer: 'default',
                explanation: 'default выполняется, если ни один case не совпал.'
            },
            {
                id: 'q105_2',
                text: 'Что произойдет, если в блоке case не написать break?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Произойдет ошибка синтаксиса' },
                    { id: 'b', text: 'Выполнение перейдет к следующему case (fall-through)', isCorrect: true },
                    { id: 'c', text: 'Цикл/switch завершится автоматически' }
                ],
                explanation: 'Без break выполнение "проваливается" в следующие кейсы, игнорируя их условия, до ближайшего break или конца switch.'
            }
        ]
    },
    {
        id: '106',
        title: 'Logical Operators (106)',
        category: 'JavaScript Core',
        questions: [
            {
                id: 'q106_1',
                text: 'Что выведет код: console.log(0 || 1 && 2 || 3); ?',
                type: 'single',
                options: [
                    { id: 'a', text: '0' },
                    { id: 'b', text: '1' },
                    { id: 'c', text: '2', isCorrect: true },
                    { id: 'd', text: '3' }
                ],
                explanation: 'Приоритет && выше ||. 1 && 2 -> 2. Затем 0 || 2 -> 2. Итог 2 || 3 -> 2 (первое truthy).'
            },
            {
                id: 'q106_2',
                text: 'Какое значение вернет выражение: null || 0 || undefined || "False" || "" ?',
                type: 'input',
                correctAnswer: 'False',
                explanation: 'Оператор || возвращает первое truthy значение. Строка "False" - единственное truthy значение в цепочке.'
            },
            {
                id: 'q106_3',
                text: 'Введите символ оператора, который возвращает операнд справа, если левый операнд null или undefined.',
                type: 'input',
                correctAnswer: '??',
                explanation: 'Оператор нулевого слияния (nullish coalescing) записывается как ??'
            }
        ]
    },
    {
        id: '107',
        title: 'Nullish Coalescing (107)',
        category: 'JavaScript Core',
        questions: [
            {
                id: 'q107_1',
                text: 'Какой результат выполнения кода: console.log(0 ?? 42)?',
                type: 'single',
                options: [
                    { id: 'a', text: '0', isCorrect: true },
                    { id: 'b', text: '42' },
                    { id: 'c', text: 'null' },
                    { id: 'd', text: 'undefined' }
                ],
                explanation: 'Оператор ?? считает 0 валидным значением (не null/undefined), поэтому возвращает 0.'
            },
            {
                id: 'q107_2',
                text: 'В чем ключевое отличие ?? от ||?',
                type: 'multiple',
                options: [
                    { id: 'a', text: '?? работает только с null и undefined', isCorrect: true },
                    { id: 'b', text: '|| пропускает 0 и пустую строку', isCorrect: true },
                    { id: 'c', text: '?? имеет более высокий приоритет чем ||' },
                    { id: 'd', text: 'Различий нет' }
                ],
                explanation: '?? создан специально чтобы не "терять" 0 и пустые строки, которые || считает ложными.'
            }
        ]
    },
    {
        id: '108',
        title: 'Loops (While/For) (108)',
        category: 'JavaScript Core',
        questions: [
            {
                id: 'q108_1',
                text: 'Сколько раз выполнится тело цикла do...while, если условие изначально ложно?',
                type: 'single',
                options: [
                    { id: 'a', text: '0 раз' },
                    { id: 'b', text: '1 раз', isCorrect: true },
                    { id: 'c', text: 'Бесконечно' }
                ],
                explanation: 'Цикл do...while сначала выполняет тело, а потом проверяет условие. Поэтому минимум 1 раз.'
            },
            {
                id: 'q108_2',
                text: 'Какой вид цикла лучше использовать, когда известно точное количество итераций?',
                type: 'input',
                correctAnswer: 'for',
                explanation: 'Цикл for идеально подходит для счетчиков с заданным диапазоном.'
            }
        ]
    },
    {
        id: '109',
        title: 'Switch Statement (109)',
        category: 'JavaScript Core',
        questions: [
            {
                id: 'q109_1',
                text: 'Какое ключевое слово используется для выхода из case в switch?',
                type: 'input',
                correctAnswer: 'break',
                explanation: 'break предотвращает выполнение следующих блоков case (fall-through).'
            },
            {
                id: 'q109_2',
                text: 'Какое сравнение использует switch внутри себя?',
                type: 'single',
                options: [
                    { id: 'a', text: '== (нестрогое)' },
                    { id: 'b', text: '=== (строгое)', isCorrect: true },
                    { id: 'c', text: 'Object.is' }
                ],
                explanation: 'Switch сравнивает значения строго, без приведения типов.'
            },
            {
                id: 'q109_3',
                text: 'Можно ли группировать кейсы в switch?',
                codeSnippet: 'case 1:\ncase 2:\n  doSomething();\n  break;',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да', isCorrect: true },
                    { id: 'b', text: 'Нет, будет ошибка' },
                    { id: 'c', text: 'Только в строгом режиме' }
                ],
                explanation: 'Да, отсутствие break позволяет выполнять один код для нескольких кейсов.'
            }
        ]
    },
    {
        id: '110',
        title: 'Functions Basics (110)',
        category: 'Functions',
        questions: [
            {
                id: 'q110_1',
                text: 'Какое ключевое слово отличает Function Expression от Function Declaration (с точки зрения всплытия)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'function' },
                    { id: 'b', text: 'var/let/const (присваивание)', isCorrect: true },
                    { id: 'c', text: 'return' }
                ],
                explanation: 'Function Declaration всплывает целиком. Function Expression - создается, когда доходит код (как переменная).'
            },
            {
                id: 'q110_2',
                text: 'Выберите особенности стрелочных функций:',
                type: 'multiple',
                options: [
                    { id: 'a', text: 'Нет своего this', isCorrect: true },
                    { id: 'b', text: 'Нет псевдомассива arguments', isCorrect: true },
                    { id: 'c', text: 'Могут быть конструкторами (new)' },
                    { id: 'd', text: 'Всегда анонимны', isCorrect: true }
                ],
                explanation: 'Стрелочные функции не имеют своих this, arguments и не могут быть вызваны с new.'
            },
            {
                id: 'q110_3',
                text: 'Как называется функция, которая при одних и тех же входных данных всегда возвращает одинаковый результат и не имеет побочных эффектов?',
                type: 'input',
                correctAnswer: 'pure',
                explanation: 'Чистая (pure) функция — важная концепция функционального программирования.'
            }
        ]
    },
    {
        id: '111',
        title: 'Objects Basics (111)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q111_1',
                text: 'Какой оператор удаляет свойство из объекта?',
                type: 'input',
                correctAnswer: 'delete',
                explanation: 'Оператор delete удаляет свойство из объекта (delete user.age).'
            },
            {
                id: 'q111_2',
                text: 'Как проверить наличие свойства в самом объекте (не в прототипе)?',
                type: 'single',
                options: [
                    { id: 'a', text: '"prop" in obj' },
                    { id: 'b', text: 'obj.hasOwnProperty("prop")', isCorrect: true },
                    { id: 'c', text: 'obj.prop !== undefined' }
                ],
                explanation: 'Метод hasOwnProperty проверяет только собственные свойства объекта.'
            },
            {
                id: 'q111_3',
                text: 'Что выведет Object.keys({a: 1, b: 2})?',
                type: 'single',
                options: [
                    { id: 'a', text: '["a", "b"]', isCorrect: true },
                    { id: 'b', text: '[1, 2]' },
                    { id: 'c', text: '[["a", 1], ["b", 2]]' }
                ],
                explanation: 'Object.keys возвращает массив строковых ключей.'
            }
        ]
    },
    {
        id: '112',
        title: 'Object Copying (112)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q112_1',
                text: 'Что происходит при присваивании объекта новой переменной (const b = a)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Создается полная копия' },
                    { id: 'b', text: 'Копируется ссылка', isCorrect: true },
                    { id: 'c', text: 'Происходит ошибка' }
                ],
                explanation: 'Объекты в JavaScript передаются и присваиваются по ссылке.'
            },
            {
                id: 'q112_2',
                text: 'Какой встроенный метод выполняет глубокое (deep) клонирование?',
                type: 'input',
                correctAnswer: 'structuredClone',
                explanation: 'structuredClone() - современный глобальный метод для глубокого копирования.'
            },
            {
                id: 'q112_3',
                text: 'Какие типы данных потеряются при clone = JSON.parse(JSON.stringify(original))?',
                type: 'multiple',
                options: [
                    { id: 'a', text: 'String' },
                    { id: 'b', text: 'Function', isCorrect: true },
                    { id: 'c', text: 'undefined', isCorrect: true },
                    { id: 'd', text: 'Symbol', isCorrect: true },
                    { id: 'e', text: 'Number' }
                ],
                explanation: 'JSON формат не поддерживает функции, undefined и символы.'
            }
        ]
    },
    {
        id: '113',
        title: 'Methods & This (113)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q113_1',
                text: 'Чему равно this в стрелочной функции, объявленной внутри метода объекта?',
                codeSnippet: 'const obj = {\n  name: "A",\n  foo: function() {\n    const bar = () => console.log(this.name);\n    bar();\n  }\n}',
                type: 'single',
                options: [
                    { id: 'a', text: 'undefined' },
                    { id: 'b', text: 'window' },
                    { id: 'c', text: 'obj ("A")', isCorrect: true }
                ],
                explanation: 'Стрелочная функция берет this из лексического окружения (родительской функции foo, где this равен obj).'
            },
            {
                id: 'q113_2',
                text: 'Чему равно this в глобальной области видимости (браузер, не strict mode)?',
                type: 'input',
                correctAnswer: 'window',
                explanation: 'В браузере глобальный контекст ссылается на window (если не включен strict mode).'
            }
        ]
    },
    {
        id: '114',
        title: 'Constructors & New (114)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q114_1',
                text: 'Что произойдет, если вызвать функцию-конструктор без оператора new (в нестрогом режиме)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Создатся объект' },
                    { id: 'b', text: 'Функция выполнится как обычная, this будет window', isCorrect: true },
                    { id: 'c', text: 'Ошибка' }
                ],
                explanation: 'Без new this не привязывается к новому объекту, а указывает на глобальный объект, засоряя его.'
            },
            {
                id: 'q114_2',
                text: 'Что вернет конструктор, если в нем написано: return { a: 1 }; ?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Свежесозданный instance (this)' },
                    { id: 'b', text: 'Объект { a: 1 }', isCorrect: true },
                    { id: 'c', text: 'undefined' }
                ],
                explanation: 'Если конструктор возвращает объект, то этот объект возвращается вместо this.'
            }
        ]
    },
    {
        id: '115',
        title: 'Optional Chaining (115)',
        category: 'Functions',
        questions: [
            {
                id: 'q115_1',
                text: 'Что вернет код user?.address?.street, если user = null?',
                type: 'single',
                options: [
                    { id: 'a', text: 'error' },
                    { id: 'b', text: 'null' },
                    { id: 'c', text: 'undefined', isCorrect: true }
                ],
                explanation: 'Опциональная цепочка возвращает undefined и останавливает вычисление, если встречает null или undefined.'
            },
            {
                id: 'q115_2',
                text: 'Как безопасно вызвать функцию onSave, которая может быть undefined?',
                type: 'single',
                options: [
                    { id: 'a', text: 'onSave()' },
                    { id: 'b', text: 'onSave?.()', isCorrect: true },
                    { id: 'c', text: 'onSave?()' }
                ],
                explanation: 'Синтаксис для вызова опциональной функции: funcName?.().'
            }
        ]
    },
    {
        id: '116',
        title: 'Symbol (116)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q116_1',
                text: 'Что выведет сравнение Symbol("foo") === Symbol("foo")?',
                type: 'single',
                options: [
                    { id: 'a', text: 'true' },
                    { id: 'b', text: 'false', isCorrect: true },
                    { id: 'c', text: 'TypeError' }
                ],
                explanation: 'Каждый Symbol уникален, даже если описание одинаковое.'
            },
            {
                id: 'q116_2',
                text: 'Какой метод позволяет создать глобальный символ, который можно получить по имени в любом месте кода?',
                type: 'input',
                correctAnswer: 'Symbol.for',
                explanation: 'Symbol.for("key") ищет символ в глобальном реестре или создает новый, если его нет.'
            },
            {
                id: 'q116_3',
                text: 'Видны ли ключи-символы в цикле for..in или Object.keys()?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да, всегда' },
                    { id: 'b', text: 'Нет, никогда', isCorrect: true },
                    { id: 'c', text: 'Только если символ создан через Symbol.for' }
                ],
                explanation: 'Символьные свойства "скрыты" от стандартных переборов ключей, что позволяет создавать "скрытые" свойства.'
            }
        ]
    },
    {
        id: '117',
        title: 'Object to Primitive (117)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q117_1',
                text: 'Какой метод имеет наивысший приоритет при преобразовании объекта в примитив?',
                type: 'single',
                options: [
                    { id: 'a', text: 'toString()' },
                    { id: 'b', text: 'valueOf()' },
                    { id: 'c', text: 'Symbol.toPrimitive', isCorrect: true },
                    { id: 'd', text: 'toJSON()' }
                ],
                explanation: 'Если у объекта есть метод [Symbol.toPrimitive], движок использует его. Иначе пробует valueOf/toString.'
            },
            {
                id: 'q117_2',
                text: 'Какой hint (подсказка типа) будет передан в Symbol.toPrimitive при операции: obj1 - obj2?',
                type: 'single',
                options: [
                    { id: 'a', text: '"string"' },
                    { id: 'b', text: '"number"', isCorrect: true },
                    { id: 'c', text: '"default"' }
                ],
                explanation: 'Математические операции (кроме сложения, которое может быть конкатенацией) подсказывают тип "number".'
            },
            {
                id: 'q117_3',
                text: 'Что вернет alert(obj), если у obj нет Symbol.toPrimitive и valueOf возвращает сам объект, а toString возвращает "foo"?',
                type: 'input',
                correctAnswer: 'foo',
                explanation: 'Для alert (строковое преобразование) сначала ищется toString. Если он возвращает примитив - используется он.'
            },
            {
                id: 'q117_4',
                text: 'Если valueOf() возвращает объект, а не примитив, что сделает JS при попытке численного преобразования?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Использует этот объект как есть' },
                    { id: 'b', text: 'Попробует вызвать toString()', isCorrect: true },
                    { id: 'c', text: 'Выбросит ошибку сразу' }
                ],
                explanation: 'Если valueOf не вернул примитив, JS игнорирует его и пытается вызвать toString. Если и тот не вернул примитив - TypeError.'
            },
            {
                id: 'q117_5',
                text: 'Какой hint передается при сложении (obj + 5) или сравнении (obj == 5)?',
                type: 'input',
                correctAnswer: 'default',
                explanation: 'При бинарном плюсе и нестрогом сравнении тип не очевиден, поэтому хинт "default".'
            }
        ]
    },
    {
        id: '118',
        title: 'Methods of Primitives (118)',
        category: 'Types & Variables',
        questions: [
            {
                id: 'q118_1',
                text: 'Что происходит "под капотом", когда вы вызываете метод у строки: "str".toLowerCase()?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Строка мутирует' },
                    { id: 'b', text: 'Создается временный объект-обертка (Wrapper), вызывается метод, объект удаляется', isCorrect: true },
                    { id: 'c', text: 'Ничего, это просто функция' }
                ],
                explanation: 'Это называется "Autoboxing". Примитив временно оборачивается в Object(str) для вызова метода.'
            },
            {
                id: 'q118_2',
                text: 'Равно ли new Number(5) === 5?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да' },
                    { id: 'b', text: 'Нет', isCorrect: true }
                ],
                explanation: 'new Number(5) - это объект. 5 - это примитив. Строгое сравнение вернет false.'
            }
        ]
    },
    {
        id: '119',
        title: 'Numbers (119)',
        category: 'Types & Variables',
        questions: [
            {
                id: 'q119_1',
                text: 'Что выведет 0.1 + 0.2 === 0.3?',
                type: 'single',
                options: [
                    { id: 'a', text: 'true' },
                    { id: 'b', text: 'false', isCorrect: true }
                ],
                explanation: 'Из-за особенностей плавающей точки (IEEE 754), 0.1 + 0.2 дает 0.30000000000000004.'
            },
            {
                id: 'q119_2',
                text: 'Какой метод округляет число всегда в меньшую сторону (обрубает дробную часть)?',
                type: 'input',
                correctAnswer: 'Math.floor',
                explanation: 'Math.floor(3.9) -> 3. Также есть Math.trunc() который просто отбрасывает дробную часть (разница видна на отрицательных числах).'
            },
            {
                id: 'q119_3',
                text: 'Что вернет parseInt("100px")?',
                type: 'input',
                correctAnswer: '100',
                explanation: 'parseInt читает число до первой ошибки (буквы p), возвращая 100.'
            }
        ]
    },
    {
        id: '120',
        title: 'Strings (120)',
        category: 'Types & Variables',
        questions: [
            {
                id: 'q120_1',
                text: 'Можно ли изменить один символ в строке напрямую? let s = "Hi"; s[0] = "h";',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да, строка изменится' },
                    { id: 'b', text: 'Нет, строки неизменяемы (immutable)', isCorrect: true },
                    { id: 'c', text: 'Ошибка времени выполнения' }
                ],
                explanation: 'Строки в JS неизменяемы. Нужно создавать новую строку.'
            },
            {
                id: 'q120_2',
                text: 'Какой тип кавычек поддерживает интерполяцию выражений ${...}?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Одинарные \'\'' },
                    { id: 'b', text: 'Двойные ""' },
                    { id: 'c', text: 'Обратные `` (Backticks)', isCorrect: true }
                ],
                explanation: 'Только обратные кавычки (Template Literals) поддерживают ${} и многострочность.'
            },
            {
                id: 'q120_3',
                text: 'Какой метод вырезает подстроку, поддерживая отрицательные аргументы (с конца)?',
                type: 'input',
                correctAnswer: 'slice',
                explanation: 'str.slice(-2) вернет 2 последних символа. substring отрицательные аргументы считает нулями.'
            }
        ]
    },
    {
        id: '121',
        title: 'Array Basics (121)',
        category: 'Arrays & Collections',
        questions: [
            {
                id: 'q121_1',
                text: 'Какой метод добавляет элемент в НАЧАЛО массива и возвращает новую длину?',
                type: 'input',
                correctAnswer: 'unshift',
                explanation: 'unshift добавляет элементы в начало, shift удаляет с начала. push/pop работают с концом.'
            },
            {
                id: 'q121_2',
                text: 'Как получить последний элемент массива arr, не изменяя его?',
                type: 'single',
                options: [
                    { id: 'a', text: 'arr.pop()' },
                    { id: 'b', text: 'arr[arr.length - 1]', isCorrect: true },
                    { id: 'c', text: 'arr.last()' }
                ],
                explanation: 'arr[arr.length - 1] или arr.at(-1) (современный способ).'
            },
            {
                id: 'q121_3',
                text: 'Какой цикл предпочтительнее для перебора значений массива?',
                type: 'single',
                options: [
                    { id: 'a', text: 'for (const key in arr)' },
                    { id: 'b', text: 'for (const val of arr)', isCorrect: true },
                    { id: 'c', text: 'while (true)' }
                ],
                explanation: 'for..in перебирает ключи (индексы + лишние свойства) и не гарантирует порядок. for..of предназначен для значений.'
            }
        ]
    },
    {
        id: '122',
        title: 'Array Methods 1 (122)',
        category: 'Arrays & Collections',
        questions: [
            {
                id: 'q122_1',
                text: 'Что возвращает метод arr.splice(start, deleteCount)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Измененный массив' },
                    { id: 'b', text: 'Массив удаленных элементов', isCorrect: true },
                    { id: 'c', text: 'Количество удаленных элементов' }
                ],
                explanation: 'Splice изменяет исходный массив и возвращает те элементы, которые были удалены.'
            },
            {
                id: 'q122_2',
                text: 'Мутирует ли исходный массив метод slice?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да' },
                    { id: 'b', text: 'Нет', isCorrect: true }
                ],
                explanation: 'Slice возвращает поверхностную копию части массива, не меняя оригинал.'
            },
            {
                id: 'q122_3',
                text: 'Какой метод объединяет два массива в новый?',
                type: 'input',
                correctAnswer: 'concat',
                explanation: 'arr1.concat(arr2) возвращает новый объединенный массив.'
            }
        ]
    },
    {
        id: '123',
        title: 'Array Methods 2 (123)',
        category: 'Arrays & Collections',
        questions: [
            {
                id: 'q123_1',
                text: 'Что выведет [1, 2, 10].sort()?',
                type: 'single',
                options: [
                    { id: 'a', text: '[1, 2, 10]' },
                    { id: 'b', text: '[1, 10, 2]', isCorrect: true },
                    { id: 'c', text: 'Ошибка' }
                ],
                explanation: 'По умолчанию sort сортирует элементы как строки: "10" идет раньше "2".'
            },
            {
                id: 'q123_2',
                text: 'Какой метод возвращает ПЕРВЫЙ элемент, удовлетворяющий условию, или undefined?',
                type: 'input',
                correctAnswer: 'find',
                explanation: 'find(fn) ищет элемент. findIndex(fn) ищет индекс. filter(fn) возвращает массив всех совпадений.'
            },
            {
                id: 'q123_3',
                text: 'Что возвращает arr.includes(x)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Индекс элемента' },
                    { id: 'b', text: 'Элемент или undefined' },
                    { id: 'c', text: 'boolean (true/false)', isCorrect: true }
                ],
                explanation: 'includes возвращает true если элемент найден, и false если нет. Также правильно обрабатывает NaN.'
            }
        ]
    },
    {
        id: '124',
        title: 'Array Methods 3 (Reduce/Flat) (124)',
        category: 'Arrays & Collections',
        questions: [
            {
                id: 'q124_1',
                text: 'Чему будет равен acc на первой итерации [1, 2, 3].reduce((acc, v) => acc + v), если начальное значение не передано?',
                type: 'single',
                options: [
                    { id: 'a', text: 'undefined' },
                    { id: 'b', text: '1 (первый элемент)', isCorrect: true },
                    { id: 'c', text: '0' }
                ],
                explanation: 'Если initialValue нет, аккумулятор принимает значение первого элемента массива, а итерация начинается со второго.'
            },
            {
                id: 'q124_2',
                text: 'Какой метод проверяет, что ВСЕ элементы массива удовлетворяют условию?',
                type: 'input',
                correctAnswer: 'every',
                explanation: 'every возвращает true только если коллбэк вернул true для каждого элемента.'
            },
            {
                id: 'q124_3',
                text: 'Что делает arr.flat(Infinity)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Делает массив плоским на 1 уровень' },
                    { id: 'b', text: 'Рекурсивно поднимает подмассивы любой вложенности', isCorrect: true },
                    { id: 'c', text: 'Удаляет пустые элементы' }
                ],
                explanation: 'Параметр Infinity позволяет "сплющить" массив любой вложенности в одномерный.'
            },
            {
                id: 'q124_4',
                text: 'Что вернет: [1, 2, 3].reduce((acc, el) => { acc[el] = el; return acc; }, {})?',
                type: 'single',
                options: [
                    { id: 'a', text: '[1, 2, 3]' },
                    { id: 'b', text: '{1:1, 2:2, 3:3}', isCorrect: true },
                    { id: 'c', text: 'undefined' }
                ],
                explanation: 'Reduce часто используется для преобразования массива в объект (словарь).'
            },
            {
                id: 'q124_5',
                text: 'Останавливает ли метод some() перебор, как только найдет подходящий элемент?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет, проходит до конца' },
                    { id: 'b', text: 'Да', isCorrect: true }
                ],
                explanation: 'some() возвращает true и прекращает выполнение, как только коллбэк вернет true.'
            }
        ]
    },
    {
        id: '125',
        title: 'Iterators (125)',
        category: 'Arrays & Collections',
        questions: [
            {
                id: 'q125_1',
                text: 'Какой известный символ используется для добавления итератора объекту?',
                type: 'input',
                correctAnswer: 'Symbol.iterator',
                explanation: 'Объект становится итерируемым (работает в for..of), если у него есть метод [Symbol.iterator].'
            },
            {
                id: 'q125_2',
                text: 'Что должен возвращать метод next() итератора?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Только value' },
                    { id: 'b', text: 'Объект { value, done: boolean }', isCorrect: true },
                    { id: 'c', text: 'Только done' }
                ],
                explanation: 'Протокол итератора требует возврата объекта с полями value (значение) и done (завершен ли перебор).'
            },
            {
                id: 'q125_3',
                text: 'Какой метод создает массив из любого итерируемого или псевдомассива (array-like)?',
                type: 'input',
                correctAnswer: 'Array.from',
                explanation: 'Array.from(iterable) создает настоящий массив из итератора или объекта с length и индексами.'
            },
            {
                id: 'q125_4',
                text: 'Работает ли цикл for..of с обычными объектами по умолчанию?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да' },
                    { id: 'b', text: 'Нет', isCorrect: true }
                ],
                explanation: 'Обычные объекты ({ a: 1 }) не являются итерируемыми. Для них используют for..in или Object.keys.'
            }
        ]
    },
    {
        id: '126',
        title: 'Map & Set (126)',
        category: 'Arrays & Collections',
        questions: [
            {
                id: 'q126_1',
                text: 'Какое главное отличие Map от обычного объекта в плане ключей?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Ключи могут быть только строками' },
                    { id: 'b', text: 'Ключи могут быть любого типа (включая объекты)', isCorrect: true },
                    { id: 'c', text: 'Map не имеет ключей' }
                ],
                explanation: 'Map позволяет использовать объекты, функции и примитивы в качестве ключей, тогда как Object - только строки и символы.'
            },
            {
                id: 'q126_2',
                text: 'Что будет в size после: new Set([1, 2, 2, 3, 3, 3])?',
                type: 'input',
                correctAnswer: '3',
                explanation: 'Set хранит только уникальные значения. Дубликаты будут удалены.'
            },
            {
                id: 'q126_3',
                text: 'Какой метод используется для проверки наличия элемента в Set?',
                type: 'input',
                correctAnswer: 'has',
                explanation: 'метод has(value) возвращает boolean. В массивах аналог - includes.'
            }
        ]
    },
    {
        id: '127',
        title: 'Object Methods (Keys/Entries) (127)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q127_1',
                text: 'Возвращает ли Object.keys() свойства-символы?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да' },
                    { id: 'b', text: 'Нет', isCorrect: true }
                ],
                explanation: 'Object.keys, values и entries игнорируют символьные свойства. Для них есть Object.getOwnPropertySymbols.'
            },
            {
                id: 'q127_2',
                text: 'Что делает Object.fromEntries([ ["a", 1], ["b", 2] ])?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Создает Map' },
                    { id: 'b', text: 'Создает объект { a: 1, b: 2 }', isCorrect: true },
                    { id: 'c', text: 'Создает массив' }
                ],
                explanation: 'Это обратная операция для Object.entries, собирающая объект из пар [ключ, значение].'
            },
            {
                id: 'q127_3',
                text: 'В каком порядке Object.keys() возвращает ключи?',
                type: 'single',
                options: [
                    { id: 'a', text: 'В случайном' },
                    { id: 'b', text: 'Сначала числовые по возрастанию, затем строковые в порядке добавления', isCorrect: true }
                ],
                explanation: 'Порядок перебора: целочисленные ключи (по возрастанию), затем остальные строковые (в порядке добавления).'
            }
        ]
    },
    {
        id: '128',
        title: 'Destructuring (128)',
        category: 'Types & Variables',
        questions: [
            {
                id: 'q128_1',
                text: 'Как при деструктуризации присвоить свойство переменной с ДРУГИМ именем? const { name: ??? } = user;',
                type: 'single',
                options: [
                    { id: 'a', text: 'name as newName' },
                    { id: 'b', text: 'name: newName', isCorrect: true },
                    { id: 'c', text: 'newName: name' }
                ],
                explanation: 'Синтаксис { sourceProp: targetVar }.'
            },
            {
                id: 'q128_2',
                text: 'Чему будет равно a в: const { a = 5 } = { a: undefined }?',
                type: 'single',
                options: [
                    { id: 'a', text: 'undefined' },
                    { id: 'b', text: '5', isCorrect: true },
                    { id: 'c', text: 'null' }
                ],
                explanation: 'Значение по умолчанию срабатывает, если значение свойства строго равно undefined.'
            },
            {
                id: 'q128_3',
                text: 'Что попадет в rest: const [a, ...rest] = [1, 2, 3]?',
                type: 'single',
                options: [
                    { id: 'a', text: '2' },
                    { id: 'b', text: '[2, 3]', isCorrect: true },
                    { id: 'c', text: '[1, 2, 3]' }
                ],
                explanation: 'Rest-оператор собирает все оставшиеся элементы в массив.'
            }
        ]
    },
    {
        id: '129',
        title: 'Date & Time (129)',
        category: 'Types & Variables',
        questions: [
            {
                id: 'q129_1',
                text: 'Какой индекс имеет Январь в new Date(year, month)?',
                type: 'single',
                options: [
                    { id: 'a', text: '1' },
                    { id: 'b', text: '0', isCorrect: true }
                ],
                explanation: 'Месяцы в Date считаются с нуля: 0 - Январь, 11 - Декабрь.'
            },
            {
                id: 'q129_2',
                text: 'Мутируют ли методы типа setDate() сам объект даты?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да', isCorrect: true },
                    { id: 'b', text: 'Нет, возвращают новую дату' }
                ],
                explanation: 'Date в JS мутабельна. set-методы меняют текущий объект и возвращают таймстемп.'
            }
        ]
    },
    {
        id: '130',
        title: 'JSON (130)',
        category: 'Types & Variables',
        questions: [
            {
                id: 'q130_1',
                text: 'Что вернет JSON.stringify({ a: undefined, b: function(){}, c: Symbol() })?',
                type: 'single',
                options: [
                    { id: 'a', text: '{"a":null,"b":null,"c":null}' },
                    { id: 'b', text: '{} (пустой объект)', isCorrect: true },
                    { id: 'c', text: 'Ошибка' }
                ],
                explanation: 'JSON не поддерживает undefined, функции и символы. Если они значения свойств - свойства пропускаются.'
            },
            {
                id: 'q130_2',
                text: 'Что произойдет при попытке сериализовать объект с циклической ссылкой?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Циклическая ссылка заменится на null' },
                    { id: 'b', text: 'Будет выброшена ошибка', isCorrect: true },
                    { id: 'c', text: 'Ничего' }
                ],
                explanation: 'JSON.stringify выбросит TypeError: Converting circular structure to JSON.'
            },
            {
                id: 'q130_3',
                text: 'Как называется метод, который можно добавить в объект для кастомной сериализации в JSON?',
                type: 'input',
                correctAnswer: 'toJSON',
                explanation: 'Если у объекта есть метод toJSON, он будет вызван, и его результат будет сериализован вместо самого объекта.'
            },
            {
                id: 'q130_4',
                text: 'Второй аргумент JSON.stringify(value, replacer) - для чего он?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Для отступов' },
                    { id: 'b', text: 'Для фильтрации или трансформации значений перед сериализацией', isCorrect: true }
                ],
                explanation: 'Функция или массив replacer позволяет выбирать, какие свойства включать, или преобразовывать их.'
            }
        ]
    },
    {
        id: '131',
        title: 'Recursion & Stack (131)',
        category: 'Functions',
        questions: [
            {
                id: 'q131_1',
                text: 'Какая ошибка возникает при превышении максимальной глубины рекурсии?',
                type: 'single',
                options: [
                    { id: 'a', text: 'OutOfMemoryError' },
                    { id: 'b', text: 'RangeError: Maximum call stack size exceeded', isCorrect: true },
                    { id: 'c', text: 'SyntaxError: Too much recursion' }
                ],
                explanation: 'Когда стек вызовов переполняется (слишком много вложенных контекстов), JS выбрасывает RangeError.'
            },
            {
                id: 'q131_2',
                text: 'Что хранится в контексте выполнения функции (Execution Context)?',
                type: 'multiple',
                options: [
                    { id: 'a', text: 'Локальные переменные и аргументы', isCorrect: true },
                    { id: 'b', text: 'Значение this', isCorrect: true },
                    { id: 'c', text: 'Ссылка на внешнее лексическое окружение', isCorrect: true },
                    { id: 'd', text: 'Весь код функции в текстовом виде' }
                ],
                explanation: 'Контекст выполнения содержит состояние функции: переменные, аргументы, this и ссылку на внешний scope.'
            }
        ]
    },
    {
        id: '132',
        title: 'Arguments & Parameters (132)',
        category: 'Functions',
        questions: [
            {
                id: 'q132_1',
                text: 'Чем отличается объект arguments от массива?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Ничем, это обычный массив' },
                    { id: 'b', text: 'Это псевдомассив (нет методов map, filter и др.)', isCorrect: true },
                    { id: 'c', text: 'Это объект Set' }
                ],
                explanation: 'arguments имеет length и доступ по индексу, но не наследуется от Array.prototype.'
            },
            {
                id: 'q132_2',
                text: 'Есть ли свойство arguments у стрелочных функций?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да' },
                    { id: 'b', text: 'Нет (берется из внешнего контекста)', isCorrect: true }
                ],
                explanation: 'Стрелочные функции не имеют своих arguments, они используют arguments из замыкания (внешней функции).'
            },
            {
                id: 'q132_3',
                text: 'Какой современный синтаксис позволяет получить все аргументы в виде настоящего массива?',
                type: 'input',
                correctAnswer: '...rest',
                explanation: 'Остаточные параметры (например, function(...args)) собирают аргументы в массив.'
            }
        ]
    },
    {
        id: '133',
        title: 'Closures (133)',
        category: 'Functions',
        questions: [
            {
                id: 'q133_1',
                text: 'Что выведет код: for(var i=0; i<3; i++) { setTimeout(() => console.log(i), 0); }?',
                type: 'single',
                options: [
                    { id: 'a', text: '0, 1, 2' },
                    { id: 'b', text: '3, 3, 3', isCorrect: true },
                    { id: 'c', text: 'undefined, undefined, undefined' }
                ],
                explanation: 'Переменная var имеет функциональную область видимости (одна на весь цикл). К моменту выполнения timeout i станет равно 3.'
            },
            {
                id: 'q133_2',
                text: 'Что такое замыкание (Closure) простыми словами?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Функция, которая вызывает сама себя' },
                    { id: 'b', text: 'Функция + её внешнее лексическое окружение', isCorrect: true },
                    { id: 'c', text: 'Ошибка доступа к переменной' }
                ],
                explanation: 'Замыкание позволяет функции запоминать и иметь доступ к переменным из своей внешней области видимости, даже когда она выполняется в другом месте.'
            },
            {
                id: 'q133_3',
                text: 'Для чего часто используется IIFE (Immediately Invoked Function Expression)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Для ускорения кода' },
                    { id: 'b', text: 'Для создания изолированной области видимости (scope)', isCorrect: true },
                    { id: 'c', text: 'Для асинхронности' }
                ],
                explanation: 'Раньше (до let/const) IIFE были основным способом создать локальный scope и не засорять глобальный.'
            }
        ]
    },
    {
        id: '134',
        title: 'Global Object (134)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q134_1',
                text: 'Какое стандартное имя используется для доступа к глобальному объекту в любой среде (Browser, Node.js)?',
                type: 'input',
                correctAnswer: 'globalThis',
                explanation: 'globalThis был введен для универсального доступа к global, window или self в зависимости от среды.'
            },
            {
                id: 'q134_2',
                text: 'Становятся ли переменные, объявленные через let/const, свойствами глобального объекта (window)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да' },
                    { id: 'b', text: 'Нет', isCorrect: true }
                ],
                explanation: 'В отличие от var, переменные let и const на верхнем уровне не создают свойств в window.'
            }
        ]
    },
    {
        id: '135',
        title: 'Function Properties & NFE (135)',
        category: 'Functions',
        questions: [
            {
                id: 'q135_1',
                text: 'Что означает свойство length у функции (function foo(a, b) {})?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Количество строк кода' },
                    { id: 'b', text: 'Количество объявленных параметров (аргументов)', isCorrect: true },
                    { id: 'c', text: 'Количество фактически переданных аргументов' }
                ],
                explanation: 'Function.length возвращает количество параметров в определении функции (без учета rest parameters).'
            },
            {
                id: 'q135_2',
                text: 'В чем главная особенность Named Function Expression (let f = function name() {})?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Имя "name" видно только внутри самой функции', isCorrect: true },
                    { id: 'b', text: 'Имя "name" видно снаружи' },
                    { id: 'c', text: 'Функция работает быстрее' }
                ],
                explanation: 'Имя функционального выражения доступно только внутри него самого. Это удобно для рекурсии.'
            }
        ]
    },
    {
        id: '136',
        title: 'New Function (136)',
        category: 'Functions',
        questions: [
            {
                id: 'q136_1',
                text: 'Какая главная особенность функций, созданных через new Function("a", "return a")?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Они не имеют доступа к локальным переменным (замыканию)', isCorrect: true },
                    { id: 'b', text: 'Они работают быстрее обычных функций' },
                    { id: 'c', text: 'Они всегда асинхронны' }
                ],
                explanation: 'Функции, созданные через new Function, имеют ссылку на глобальное лексическое окружение, а не на локальное.'
            },
            {
                id: 'q136_2',
                text: 'Передается ли тело функции при создании через new Function как аргумент?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет, оно генерируется автоматически' },
                    { id: 'b', text: 'Да, как последняя строка в списке аргументов', isCorrect: true }
                ],
                explanation: 'Последний аргумент конструктора new Function - это код тела функции в виде строки.'
            }
        ]
    },
    {
        id: '137',
        title: 'Timers (SetTimeout/Interval) (137)',
        category: 'Async & Event Loop',
        questions: [
            {
                id: 'q137_1',
                text: 'Гарантирует ли setTimeout(fn, 1000) выполнение ровно через 1000мс?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да, всегда точно' },
                    { id: 'b', text: 'Нет, это минимальная задержка, выполнение может быть позже', isCorrect: true }
                ],
                explanation: 'JS однопоточный. Если стек занят, таймер выполнится только после того, как освободится, что может занять больше времени.'
            },
            {
                id: 'q137_2',
                text: 'Что делает setTimeout(fn, 0)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Выполняет функцию немедленно (синхронно)' },
                    { id: 'b', text: 'Ставит функцию в очередь задач (MacroTask) для выполнения после текущего кода', isCorrect: true }
                ],
                explanation: 'Нулевая задержка переносит выполнение в следующий цикл событий (после выполнения текущего синхронного кода).'
            },
            {
                id: 'q137_3',
                text: 'Какой метод останавливает повторение setInterval?',
                type: 'input',
                correctAnswer: 'clearInterval',
                explanation: 'clearInterval(id) останавливает таймер, запущенный setInterval.'
            }
        ]
    },
    {
        id: '138',
        title: 'Call, Apply, Decorators (138)',
        category: 'Functions',
        questions: [
            {
                id: 'q138_1',
                text: 'В чем отличие call от apply?',
                type: 'single',
                options: [
                    { id: 'a', text: 'call принимает массив аргументов, apply - список через запятую' },
                    { id: 'b', text: 'call принимает аргументы через запятую, apply - массив', isCorrect: true },
                    { id: 'c', text: 'Нет отличий' }
                ],
                explanation: 'Запомнить: C - Comma (запятая/Call), A - Array (массив/Apply).'
            },
            {
                id: 'q138_2',
                text: 'Что делает декоратор функции?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Украшает код CSS-стилями' },
                    { id: 'b', text: 'Оборачивает функцию, добавляя поведение до или после ее вызова', isCorrect: true }
                ],
                explanation: 'Декоратор - это паттерн, позволяющий изменять поведение функции без изменения ее кода.'
            },
            {
                id: 'q138_3',
                text: 'Куда указывает this при вызове func.call(context)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'На глобальный объект' },
                    { id: 'b', text: 'На переданный context', isCorrect: true },
                    { id: 'c', text: 'На саму функцию func' }
                ],
                explanation: 'Методы call/apply/bind явно задают значение this равным первому аргументу.'
            }
        ]
    },
    {
        id: '139',
        title: 'Context Binding (This) (139)',
        category: 'Functions',
        questions: [
            {
                id: 'q139_1',
                text: 'Что возвращает метод func.bind(context)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Результат вызова функции' },
                    { id: 'b', text: 'Новую функцию с жестко привязанным контекстом', isCorrect: true },
                    { id: 'c', text: 'undefined' }
                ],
                explanation: 'bind не вызывает функцию сразу, а возвращает "обертку", которую можно вызвать позже.'
            },
            {
                id: 'q139_2',
                text: 'Если вызвать метод obj.method() - чему равен this?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Глобальному объекту' },
                    { id: 'b', text: 'Объекту obj (то, что слева от точки)', isCorrect: true },
                    { id: 'c', text: 'undefined' }
                ],
                explanation: 'При вызове метода объекта this ссылается на сам объект.'
            },
            {
                id: 'q139_3',
                text: 'Потеряется ли this, если передать метод объекта в setTimeout (setTimeout(user.sayHi, 1000))?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет' },
                    { id: 'b', text: 'Да, this станет global или undefined', isCorrect: true }
                ],
                explanation: 'Передается только ссылка на функцию, без контекста объекта. Для сохранения this надо использовать bind или стрелочную функцию.'
            }
        ]
    },
    {
        id: '140',
        title: 'DOM Navigation (140)',
        category: 'DOM & Events',
        questions: [
            {
                id: 'q140_1',
                text: 'Какое свойство возвращает коллекцию ТОЛЬКО элементов-детей (без текста/комментариев)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'childNodes' },
                    { id: 'b', text: 'children', isCorrect: true },
                    { id: 'c', text: 'firstChild' }
                ],
                explanation: 'childNodes содержит все узлы (включая текстовые переносы строк), children - только HTML-элементы.'
            },
            {
                id: 'q140_2',
                text: 'Что вернет document.body.parentElement?',
                type: 'single',
                options: [
                    { id: 'a', text: 'null' },
                    { id: 'b', text: 'html (documentElement)', isCorrect: true },
                    { id: 'c', text: 'document' }
                ],
                explanation: 'Родитель body - это html. parentElement возвращает null для html, так как document не является Element.'
            },
            {
                id: 'q140_3',
                text: 'Какое свойство указывает на следующий элемент-сосед (игнорируя текст)?',
                type: 'input',
                correctAnswer: 'nextElementSibling',
                explanation: 'nextSibling может вернуть текстовый узел, nextElementSibling - только элемент.'
            }
        ]
    },
    {
        id: '141',
        title: 'DOM Search (141)',
        category: 'DOM & Events',
        questions: [
            {
                id: 'q141_1',
                text: 'Какое главное отличие getElementsByTagName от querySelectorAll?',
                type: 'single',
                options: [
                    { id: 'a', text: 'querySelectorAll возвращает живую коллекцию' },
                    { id: 'b', text: 'getElementsByTagName возвращает ЖИВУЮ коллекцию, а querySelectorAll - статическую', isCorrect: true },
                    { id: 'c', text: 'Нет отличий' }
                ],
                explanation: 'Коллекции getElementsBy* обновляются автоматически при изменении DOM. querySelectorAll возвращает снимок элементов на момент вызова.'
            },
            {
                id: 'q141_2',
                text: 'Что вернет document.querySelector("#id"), если элемент не найден?',
                type: 'single',
                options: [
                    { id: 'a', text: 'undefined' },
                    { id: 'b', text: 'null', isCorrect: true },
                    { id: 'c', text: 'Пустой массив []' }
                ],
                explanation: 'Методы поиска одного элемента возвращают null, если ничего не найдено.'
            },
            {
                id: 'q141_3',
                text: 'Какой метод ищет элементы по CSS-селектору?',
                type: 'input',
                correctAnswer: 'querySelectorAll',
                explanation: 'querySelectorAll (и querySelector) позволяет использовать любой CSS селектор (.class, #id, div > p).'
            }
        ]
    },
    {
        id: '142',
        title: 'Node Properties (142)',
        category: 'DOM & Events',
        questions: [
            {
                id: 'q142_1',
                text: 'Какой nodeType у элемента (например, <div>)?',
                type: 'single',
                options: [
                    { id: 'a', text: '1', isCorrect: true },
                    { id: 'b', text: '3' },
                    { id: 'c', text: '9' }
                ],
                explanation: '1 - Element, 3 - Text, 9 - Document. Это полезно для фильтрации узлов.'
            },
            {
                id: 'q142_2',
                text: 'В чем разница между innerHTML и textContent при чтении?',
                type: 'single',
                options: [
                    { id: 'a', text: 'textContent возвращает текст с учетом CSS (скрытые не видны)' },
                    { id: 'b', text: 'textContent возвращает весь текст узла и потомков "как есть", игнорируя теги', isCorrect: true }
                ],
                explanation: 'textContent безопаснее и быстрее, он возвращает чистый текст всех вложенных узлов. innerHTML возвращает HTML-разметку.'
            },
            {
                id: 'q142_3',
                text: 'Какое свойство возвращает имя тега в верхнем регистре (для HTML)?',
                type: 'input',
                correctAnswer: 'tagName',
                explanation: 'Для элемента <div> свойство tagName вернет "DIV".'
            }
        ]
    },
    {
        id: '143',
        title: 'DOM Modification (143)',
        category: 'DOM & Events',
        questions: [
            {
                id: 'q143_1',
                text: 'Какой метод добавляет элемент В КОНЕЦ (внутрь) другого элемента?',
                type: 'input',
                correctAnswer: 'append',
                explanation: 'elem.append(...nodes) добавляет узлы или строки в конец elem. prepend - в начало.'
            },
            {
                id: 'q143_2',
                text: 'Что делает elem.remove()?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Скрывает элемент (display: none)' },
                    { id: 'b', text: 'Удаляет элемент из DOM-дерева', isCorrect: true }
                ],
                explanation: 'Современный метод remove() полностью удаляет узел из родителя.'
            },
            {
                id: 'q143_3',
                text: 'Куда вставит элемент метод before()?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Внутрь, в начало' },
                    { id: 'b', text: 'Перед самим элементом (как соседа)', isCorrect: true }
                ],
                explanation: 'before() и after() вставляют узлы "снаружи", рядом с элементом.'
            }
        ]
    },
    {
        id: '144',
        title: 'Events Basics (144)',
        category: 'DOM & Events',
        questions: [
            {
                id: 'q144_1',
                text: 'Какое свойство события указывает на элемент, который ИНИЦИИРОВАЛ событие?',
                type: 'single',
                options: [
                    { id: 'a', text: 'currentTarget' },
                    { id: 'b', text: 'target', isCorrect: true }
                ],
                explanation: 'target - это исходный элемент (на который кликнули). currentTarget - элемент, на котором висит обработчик (изменяется при всплытии).'
            },
            {
                id: 'q144_2',
                text: 'Что такое всплытие (bubbling)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Событие идет от document вниз к элементу' },
                    { id: 'b', text: 'Событие идет от целевого элемента вверх к родителям', isCorrect: true }
                ],
                explanation: 'По умолчанию события всплывают от target наверх до window.'
            },
            {
                id: 'q144_3',
                text: 'Какой метод останавливает всплытие события?',
                type: 'single',
                options: [
                    { id: 'a', text: 'event.preventDefault()' },
                    { id: 'b', text: 'event.stopPropagation()', isCorrect: true }
                ],
                explanation: 'stopPropagation() прекращает передачу события родителям. preventDefault() только отменяет действие браузера.'
            }
        ]
    },
    {
        id: '145',
        title: 'Browser Defaults (145)',
        category: 'DOM & Events',
        questions: [
            {
                id: 'q145_1',
                text: 'Как отменить действие браузера по умолчанию (например, переход по ссылке)?',
                type: 'input',
                correctAnswer: 'event.preventDefault()',
                explanation: 'Этот метод предотвращает стандартную реакцию браузера (сабмит формы, переход по ссылке, выделение текста).'
            },
            {
                id: 'q145_2',
                text: 'Можно ли отменить действие по умолчанию в пассивном (passive) обработчике?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да' },
                    { id: 'b', text: 'Нет', isCorrect: true }
                ],
                explanation: 'Passive: true сообщает браузеру, что preventDefault() не будет вызван, что позволяет оптимизировать скролл.'
            }
        ]
    },
    {
        id: '146',
        title: 'Property Flags & Descriptors (146)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q146_1',
                text: 'Какой флаг отвечает за возможность изменения значения свойства?',
                type: 'single',
                options: [
                    { id: 'a', text: 'configurable' },
                    { id: 'b', text: 'enumerable' },
                    { id: 'c', text: 'writable', isCorrect: true }
                ],
                explanation: 'writable: true означает, что значение свойства можно изменить.'
            },
            {
                id: 'q146_2',
                text: 'Что делает Object.seal(obj)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Запрещает добавление, удаление и изменение свойств' },
                    { id: 'b', text: 'Запрещает добавление и удаление свойств, но разрешает изменение существующих', isCorrect: true },
                    { id: 'c', text: 'Делает объект неизменяемым (полностью immutable)' }
                ],
                explanation: 'seal (запечатать) ставит configurable: false для всех свойств, но оставляет writable: true (если было).'
            },
            {
                id: 'q146_3',
                text: 'С помощью какого метода можно получить полный дескриптор свойства?',
                type: 'input',
                correctAnswer: 'Object.getOwnPropertyDescriptor',
                explanation: 'Object.getOwnPropertyDescriptor(obj, prop) возвращает объект с флагами (writable, configurable, enumerable) и значением.'
            }
        ]
    },
    {
        id: '147',
        title: 'Getters & Setters (147)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q147_1',
                text: 'Как создать свойство-аксессор (геттер) в литерале объекта?',
                type: 'single',
                options: [
                    { id: 'a', text: 'getter prop() { ... }' },
                    { id: 'b', text: 'get prop() { ... }', isCorrect: true },
                    { id: 'c', text: 'prop: get() { ... }' }
                ],
                explanation: 'Синтаксис get prop() { ... } позволяет создать свойство, которое на самом деле вызывает функцию при чтении.'
            },
            {
                id: 'q147_2',
                text: 'Может ли у одного свойства быть одновременно и value, и get?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да' },
                    { id: 'b', text: 'Нет, это запрещено', isCorrect: true }
                ],
                explanation: 'Дескриптор может быть либо полем данных (value, writable), либо аксессором (get, set). Смешивать их нельзя.'
            }
        ]
    },
    {
        id: '148',
        title: 'Prototypes & Inheritance (148)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q148_1',
                text: 'Что такое __proto__?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Это свойство объекта, указывающее на его прототип (getter/setter для [[Prototype]])', isCorrect: true },
                    { id: 'b', text: 'Это то же самое, что и prototype' },
                    { id: 'c', text: 'Это скрытое свойство функции' }
                ],
                explanation: '__proto__ — это исторический геттер/сеттер для внутреннего скрытого свойства [[Prototype]]. Сейчас рекомендуется использовать Object.getPrototypeOf.'
            },
            {
                id: 'q148_2',
                text: 'Если свойство не найдено в объекте, где его будет искать JS?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Вернет undefined сразу' },
                    { id: 'b', text: 'В прототипе, затем в прототипе прототипа и так далее по цепочке', isCorrect: true }
                ],
                explanation: 'Поиск идет вверх по цепочке прототипов до null.'
            },
            {
                id: 'q148_3',
                text: 'Какой метод создает объект с указанным прототипом?',
                type: 'input',
                correctAnswer: 'Object.create',
                explanation: 'Object.create(proto) создает пустой объект с [[Prototype]], равным proto.'
            }
        ]
    },
    {
        id: '149',
        title: 'F.prototype (149)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q149_1',
                text: 'Для чего используется свойство F.prototype у функции-конструктора?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Оно доступно во всех экземплярах как свойство .prototype' },
                    { id: 'b', text: 'При вызове new F(), оно устанавливается как [[Prototype]] нового объекта', isCorrect: true }
                ],
                explanation: 'F.prototype используется только в момент вызова new F() для установки __proto__ создаваемому объекту.'
            },
            {
                id: 'q149_2',
                text: 'Является ли Object.prototype прототипом для всех обычных объектов по умолчанию?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да', isCorrect: true },
                    { id: 'b', text: 'Нет' }
                ],
                explanation: 'Любой литерал объекта {} наследует от Object.prototype (где лежат методы toString, hasOwnProperty и др).'
            }
        ]
    },
    {
        id: '150',
        title: 'Classes Basics (150)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q150_1',
                text: 'Является ли класс в JS новым типом данных?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да, type of class вернет "class"' },
                    { id: 'b', text: 'Нет, это "синтаксический сахар" над функцией', isCorrect: true }
                ],
                explanation: 'typeof MyClass вернет "function". Классы в JS построены на прототипном наследовании.'
            },
            {
                id: 'q150_2',
                text: 'Где хранятся методы, объявленные внутри класса (например, sayHi() {...})?',
                type: 'single',
                options: [
                    { id: 'a', text: 'В самом объекте-экземпляре' },
                    { id: 'b', text: 'В prototype класса (MyClass.prototype)', isCorrect: true }
                ],
                explanation: 'Все методы класса записываются в prototype.'
            },
            {
                id: 'q150_3',
                text: 'Обязательно ли объявлять constructor в классе?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да, всегда' },
                    { id: 'b', text: 'Нет, если его нет, он создается автоматически', isCorrect: true }
                ],
                explanation: 'Если конструктор не указан, создается пустой конструктор по умолчанию (который вызывает super() в случае наследования).'
            }
        ]
    },
    {
        id: '151',
        title: 'Class Inheritance (151)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q151_1',
                text: 'Какое ключевое слово используется для наследования класса?',
                type: 'single',
                options: [
                    { id: 'a', text: 'inherits' },
                    { id: 'b', text: 'extends', isCorrect: true },
                    { id: 'c', text: 'params' }
                ],
                explanation: 'class Child extends Parent позволяет наследовать функциональность от другого класса.'
            },
            {
                id: 'q151_2',
                text: 'Что нужно обязательно вызвать в конструкторе дочернего класса перед использованием this?',
                type: 'single',
                options: [
                    { id: 'a', text: 'this.super()' },
                    { id: 'b', text: 'super()', isCorrect: true },
                    { id: 'c', text: 'Parent.call(this)' }
                ],
                explanation: 'super() вызывает конструктор родителя. Без этого this не будет определен.'
            },
            {
                id: 'q151_3',
                text: 'Можно ли в дочернем классе вызвать метод родителя, который был переопределен?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет, он полностью затерт' },
                    { id: 'b', text: 'Да, через super.method()', isCorrect: true }
                ],
                explanation: 'super предоставляет доступ к методам прототипа родительского класса.'
            }
        ]
    },
    {
        id: '152',
        title: 'Static Properties & Methods (152)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q152_1',
                text: 'Кому принадлежат статические методы (static)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Каждому экземпляру (через this)' },
                    { id: 'b', text: 'Самому классу (функции-конструктору)', isCorrect: true }
                ],
                explanation: 'Статические методы записываются прямо в функцию класса, а не в prototype, и вызываются как Class.method().'
            },
            {
                id: 'q152_2',
                text: 'Доступен ли this в статических методах?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет' },
                    { id: 'b', text: 'Да, он указывает на сам класс', isCorrect: true }
                ],
                explanation: 'Внутри static метода this ссылается на класс (конструктор), а не на экземпляр.'
            },
            {
                id: 'q152_3',
                text: 'Наследуются ли статические методы?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да', isCorrect: true },
                    { id: 'b', text: 'Нет' }
                ],
                explanation: 'Да, наследование классов наследует как prototype для экземпляров, так и статические методы самих классов.'
            }
        ]
    },
    {
        id: '153',
        title: 'Private Fields (#) (153)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q153_1',
                text: 'Как объявить приватное поле в классе (современный JS)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'private field' },
                    { id: 'b', text: '_field' },
                    { id: 'c', text: '#field', isCorrect: true }
                ],
                explanation: 'Префикс # (решетка) делает поле приватным на уровне языка. Доступ к нему возможен только внутри класса.'
            },
            {
                id: 'q153_2',
                text: 'Можно ли получить доступ к приватному полю #field извне класса?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да, если знать имя' },
                    { id: 'b', text: 'Нет, будет ошибка синтаксиса', isCorrect: true }
                ],
                explanation: 'JS защищает приватные поля жестко. Попытка обращения user.#password снаружи вызовет ошибку.'
            }
        ]
    },
    {
        id: '154',
        title: 'Extending Built-in Classes (154)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q154_1',
                text: 'Можно ли наследовать от встроенных классов, например, Array?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет' },
                    { id: 'b', text: 'Да, class MyArr extends Array {}', isCorrect: true }
                ],
                explanation: 'Встроенные классы можно расширять, добавляя свои методы.'
            },
            {
                id: 'q154_2',
                text: 'Будут ли методы map/filter у наследованного массива возвращать экземпляры вашего класса?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет, они вернут обычный Array' },
                    { id: 'b', text: 'Да, они автоматически используют конструктор потомка (Symbol.species)', isCorrect: true }
                ],
                explanation: 'Встроенные методы используют constructor[Symbol.species] для создания новых объектов, сохраняя тип вашего класса.'
            }
        ]
    },
    {
        id: '155',
        title: 'Instanceof (155)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q155_1',
                text: 'Что проверяет оператор obj instanceof Class?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Создан ли объект именно этим конструктором (прямая ссылка)' },
                    { id: 'b', text: 'Присутствует ли Class.prototype в цепочке прототипов obj', isCorrect: true }
                ],
                explanation: 'instanceof ищет совпадение prototype по всей цепочке наследования.'
            },
            {
                id: 'q155_2',
                text: 'Вернет ли true проверка: [] instanceof Object ?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да', isCorrect: true },
                    { id: 'b', text: 'Нет' }
                ],
                explanation: 'Array наследует от Object, поэтому массив является экземпляром Object.'
            },
            {
                id: 'q155_3',
                text: 'Как можно настроить поведение instanceof для своего класса?',
                type: 'input',
                correctAnswer: 'Symbol.hasInstance',
                explanation: 'Статический метод [Symbol.hasInstance](obj) позволяет реализовать свою логику проверки.'
            }
        ]
    },
    {
        id: '156',
        title: 'Mixins (156)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q156_1',
                text: 'Что такое примесь (mixin) в JavaScript?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Специальный тип класса' },
                    { id: 'b', text: 'Объект с методами, который можно "подмешать" в прототип другого класса', isCorrect: true }
                ],
                explanation: 'Примеси позволяют добавлять свойства и методы к классам без использования жесткого наследования.'
            },
            {
                id: 'q156_2',
                text: 'Какой метод часто используется для реализации примесей?',
                type: 'input',
                correctAnswer: 'Object.assign',
                explanation: 'Object.assign(User.prototype, mixin) копирует методы из примеси в прототип класса.'
            }
        ]
    },
    {
        id: '157',
        title: 'Error Handling (157)',
        category: 'JavaScript Core',
        questions: [
            {
                id: 'q157_1',
                text: 'Какой блок выполнится в любом случае (есть ошибка или нет)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'catch' },
                    { id: 'b', text: 'default' },
                    { id: 'c', text: 'finally', isCorrect: true }
                ],
                explanation: 'Конструкция try...catch...finally гарантирует выполнение блока finally.'
            },
            {
                id: 'q157_2',
                text: 'Что содержит свойство stack объекта ошибки?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Сообщение об ошибке' },
                    { id: 'b', text: 'Стек вызовов, где произошла ошибка', isCorrect: true }
                ],
                explanation: 'stack помогает отследить последовательность вызовов функций, приведшую к ошибке.'
            }
        ]
    },
    {
        id: '158',
        title: 'Generators (158)',
        category: 'Functions',
        questions: [
            {
                id: 'q158_1',
                text: 'Какой синтаксис объявляет функцию-генератор?',
                type: 'single',
                options: [
                    { id: 'a', text: 'function generator() {}' },
                    { id: 'b', text: 'function* gen() {}', isCorrect: true },
                    { id: 'c', text: 'async function gen() {}' }
                ],
                explanation: 'Звездочка (*) после function указывает, что это генератор.'
            },
            {
                id: 'q158_2',
                text: 'Что возвращает метод generator.next()?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Просто следующее значение' },
                    { id: 'b', text: 'Объект формата { value: ..., done: boolean }', isCorrect: true }
                ],
                explanation: 'Итератор генератора возвращает объект с текущим значением и флагом завершения.'
            }
        ]
    },
    {
        id: '159',
        title: 'Async Generators (159)',
        category: 'Functions',
        questions: [
            {
                id: 'q159_1',
                text: 'Какой цикл используется для перебора асинхронных генераторов?',
                type: 'single',
                options: [
                    { id: 'a', text: 'for...of' },
                    { id: 'b', text: 'for await...of', isCorrect: true },
                    { id: 'c', text: 'forEach' }
                ],
                explanation: 'Обычный for...of не умеет ждать промисы, поэтому для асинхронных итераторов нужен for await...of.'
            },
            {
                id: 'q159_2',
                text: 'Что возвращает next() у асинхронного генератора?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Объект {value, done}' },
                    { id: 'b', text: 'Промис, который резолвится в {value, done}', isCorrect: true }
                ],
                explanation: 'AsyncIterator всегда возвращает Promise.'
            }
        ]
    },
    {
        id: '160',
        title: 'Garbage Collection (160)',
        category: 'JavaScript Core',
        questions: [
            {
                id: 'q160_1',
                text: 'Какой основной алгоритм используется в JS для сборки мусора?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Reference Counting (Подсчет ссылок)' },
                    { id: 'b', text: 'Mark-and-Sweep (Пометить и вымести)', isCorrect: true }
                ],
                explanation: 'Mark-and-Sweep определяет "достижимость" объектов от корней, что позволяет убирать циклические ссылки.'
            },
            {
                id: 'q160_2',
                text: 'Что такое "корни" (roots) в контексте GC?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Только глобальный объект window' },
                    { id: 'b', text: 'Набор базовых достижимых значений (глобальные переменные, локальные переменные функции в стеке)', isCorrect: true }
                ],
                explanation: 'Сборщик мусора начинает обход графа объектов именно с этих корней.'
            }
        ]
    },
    {
        id: '161',
        title: 'WeakMap & WeakSet (161)',
        category: 'Objects & Classes',
        questions: [
            {
                id: 'q161_1',
                text: 'Какое главное отличие WeakMap от Map?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Ключи могут быть только примитивами' },
                    { id: 'b', text: 'Ключи могут быть только объектами, и они не удерживаются от сборки мусора', isCorrect: true },
                    { id: 'c', text: 'WeakMap итерируемый, а Map нет' }
                ],
                explanation: 'WeakMap держит "слабую" ссылку на ключ-объект. Если объект удален везде, кроме WeakMap, он будет удален и оттуда GC.'
            },
            {
                id: 'q161_2',
                text: 'Можно ли получить список ключей keys() у WeakMap?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да' },
                    { id: 'b', text: 'Нет, он не итерируемый', isCorrect: true }
                ],
                explanation: 'Так как содержимое зависит от GC, методы keys(), values(), entries() и size недоступны.'
            }
        ]
    },
    {
        id: '162',
        title: 'Microtasks (162)',
        category: 'JavaScript Core',
        questions: [
            {
                id: 'q162_1',
                text: 'Что является микрозадачей?',
                type: 'single',
                options: [
                    { id: 'a', text: 'setTimeout(..., 0)' },
                    { id: 'b', text: 'Обработчики .then/catch/finally промисов', isCorrect: true },
                    { id: 'c', text: 'События мыши' }
                ],
                explanation: 'Промисы и queueMicrotask создают микрозадачи, которые имеют приоритет перед макрозадачами.'
            },
            {
                id: 'q162_2',
                text: 'Когда выполняется очередь микрозадач?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Сразу после текущего макротаска (скрипта), перед рендерингом и следующими макротасками', isCorrect: true },
                    { id: 'b', text: 'В произвольном порядке' }
                ],
                explanation: 'Движок выполняет все микрозадачи подряд до очистки очереди, и только потом переходит к рендерингу или таймерам.'
            }
        ]
    },
    {
        id: '163',
        title: 'Event Loop (163)',
        category: 'JavaScript Core',
        questions: [
            {
                id: 'q163_1',
                text: 'В каком порядке выполнятся: console.log(1), setTimeout(..., 0), Promise.resolve().then(...)',
                type: 'single',
                options: [
                    { id: 'a', text: 'console -> setTimeout -> Promise' },
                    { id: 'b', text: 'console -> Promise -> setTimeout', isCorrect: true }
                ],
                explanation: '1. Синхронный код (console). 2. Микрозадачи (Promise). 3. Макрозадачи (setTimeout).'
            },
            {
                id: 'q163_2',
                text: 'Блокирует ли бесконечный цикл в микрозадаче Event Loop?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет, браузер его прервет' },
                    { id: 'b', text: 'Да, страница зависнет', isCorrect: true }
                ],
                explanation: 'Поскольку микрозадачи выполняются до очистки очереди, бесконечное добавление микрозадач блокирует рендеринг и макрозадачи.'
            }
        ]
    },
    {
        id: '164',
        title: 'Modules Imports (164)',
        category: 'JavaScript Core',
        questions: [
            {
                id: 'q164_1',
                text: 'Как импортировать всё содержимое модуля как один объект?',
                type: 'single',
                options: [
                    { id: 'a', text: 'import all from "mod"' },
                    { id: 'b', text: 'import * as obj from "mod"', isCorrect: true }
                ],
                explanation: 'Синтаксис import * as Name собирает все именованные экспорты в объект Name.'
            },
            {
                id: 'q164_2',
                text: 'Можно ли делать импорт динамическим (по условию)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет, import всегда в начале файла' },
                    { id: 'b', text: 'Да, используя функцию import(...)', isCorrect: true }
                ],
                explanation: 'import(path) возвращает промис и может быть вызван в любом месте кода.'
            }
        ]
    },
    {
        id: '165',
        title: 'Console API (165)',
        category: 'Browser API',
        questions: [
            {
                id: 'q165_1',
                text: 'Какой метод консоли выводит данные в виде таблички?',
                type: 'input',
                correctAnswer: 'console.table',
                explanation: 'console.table(data) красиво отображает массивы объектов или массивы массивов.'
            },
            {
                id: 'q165_2',
                text: 'Как замерить время выполнения кода с помощью консоли?',
                type: 'single',
                options: [
                    { id: 'a', text: 'console.start() / console.end()' },
                    { id: 'b', text: 'console.time("label") / console.timeEnd("label")', isCorrect: true }
                ],
                explanation: 'console.time(label) запускает таймер, а timeEnd(label) останавливает его и выводит результат.'
            },
            {
                id: 'q165_3',
                text: 'Для чего нужен console.dir()?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Для вывода списка файлов' },
                    { id: 'b', text: 'Для отображения объекта в виде интерактивного списка свойств (особенно полезно для DOM-элементов)', isCorrect: true }
                ],
                explanation: 'В отличие от log, dir всегда пытается показать структуру объекта, а не его строковое представление (как часто бывает с DOM).'
            }
        ]
    },
    {
        id: '166',
        title: 'File & FileReader (166)',
        category: 'Browser API',
        questions: [
            {
                id: 'q166_1',
                text: 'Какой объект представляет файл, выбранный в <input type="file">?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Blob' },
                    { id: 'b', text: 'File (наследник Blob)', isCorrect: true },
                    { id: 'c', text: 'Buffer' }
                ],
                explanation: 'DOM-элемент input.files[0] возвращает объект File, который наследует от Blob и имеет свойства name и lastModified.'
            },
            {
                id: 'q166_2',
                text: 'Какой метод FileReader позволяет прочитать содержимое файла в формате base64 (для превью)?',
                type: 'input',
                correctAnswer: 'readAsDataURL',
                explanation: 'readAsDataURL(file) читает файл и возвращает результат в виде строки data:..., которую можно вставить в source img.'
            }
        ]
    },
    {
        id: '167',
        title: 'Fetch API (167)',
        category: 'Network & Storage',
        questions: [
            {
                id: 'q167_1',
                text: 'Считает ли fetch() запрос успешным, если сервер вернул статус 404 или 500?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет, он выбросит ошибку (reject)' },
                    { id: 'b', text: 'Да, промис выполнится успешно (resolve), но свойство ok будет false', isCorrect: true }
                ],
                explanation: 'fetch реджектится только при сетевых ошибках (нет интернета, DNS). HTTP-ошибки считаются успешным завершением запроса.'
            },
            {
                id: 'q167_2',
                text: 'Какое свойство ответа указывает на успешный диапазон кодов (200-299)?',
                type: 'input',
                correctAnswer: 'ok',
                explanation: 'response.ok — это сокращение для проверки статуса (status >= 200 && status < 300).'
            }
        ]
    },
    {
        id: '168',
        title: 'CORS (168)',
        category: 'Network & Storage',
        questions: [
            {
                id: 'q168_1',
                text: 'Кто блокирует запрос при ошибке CORS?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Сервер не отправляет ответ' },
                    { id: 'b', text: 'Браузер получает ответ, видит несовпадение заголовков и блокирует доступ к нему', isCorrect: true }
                ],
                explanation: 'CORS — это механизм безопасности именно браузера. Сервер часто даже обрабатывает запрос, но браузер скрывает результат от JS.'
            },
            {
                id: 'q168_2',
                text: 'Какой HTTP-метод используется для предварительного (preflight) запроса?',
                type: 'single',
                options: [
                    { id: 'a', text: 'HEAD' },
                    { id: 'b', text: 'OPTIONS', isCorrect: true },
                    { id: 'c', text: 'CONNECT' }
                ],
                explanation: 'Браузер делает запрос OPTIONS, чтобы спросить разрешение у сервера перед отправкой сложных запросов (например, с JSON).'
            }
        ]
    },
    {
        id: '169',
        title: 'FormData (169)',
        category: 'Network & Storage',
        questions: [
            {
                id: 'q169_1',
                text: 'Зачем обычно используется FormData?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Для валидации форм' },
                    { id: 'b', text: 'Для отправки форм, особенно содержащих файлы, через AJAX', isCorrect: true }
                ],
                explanation: 'FormData позволяет легко сформировать тело запроса multipart/form-data, что необходимо для загрузки файлов.'
            },
            {
                id: 'q169_2',
                text: 'Нужно ли вручную устанавливать Content-Type для FormData при использовании fetch?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да, multipart/form-data' },
                    { id: 'b', text: 'Нет, браузер сделает это сам и добавит boundary', isCorrect: true }
                ],
                explanation: 'Если выставить Content-Type вручную, пропадет boundary, и сервер не сможет распарсить тело.'
            }
        ]
    },
    {
        id: '170',
        title: 'Web Storage (170)',
        category: 'Network & Storage',
        questions: [
            {
                id: 'q170_1',
                text: 'В чем главное отличие sessionStorage от localStorage?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Размер хранилища' },
                    { id: 'b', text: 'sessionStorage очищается после закрытия вкладки, а localStorage живет до явной очистки', isCorrect: true }
                ],
                explanation: 'sessionStorage привязан к конкретной вкладке (сессии), localStorage — к источнику (origin) и не имеет срока действия.'
            },
            {
                id: 'q170_2',
                text: 'Какой тип данных можно хранить в localStorage?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Любые JS-объекты' },
                    { id: 'b', text: 'Только строки (ключ и значение)', isCorrect: true }
                ],
                explanation: 'Весь контент автоматически приводится к строке. Для хранения объектов нужно использовать JSON.stringify().'
            }
        ]
    },
    {
        id: '171',
        title: 'Cookies (171)',
        category: 'Network & Storage',
        questions: [
            {
                id: 'q171_1',
                text: 'Какой атрибут cookie делает её недоступной для JavaScript (защита от XSS)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Secure' },
                    { id: 'b', text: 'HttpOnly', isCorrect: true },
                    { id: 'c', text: 'SameSite' }
                ],
                explanation: 'Флаг HttpOnly запрещает доступ к куке через document.cookie, что защищает от кражи сессии при XSS-атаках.'
            },
            {
                id: 'q171_2',
                text: 'Как удалить cookie в браузере через JS?',
                type: 'single',
                options: [
                    { id: 'a', text: 'document.cookie.delete("name")' },
                    { id: 'b', text: 'Установить её с прошедшей датой (expires/max-age)', isCorrect: true }
                ],
                explanation: 'Специального метода удаления нет. Нужно переписать куку с тем же именем и путем, но с max-age=0 или старой датой.'
            }
        ]
    },
    {
        id: '172',
        title: 'RegExp Flags & Unicode (172)',
        category: 'RegExp',
        questions: [
            {
                id: 'q172_1',
                text: 'Работает ли метасимвол \\b (граница слова) с кириллицей по умолчанию?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да, конечно' },
                    { id: 'b', text: 'Нет, он считает кириллицу не-буквой (non-word char)', isCorrect: true }
                ],
                explanation: '\\b ориентируется на \\w, который включает только [a-zA-Z0-9_]. Для кириллицы нужны другие подходы (указание Unicode-классов).'
            },
            {
                id: 'q172_2',
                text: 'Какой флаг включает полную поддержку Unicode (суррогатные пары, классы \\p{...})?',
                type: 'single',
                options: [
                    { id: 'a', text: 'g' },
                    { id: 'b', text: 'u', isCorrect: true },
                    { id: 'c', text: 'm' }
                ],
                explanation: 'Флаг "u" (unicode) обязателен для корректной обработки символов, состоящих из суррогатных пар (эмодзи и др.), и классов \\p.'
            }
        ]
    },
    {
        id: '173',
        title: 'RegExp Anchors (173)',
        category: 'RegExp',
        questions: [
            {
                id: 'q173_1',
                text: 'Что означают якоря ^ и $ в обычном режиме (без флага m)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Начало и конец каждой строки' },
                    { id: 'b', text: 'Начало и конец всего текста (строки целиком)', isCorrect: true }
                ],
                explanation: 'По умолчанию они матчат начало и конец всей строки. Флаг m (multiline) заставляет их срабатывать на каждой новой строке (после \\n).'
            },
            {
                id: 'q173_2',
                text: 'Какой флаг нужен, чтобы символ точки (.) совпадал с переносом строки?',
                type: 'single',
                options: [
                    { id: 'a', text: 'm' },
                    { id: 'b', text: 's (dotAll)', isCorrect: true }
                ],
                explanation: 'Флаг "s" включает режим dotAll, где точка совпадает с любым символом, включая \\n.'
            }
        ]
    },
    {
        id: '174',
        title: 'Sets & Ranges (174)',
        category: 'RegExp',
        questions: [
            {
                id: 'q174_1',
                text: 'Что означает запись [^a-z]?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Строка начинается с букв a-z' },
                    { id: 'b', text: 'Любой символ, КРОМЕ букв a-z (инверсия набора)', isCorrect: true }
                ],
                explanation: 'Циркумфлекс (^) в начале квадратных скобок означает отрицание набора.'
            },
            {
                id: 'q174_2',
                text: 'Как обозначить "или" для целых слов/фраз (например, cat или dog)?',
                type: 'single',
                options: [
                    { id: 'a', text: '[cat|dog]' },
                    { id: 'b', text: 'cat|dog', isCorrect: true }
                ],
                explanation: 'Вертикальная черта | (pipe) работает как логическое ИЛИ. Скобки [] — это набор символов (один из перечисленных).'
            }
        ]
    },
    {
        id: '175',
        title: 'Quantifiers (175)',
        category: 'RegExp',
        questions: [
            {
                id: 'q175_1',
                text: 'Что означает квантификатор +?',
                type: 'single',
                options: [
                    { id: 'a', text: '0 или более раз' },
                    { id: 'b', text: '1 или более раз', isCorrect: true },
                    { id: 'c', text: '0 или 1 раз' }
                ],
                explanation: '+ требует наличия хотя бы одного символа ({1,}). * — это {0,}, ? — это {0,1}.'
            },
            {
                id: 'q175_2',
                text: 'По умолчанию квантификаторы жадные. Как сделать квантификатор ленивым (остановиться как можно раньше)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Добавить флаг g' },
                    { id: 'b', text: 'Добавить знак вопроса после квантификатора (например, *?, +?)', isCorrect: true }
                ],
                explanation: 'Символ ? после квантификатора переключает его в ленивый режим (минимальное количество совпадений).'
            }
        ]
    },
    {
        id: '176',
        title: 'RegExp Groups (176)',
        category: 'RegExp',
        questions: [
            {
                id: 'q176_1',
                text: 'Как создать группу, которая не запоминает результат (non-capturing group)?',
                type: 'single',
                options: [
                    { id: 'a', text: '(?:...)' },
                    { id: 'b', text: '(?...)' },
                    { id: 'c', text: '[]' }
                ],
                explanation: '(?:pattern) группирует выражение, но не создает отдельный элемент в массиве результатов match/exec.',
                correctAnswer: 'a'
            },
            {
                id: 'q176_2',
                text: 'Что означает \\1 в регулярном выражении?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Экранирование единицы' },
                    { id: 'b', text: 'Обратная ссылка на первую запомненную группу', isCorrect: true }
                ],
                explanation: '\\1, \\2 и т.д. позволяют ссылаться на текст, который совпал в соответствующей группе, прямо внутри того же паттерна.'
            }
        ]
    },
    {
        id: '177',
        title: 'Lookarounds (177)',
        category: 'RegExp',
        questions: [
            {
                id: 'q177_1',
                text: 'Какой синтаксис используется для позитивной опережающей проверки (positive lookahead)?',
                type: 'single',
                options: [
                    { id: 'a', text: '(?=...)' },
                    { id: 'b', text: '(?!...)' },
                    { id: 'c', text: '(?<=...)' }
                ],
                explanation: 'x(?=y) означает "найти x, только если за ним следует y". Сам y в результат не входит.',
                correctAnswer: 'a'
            },
            {
                id: 'q177_2',
                text: 'Потребляют ли символы lookaround-проверки?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да, они становятся частью совпадения' },
                    { id: 'b', text: 'Нет, это проверки нулевой ширины (zero-width assertion)', isCorrect: true }
                ],
                explanation: 'Lookaround только проверяет наличие/отсутствие текста вокруг, но не включает его в итоговую строку совпадения.'
            }
        ]
    },
    {
        id: '178',
        title: 'RegExp Methods (178)',
        category: 'RegExp',
        questions: [
            {
                id: 'q178_1',
                text: 'Какой метод позволяет найти все совпадения вместе с группами захвата (итератор)?',
                type: 'input',
                correctAnswer: 'matchAll',
                explanation: 'str.matchAll(regexp) возвращает итератор по всем совпадениям, где каждое совпадение содержит полную информацию о группах.'
            },
            {
                id: 'q178_2',
                text: 'В чем отличие exec() от match() без флага g?',
                type: 'single',
                options: [
                    { id: 'a', text: 'exec() работает медленнее' },
                    { id: 'b', text: 'Они работают почти одинаково (возвращают первое совпадение с группами)', isCorrect: true }
                ],
                explanation: 'Без глобального флага match() возвращает тот же формат результата, что и exec(). Разница проявляется в основном с флагом g.'
            }
        ]
    },
    {
        id: '179',
        title: 'TypeScript Basics (179)',
        category: 'TypeScript',
        questions: [
            {
                id: 'q179_1',
                text: 'Какой тип безопаснее использовать для значения, о котором ничего не известно: any или unknown?',
                type: 'single',
                options: [
                    { id: 'a', text: 'any' },
                    { id: 'b', text: 'unknown', isCorrect: true }
                ],
                explanation: 'unknown запрещает произвольные операции с переменной до тех пор, пока тип не будет уточнен (сужен). any отключает все проверки.'
            },
            {
                id: 'q179_2',
                text: 'Что означает тип never?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Функция ничего не возвращает (undefined)' },
                    { id: 'b', text: 'Значений этого типа не существует (например, функция, выбрасывающая ошибку)', isCorrect: true }
                ],
                explanation: 'never используется для значений, которые никогда не могут произойти (бесконечный цикл, throw Error) или для исчерпывающих проверок.'
            }
        ]
    },
    {
        id: '180',
        title: 'TypeScript Interfaces (180)',
        category: 'TypeScript',
        questions: [
            {
                id: 'q180_1',
                text: 'Как сделать свойство интерфейса необязательным?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Добавить modifier optional' },
                    { id: 'b', text: 'Поставить знак вопроса после имени (prop?: type)', isCorrect: true }
                ],
                explanation: 'Знак вопроса (prop?: string) делает поле опциональным, то есть оно может быть undefined или отсутствовать.'
            },
            {
                id: 'q180_2',
                text: 'Можно ли расширять интерфейсы?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет, только типы (type)' },
                    { id: 'b', text: 'Да, с помощью ключевого слова extends', isCorrect: true }
                ],
                explanation: 'interface Admin extends User { ... } позволяет наследовать свойства другого интерфейса.'
            }
        ]
    },
    {
        id: '181',
        title: 'Type Guards (181)',
        category: 'TypeScript',
        questions: [
            {
                id: 'q181_1',
                text: 'Какой оператор позволяет проверить наличие свойства в объекте и использовать это как Type Guard?',
                type: 'single',
                options: [
                    { id: 'a', text: 'exists' },
                    { id: 'b', text: 'has' },
                    { id: 'c', text: 'in', isCorrect: true }
                ],
                explanation: 'Оператор "in" (if ("prop" in obj)) сужает тип, подтверждая наличие свойства в объекте.'
            },
            {
                id: 'q181_2',
                text: 'Как объявить пользовательский Type Guard (функцию-предикат)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'function isUser(a: any): boolean' },
                    { id: 'b', text: 'function isUser(a: any): a is User', isCorrect: true }
                ],
                explanation: 'Возвращаемый тип "arg is Type" сообщает компилятору, что если функция вернула true, то аргумент имеет указанный тип.'
            }
        ]
    },
    {
        id: '182',
        title: 'Utility Types (182)',
        category: 'TypeScript',
        questions: [
            {
                id: 'q182_1',
                text: 'Какой тип позволяет создать новый тип, выбрав только определенные поля из существующего?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Omit<T, K>' },
                    { id: 'b', text: 'Pick<T, K>', isCorrect: true },
                    { id: 'c', text: 'Partial<T>' }
                ],
                explanation: 'Pick<T, "id" | "name"> создает тип, содержащий только поля id и name из T.'
            },
            {
                id: 'q182_2',
                text: 'Что делает Partial<T>?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Делает все свойства обязательными' },
                    { id: 'b', text: 'Делает все свойства опциональными (undefined)', isCorrect: true }
                ],
                explanation: 'Partial<T> добавляет ? ко всем полям типа T.'
            }
        ]
    },
    {
        id: '183',
        title: 'Classes in TS (183)',
        category: 'TypeScript',
        questions: [
            {
                id: 'q183_1',
                text: 'Какой модификатор доступа делает свойство доступным только внутри класса и его наследников?',
                type: 'single',
                options: [
                    { id: 'a', text: 'private' },
                    { id: 'b', text: 'protected', isCorrect: true },
                    { id: 'c', text: 'public' }
                ],
                explanation: 'protected свойства видны в классе и подклассах, но скрыты от внешнего кода. private видны только в самом классе.'
            },
            {
                id: 'q183_2',
                text: 'Можно ли описать структуру класса через интерфейс?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет' },
                    { id: 'b', text: 'Да, используя implements', isCorrect: true }
                ],
                explanation: 'class User implements IUser { ... } обязывает класс реализовать все поля и методы интерфейса.'
            }
        ]
    },
    {
        id: '184',
        title: 'Functions in TS (184)',
        category: 'TypeScript',
        questions: [
            {
                id: 'q184_1',
                text: 'Как типизировать функцию, которая принимает переменное количество аргументов (rest)?',
                type: 'single',
                options: [
                    { id: 'a', text: '...args: any' },
                    { id: 'b', text: '...args: number[] (или другой массив)', isCorrect: true }
                ],
                explanation: 'Rest-параметры всегда должны быть типизированы как массив.'
            },
            {
                id: 'q184_2',
                text: 'Что такое перегрузка функции (overload)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Переопределение функции в наследнике' },
                    { id: 'b', text: 'Объявление нескольких сигнатур для одной функции', isCorrect: true }
                ],
                explanation: 'Можно написать несколько сигнатур перед реализацией, чтобы описать разные варианты использования функции.'
            }
        ]
    },
    {
        id: '185',
        title: 'Generics (185)',
        category: 'TypeScript',
        questions: [
            {
                id: 'q185_1',
                text: 'Зачем нужны дженерики (Generics)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Для ускорения компиляции' },
                    { id: 'b', text: 'Для создания переиспользуемых компонентов, работающих с разными типами данных без потери типизации', isCorrect: true }
                ],
                explanation: 'Дженерики позволяют сохранить информацию о типе аргумента и использовать её в возвращаемом значении.'
            },
            {
                id: 'q185_2',
                text: 'Как ограничить дженерик (constraint), чтобы он обязательно имел свойство length?',
                type: 'single',
                options: [
                    { id: 'a', text: '<T implements { length: number }>' },
                    { id: 'b', text: '<T extends { length: number }>', isCorrect: true }
                ],
                explanation: 'Ключевое слово extends в дженериках задает ограничение: тип T должен быть совместим с указанным интерфейсом.'
            }
        ]
    },
    {
        id: '186',
        title: 'Vue 3 Reactivity (186)',
        category: 'Vue.js Core',
        questions: [
            {
                id: 'q186_1',
                text: 'В чем главное отличие ref от reactive?',
                type: 'single',
                options: [
                    { id: 'a', text: 'reactive работает только с примитивами' },
                    { id: 'b', text: 'ref может хранить примитивы и требует доступа через .value, reactive работает только с объектами', isCorrect: true },
                    { id: 'c', text: 'ref не является реактивным' }
                ],
                explanation: 'ref создает реактивную обертку (.value) для любого типа. reactive работает только с объектами и возвращает прокси.'
            },
            {
                id: 'q186_2',
                text: 'Что произойдет, если деструктурировать объект, созданный через reactive (const { count } = state)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Ничего плохого, реактивность сохранится' },
                    { id: 'b', text: 'Реактивность потеряется для примитивных свойств', isCorrect: true }
                ],
                explanation: 'При деструктуризации мы вынимаем значение (например, number), которое теряет связь с Proxy. Нужно использовать toRefs.'
            }
        ]
    },
    {
        id: '187',
        title: 'Vue 3 Computed (187)',
        category: 'Vue.js Core',
        questions: [
            {
                id: 'q187_1',
                text: 'Когда пересчитывается computed свойство?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Каждый раз при обращении к нему' },
                    { id: 'b', text: 'Только когда изменяются его реактивные зависимости', isCorrect: true },
                    { id: 'c', text: 'Каждую секунду' }
                ],
                explanation: 'Computed свойства кешируются. Пересчет происходит только тогда, когда меняется одна из зависимостей, используемых внутри.'
            },
            {
                id: 'q187_2',
                text: 'Можно ли изменять computed свойство напрямую (count.value = 5)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да, всегда' },
                    { id: 'b', text: 'Только если у него определен сеттер (get/set)', isCorrect: true },
                    { id: 'c', text: 'Нет, это невозможно' }
                ],
                explanation: 'По умолчанию computed только для чтения. Для записи нужно передать объект с методами get и set.'
            }
        ]
    },
    {
        id: '188',
        title: 'Vue 3 Watchers (188)',
        category: 'Vue.js Core',
        questions: [
            {
                id: 'q188_1',
                text: 'Чем watchEffect отличается от watch?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Ничем, это алиасы' },
                    { id: 'b', text: 'watchEffect автоматически отслеживает зависимости и запускается сразу, watch ленив и требует явного указания источника', isCorrect: true }
                ],
                explanation: 'watchEffect запускает функцию немедленно и следит за всем, что в ней используется. watch ждет изменения конкретного источника.'
            },
            {
                id: 'q188_2',
                text: 'Как отслеживать изменения глубоко внутри объекта (nested properties) с помощью watch?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Это происходит автоматически' },
                    { id: 'b', text: 'Нужно добавить опцию { deep: true }', isCorrect: true }
                ],
                explanation: 'Для обычных объектов watch не видит вложенные изменения по умолчанию. Опция deep: true включает глубокое отслеживание (дорогостоящая операция).'
            }
        ]
    },
    {
        id: '189',
        title: 'Vue 3 Lifecycle (189)',
        category: 'Vue.js Core',
        questions: [
            {
                id: 'q189_1',
                text: 'Куда делись хуки created и beforeCreate в Composition API?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Они переименованы в onCreated' },
                    { id: 'b', text: 'Их заменяет сам код внутри setup() (или <script setup>)', isCorrect: true }
                ],
                explanation: 'Код внутри setup() выполняется на этапе инициализации компонента, что эквивалентно created/beforeCreate.'
            },
            {
                id: 'q189_2',
                text: 'В каком хуке DOM уже гарантированно существует и доступен?',
                type: 'single',
                options: [
                    { id: 'a', text: 'setup()' },
                    { id: 'b', text: 'onMounted', isCorrect: true },
                    { id: 'c', text: 'onUnmounted' }
                ],
                explanation: 'onMounted вызывается после того, как компонент был смонтирован в DOM.'
            }
        ]
    },
    {
        id: '190',
        title: 'Props & Emits (190)',
        category: 'Vue.js Core',
        questions: [
            {
                id: 'q190_1',
                text: 'Можно ли изменять props внутри дочернего компонента?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да, свободно' },
                    { id: 'b', text: 'Нет, props доступны только для чтения (one-way data flow)', isCorrect: true }
                ],
                explanation: 'Vue использует однонаправленный поток данных. Дочерний компонент не должен мутировать пропсы; вместо этого он должен порождать события (emit).'
            },
            {
                id: 'q190_2',
                text: 'Какой макрос используется в <script setup> для объявления событий?',
                type: 'single',
                options: [
                    { id: 'a', text: 'defineEvents' },
                    { id: 'b', text: 'defineEmits', isCorrect: true },
                    { id: 'c', text: 'emits' }
                ],
                explanation: 'const emit = defineEmits(["update", "close"]) позволяет типизировать и объявлять события.'
            }
        ]
    },
    {
        id: '191',
        title: 'Vue 3 Directives (191)',
        category: 'Vue.js Core',
        questions: [
            {
                id: 'q191_1',
                text: 'В чем отличие v-if от v-show?',
                type: 'single',
                options: [
                    { id: 'a', text: 'v-show удаляет элемент из DOM, v-if скрывает через CSS' },
                    { id: 'b', text: 'v-if реально уничтожает и пересоздает элементы (lazy), v-show только переключает display: none', isCorrect: true },
                    { id: 'c', text: 'v-show работает только с компонентами' }
                ],
                explanation: 'v-if имеет более высокие затраты на переключение, но низкие на начальный рендеринг. v-show наоборот.'
            },
            {
                id: 'q191_2',
                text: 'Почему обязательно использовать атрибут :key в v-for?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Чтобы элементы красиво анимировались' },
                    { id: 'b', text: 'Чтобы Vue мог корректно отслеживать идентичность узлов при обновлении списка (избегая лишних перерисовок)', isCorrect: true }
                ],
                explanation: 'Без key Vue использует алгоритм "diffing in-place", что может привести к багам состояния в дочерних компонентах.'
            }
        ]
    },
    {
        id: '192',
        title: 'Vue 3 Slots (192)',
        category: 'Vue.js Core',
        questions: [
            {
                id: 'q192_1',
                text: 'Что такое Scoped Slots (слоты с ограниченной областью видимости)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Слоты, которые видны только в родителе' },
                    { id: 'b', text: 'Механизм, позволяющий дочернему компоненту передавать данные обратно в слот родителя', isCorrect: true }
                ],
                explanation: 'Scoped slots позволяют родителю использовать данные, которые находятся внутри дочернего компонента (например, item в v-for).'
            },
            {
                id: 'q192_2',
                text: 'Как обратиться к именованному слоту "header" в шаблоне?',
                type: 'single',
                options: [
                    { id: 'a', text: '<slot name="header">' },
                    { id: 'b', text: '<template v-slot:header> (или #header)', isCorrect: true }
                ],
                explanation: 'Для передачи контента в именованный слот используется тег <template> с директивой v-slot или шорткат #.'
            }
        ]
    },
    {
        id: '193',
        title: 'Provide / Inject (193)',
        category: 'Vue.js Core',
        questions: [
            {
                id: 'q193_1',
                text: 'Какую проблему решает паттерн Provide / Inject?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Проблему утечки памяти' },
                    { id: 'b', text: 'Prop drilling (передача данных через множество промежуточных компонентов)', isCorrect: true }
                ],
                explanation: 'Provide позволяет передать данные глубоко вниз по дереву компонентов, минуя промежуточные слои.'
            },
            {
                id: 'q193_2',
                text: 'Будет ли значение, полученное через inject, реактивным?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет, это просто копия значения' },
                    { id: 'b', text: 'Да, если переданный объект был реактивным (ref или reactive)', isCorrect: true }
                ],
                explanation: 'Если provide передает ref или reactive объект, то в inject он останется реактивным, и изменения отразятся во всех компонентах.'
            }
        ]
    },
    {
        id: '194',
        title: 'Teleport (194)',
        category: 'Vue.js Components',
        questions: [
            {
                id: 'q194_1',
                text: 'Для чего используется компонент <Teleport>?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Для анимации переходов между страницами' },
                    { id: 'b', text: 'Для рендеринга части шаблона в другом месте DOM-дерева (например, в body)', isCorrect: true }
                ],
                explanation: 'Teleport полезен для модальных окон, тултипов и уведомлений, которые должны быть поверх всего интерфейса (z-index) и вне родительского overflow:hidden.'
            },
            {
                id: 'q194_2',
                text: 'Сохраняется ли родительский контекст (стили, инъекции) внутри Teleport?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Нет, это полностью изолированный кусок DOM' },
                    { id: 'b', text: 'Да, логически он остается частью компонента, меняется только место в DOM', isCorrect: true }
                ],
                explanation: 'Компонент внутри Teleport продолжает видеть пропсы, инджекты и контекст родителя, несмотря на перемещение в DOM.'
            }
        ]
    },
    {
        id: '195',
        title: 'Suspense (195)',
        category: 'Vue.js Components',
        questions: [
            {
                id: 'q195_1',
                text: 'Какую задачу решает компонент <Suspense>?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Кеширование компонентов (как KeepAlive)' },
                    { id: 'b', text: 'Отображение loading-состояния (fallback), пока загружаются вложенные асинхронные компоненты', isCorrect: true }
                ],
                explanation: 'Suspense ждет разрешения всех async setup() в дочерних компонентах и показывает слот #fallback до тех пор.'
            },
            {
                id: 'q195_2',
                text: 'Стабилен ли Suspense в Vue 3 (на 2024 год)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да, это основная фича' },
                    { id: 'b', text: 'Нет, он все еще имеет статус экспериментальной фичи', isCorrect: true }
                ],
                explanation: 'Хотя Suspense широко используется (особенно в Nuxt), официально в документации Vue он помечен как Experimental.'
            }
        ]
    },
    {
        id: '196',
        title: 'Vue Router Basics (196)',
        category: 'Vue.js Ecosystem',
        questions: [
            {
                id: 'q196_1',
                text: 'Какой компонент используется для отображения содержимого текущего маршрута?',
                type: 'single',
                options: [
                    { id: 'a', text: '<route-content>' },
                    { id: 'b', text: '<router-view>', isCorrect: true },
                    { id: 'c', text: '<router-outcome>' }
                ],
                explanation: '<router-view> — это плейсхолдер, куда Vue Router подставляет компонент, соответствующий текущему URL.'
            },
            {
                id: 'q196_2',
                text: 'Как определить динамический параметр в пути маршрута (например, ID пользователя)?',
                type: 'single',
                options: [
                    { id: 'a', text: '/user/{id}' },
                    { id: 'b', text: '/user/:id', isCorrect: true },
                    { id: 'c', text: '/user/$id' }
                ],
                explanation: 'Двоеточие (:id) обозначает динамический сегмент. Его значение будет доступно в route.params.id.'
            }
        ]
    },
    {
        id: '197',
        title: 'Vue Router Guards (197)',
        category: 'Vue.js Ecosystem',
        questions: [
            {
                id: 'q197_1',
                text: 'Какой навигационный хук позволяет отменить переход или перенаправить пользователя глобально?',
                type: 'single',
                options: [
                    { id: 'a', text: 'router.afterEach' },
                    { id: 'b', text: 'router.beforeEach', isCorrect: true }
                ],
                explanation: 'beforeEach вызывается перед каждым переходом. Если вернуть false или путь перенаправления, текущая навигация прервется.'
            },
            {
                id: 'q197_2',
                text: 'Что нужно вернуть из навигационного гарда, чтобы разрешить переход?',
                type: 'single',
                options: [
                    { id: 'a', text: 'true (или ничего/undefined)', isCorrect: true },
                    { id: 'b', text: 'next()' }
                ],
                explanation: 'В Vue Router 4 предпочтительно возвращать true или undefined (неявно). Использование next() для подтверждения перехода является устаревшим (хотя и поддерживается).'
            }
        ]
    },
    {
        id: '198',
        title: 'Pinia (198)',
        category: 'Vue.js Ecosystem',
        questions: [
            {
                id: 'q198_1',
                text: 'Нужны ли мутации (mutations) в Pinia?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Да, обязательно' },
                    { id: 'b', text: 'Нет, состояние можно менять напрямую или в actions', isCorrect: true }
                ],
                explanation: 'Pinia упростила архитектуру Vuex, убрав мутации. Теперь состояние изменяется прямо в actions или в компонентах.'
            },
            {
                id: 'q198_2',
                text: 'Как определяется хранилище (store) в Pinia?',
                type: 'single',
                options: [
                    { id: 'a', text: 'createStore()' },
                    { id: 'b', text: 'defineStore("id", { ... })', isCorrect: true }
                ],
                explanation: 'defineStore принимает уникальный ID и объект настроек (state, getters, actions) или setup-функцию.'
            }
        ]
    },
    {
        id: '199',
        title: 'Composables (199)',
        category: 'Vue.js Ecosystem',
        questions: [
            {
                id: 'q199_1',
                text: 'Что является принятытм соглашением наименования для Composition API функций (composables)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'create...' },
                    { id: 'b', text: 'use... (например, useMouse)', isCorrect: true },
                    { id: 'c', text: 'get...' }
                ],
                explanation: 'Префикс "use" сигнализирует, что функция является composable и может использовать другие реактивные хуки Vue.'
            },
            {
                id: 'q199_2',
                text: 'Какую проблему Mixins (миксинов) решают Composables?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Низкая производительность' },
                    { id: 'b', text: 'Неявное происхождение свойств (Name collisions & Implicit dependencies)', isCorrect: true }
                ],
                explanation: 'В миксинах непонятно, откуда пришло свойство, и возможны конфликты имен. Composables требуют явного импорта и деструктуризации, что делает поток данных прозрачным.'
            }
        ]
    },
    {
        id: '200',
        title: 'Vite & Tools (200)',
        category: 'Vue.js Ecosystem',
        questions: [
            {
                id: 'q200_1',
                text: 'Почему Vite запускает dev-server быстрее, чем Webpack?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Он написан на Rust' },
                    { id: 'b', text: 'Он использует Native ES Modules браузера, не собирая полный бандл при разработке', isCorrect: true }
                ],
                explanation: 'Vite (via esbuild) делает пре-бандлинг зависимостей, но исходный код отдает браузеру как нативные модули (ESM), трансформируя файлы по запросу.'
            },
            {
                id: 'q200_2',
                text: 'Какое расширение VS Code рекомендуется для Vue 3 вместо Vetur?',
                type: 'input',
                correctAnswer: 'Volar',
                explanation: 'Volar (ныне Vue - Official) обеспечивает полноценную поддержку TypeScript и проверки типов в шаблонах <script setup>.'
            }
        ]
    },
    {
        id: '201',
        title: 'Model-View-Controller (201)',
        category: 'Architecture',
        questions: [
            {
                id: 'q201_1',
                text: 'В чем ключевое отличие MVVM (Model-View-ViewModel) от классического MVC?',
                type: 'single',
                options: [
                    { id: 'a', text: 'MVVM не использует Модель' },
                    { id: 'b', text: 'В MVVM связывание данных (Data Binding) автоматизировано, ViewModel не управляет View напрямую', isCorrect: true }
                ],
                explanation: 'В MVC контроллер явно обновляет View. В MVVM (как в Vue/React) ViewModel (состояние) реактивно связано с View, и изменения отражаются автоматически.'
            },
            {
                id: 'q201_2',
                text: 'Какая часть MVC отвечает за бизнес-логику и данные?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Controller' },
                    { id: 'b', text: 'Model', isCorrect: true },
                    { id: 'c', text: 'View' }
                ],
                explanation: 'Model инкапсулирует данные и правила работы с ними. View только отображает, Controller обрабатывает ввод и обновляет Model.'
            }
        ]
    },
    {
        id: '202',
        title: 'Singleton Pattern (202)',
        category: 'Architecture',
        questions: [
            {
                id: 'q202_1',
                text: 'Для чего используется паттерн Одиночка (Singleton)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Для создания множества независимых объектов' },
                    { id: 'b', text: 'Для гарантии того, что класс имеет только один экземпляр и глобальную точку доступа к нему', isCorrect: true }
                ],
                explanation: 'Примеры Singleton: глобальный Store (Vuex/Pinia), сервис конфигурации, подключение к базе данных.'
            },
            {
                id: 'q202_2',
                text: 'Какой главный недостаток паттерна Singleton?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Сложность реализации' },
                    { id: 'b', text: 'Создание скрытых связей (global state), что усложняет тестирование и поддержку', isCorrect: true }
                ],
                explanation: 'Глобальное состояние делает компоненты зависимыми от внешнего контекста, что мешает модульному тестированию.'
            }
        ]
    },
    {
        id: '203',
        title: 'Observer Pattern (203)',
        category: 'Architecture',
        questions: [
            {
                id: 'q203_1',
                text: 'На каком паттерне основана реактивность Vue.js?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Factory' },
                    { id: 'b', text: 'Observer (Наблюдатель)', isCorrect: true },
                    { id: 'c', text: 'Strategy' }
                ],
                explanation: 'Компоненты (Observer) подписываются на изменения данных (Subject). Когда данные меняются, все подписчики уведомляются и перерисовываются.'
            },
            {
                id: 'q203_2',
                text: 'В чем разница между Observer и Pub/Sub?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Это одно и то же' },
                    { id: 'b', text: 'В Pub/Sub есть посредник (Broker/Event Bus), издатель не знает о подписчиках', isCorrect: true }
                ],
                explanation: 'В Observer субъект обычно хранит список наблюдателей. В Pub/Sub (как emit/on) компоненты общаются через канал событий, не зная друг о друге.'
            }
        ]
    },
    {
        id: '204',
        title: 'Factory Pattern (204)',
        category: 'Architecture',
        questions: [
            {
                id: 'q204_1',
                text: 'Какую проблему решает паттерн Фабрика (Factory Method)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Управление памятью' },
                    { id: 'b', text: 'Создание объектов, когда точный класс заранее неизвестен или логика создания сложна', isCorrect: true }
                ],
                explanation: 'Фабрика инкапсулирует логику создания (new), позволяя коду работать с абстрактным интерфейсом продукта, а не конкретными классами.'
            },
            {
                id: 'q204_2',
                text: 'Примером какого паттерна является `createElement` (h) во Vue?',
                type: 'input',
                correctAnswer: 'Factory',
                explanation: 'Функция h() (hyperscript) создает VNode. Мы не вызываем new VNode() напрямую, это делает фабричная функция.'
            }
        ]
    },
    {
        id: '205',
        title: 'SOLID Principles (205)',
        category: 'Architecture',
        questions: [
            {
                id: 'q205_1',
                text: 'Что означает принцип S (SRP) в аббревиатуре SOLID?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Simple Responsibility Principle (Принцип простоты)' },
                    { id: 'b', text: 'Single Responsibility Principle (Принцип единственной ответственности)', isCorrect: true }
                ],
                explanation: 'Класс или модуль должен иметь только одну причину для изменения (одну ответственность). В контексте UI: компонент делает одну вещь.'
            },
            {
                id: 'q205_2',
                text: 'Принцип O (Open/Closed) гласит, что программные сущности должны быть...',
                type: 'single',
                options: [
                    { id: 'a', text: 'Открыты для изменения, но закрыты для расширения' },
                    { id: 'b', text: 'Открыты для расширения, но закрыты для модификации', isCorrect: true }
                ],
                explanation: 'Мы должны иметь возможность добавлять новый функционал (расширять), не ломая и не переписывая существующий код (модифицировать).'
            }
        ]
    },
    {
        id: '206',
        title: 'Unit Testing (206)',
        category: 'Architecture',
        questions: [
            {
                id: 'q206_1',
                text: 'Какова главная цель Unit-тестирования?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Проверить работу всей системы целиком' },
                    { id: 'b', text: 'Изолированно проверить правильность работы минимальной единицы кода (функции, класса)', isCorrect: true }
                ],
                explanation: 'Unit-тесты должны быть быстрыми, изолированными и не зависеть от внешних сервисов (БД, сеть).'
            },
            {
                id: 'q206_2',
                text: 'Что такое "Code Coverage"?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Количество строк кода в проекте' },
                    { id: 'b', text: 'Метрика, показывающая процент кода, который был выполнен в ходе прогона тестов', isCorrect: true }
                ],
                explanation: 'Покрытие кода помогает найти не протестированные ветки логики, но 100% покрытие не гарантирует отсутствие багов.'
            }
        ]
    },
    {
        id: '207',
        title: 'TDD (Test Driven Development) (207)',
        category: 'Architecture',
        questions: [
            {
                id: 'q207_1',
                text: 'Какой порядок действий правильный в цикле TDD?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Code -> Test -> Refactor' },
                    { id: 'b', text: 'Red (написать тест) -> Green (написать код) -> Refactor (улучшить)', isCorrect: true }
                ],
                explanation: 'Сначала пишется падающий тест (Red), затем минимальный код для его прохождения (Green), потом код улучшается (Refactor).'
            },
            {
                id: 'q207_2',
                text: 'Главное преимущество TDD?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Скорость написания первого прототипа' },
                    { id: 'b', text: 'Уверенность в коде, отсутствие страха рефакторинга и документация в виде тестов', isCorrect: true }
                ],
                explanation: 'TDD заставляет писать тестируемый код (loose coupling) и гарантирует, что любое изменение не сломает старый функционал.'
            }
        ]
    },
    {
        id: '208',
        title: 'E2E Testing (208)',
        category: 'Architecture',
        questions: [
            {
                id: 'q208_1',
                text: 'Что тестируют E2E (End-to-End) тесты?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Только API сервера' },
                    { id: 'b', text: 'Работу приложения с точки зрения реального пользователя (от клика до результата в БД)', isCorrect: true }
                ],
                explanation: 'E2E тесты (Cypress, Playwright) запускают настоящий браузер и эмулируют поведение пользователя.'
            },
            {
                id: 'q208_2',
                text: 'Почему E2E тестов обычно меньше, чем Unit тестов?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Они сложнее пишутся и дольше выполняются' },
                    { id: 'b', text: 'Они менее надежны' },
                    { id: 'c', text: 'Все варианты верны', isCorrect: true }
                ],
                explanation: 'Согласно "пирамиде тестирования", медленных E2E тестов должно быть мало (верхушка), а быстрых Unit тестов - много (основание).'
            }
        ]
    },
    {
        id: '209',
        title: 'Snapshot Testing (209)',
        category: 'Architecture',
        questions: [
            {
                id: 'q209_1',
                text: 'Что такое Snapshot-тест UI компонента?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Скриншот экрана в PNG' },
                    { id: 'b', text: 'Сравнение сериализованного HTML-дерева компонента с сохраненным ранее эталоном', isCorrect: true }
                ],
                explanation: 'Если разметка изменилась (даже пробел), тест упадет. Это защищает от непреднамеренных визуальных изменений.'
            },
            {
                id: 'q209_2',
                text: 'Если Snapshot-тест упал из-за намеренного изменения дизайна, что нужно сделать?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Отключить тест' },
                    { id: 'b', text: 'Обновить снэпшот (update snapshots)', isCorrect: true }
                ],
                explanation: 'Нужно подтвердить, что изменения ожидаемы, запустив команду обновления теста (обычно -u).'
            }
        ]
    },
    {
        id: '210',
        title: 'Mocking (210)',
        category: 'Architecture',
        questions: [
            {
                id: 'q210_1',
                text: 'Чем Mock отличается от Stub?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Mock проверяет поведение (вызвана ли функция?), а Stub просто возвращает данные', isCorrect: true },
                    { id: 'b', text: 'Ничем, это синонимы' }
                ],
                explanation: 'Stub (заглушка) просто отдает заготовленный ответ. Mock (имитация) умеет проверять, как именно его использовали (с какими аргументами).'
            },
            {
                id: 'q210_2',
                text: 'Зачем мы мокаем API запросы в Unit тестах?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Потому что у CI/CD нет интернета' },
                    { id: 'b', text: 'Чтобы изолировать тест от проблем сети и бэкенда, обеспечив стабильность и скорость', isCorrect: true }
                ],
                explanation: 'Unit-тест фронтенда должен проверять логику фронтенда, а не работу сервера. Для проверки интеграции есть E2E.'
            }
        ]
    },
    {
        id: '211',
        title: 'Critical Rendering Path (211)',
        category: 'Performance',
        questions: [
            {
                id: 'q211_1',
                text: 'Какова правильная последовательность этапов рендеринга страницы?',
                type: 'single',
                options: [
                    { id: 'a', text: 'HTML -> Paint -> Layout' },
                    { id: 'b', text: 'DOM + CSSOM -> Render Tree -> Layout -> Paint', isCorrect: true },
                    { id: 'c', text: 'DOM -> Layout -> CSSOM -> Paint' }
                ],
                explanation: 'Браузер сначала строит DOM и CSSOM, объединяет их в Render Tree (исключая display:none), затем рассчитывает геометрию (Layout) и рисует (Paint).'
            },
            {
                id: 'q211_2',
                text: 'Что блокирует рендеринг страницы (Render Blocking Resources)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Изображения <img>' },
                    { id: 'b', text: 'Скрипты <script> (без async/defer) и стили <link rel="stylesheet">', isCorrect: true }
                ],
                explanation: 'Браузер останавливает парсинг HTML, когда встречает скрипт, и ждет загрузки CSSOM, чтобы правильно отрисовать контент.'
            }
        ]
    },
    {
        id: '212',
        title: 'Reflow vs Repaint (212)',
        category: 'Performance',
        questions: [
            {
                id: 'q212_1',
                text: 'Что "дороже" для производительности?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Repaint (Перерисовка)' },
                    { id: 'b', text: 'Reflow (Перекомпоновка)', isCorrect: true }
                ],
                explanation: 'Reflow (Layout) требует пересчета геометрии всех элементов. Repaint просто меняет пиксели (цвет) без изменения размера/позиции.'
            },
            {
                id: 'q212_2',
                text: 'Какие CSS свойство наиболее производительны для анимации (вызывают только Composite, без Layout/Paint)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'width, height, top, left' },
                    { id: 'b', text: 'transform и opacity', isCorrect: true }
                ],
                explanation: 'transform и opacity могут обрабатываться GPU на отдельном слое (Composite), минуя этапы Layout и Paint главного потока.'
            }
        ]
    },
    {
        id: '213',
        title: 'Debounce vs Throttle (213)',
        category: 'Performance',
        questions: [
            {
                id: 'q213_1',
                text: 'Какая техника лучше подходит для поиска (Suggest) при вводе текста, чтобы не слать запрос на каждую букву?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Throttle' },
                    { id: 'b', text: 'Debounce', isCorrect: true }
                ],
                explanation: 'Debounce откладывает вызов функции до тех пор, пока пользователь не перестанет печатать (пауза в вводе).'
            },
            {
                id: 'q213_2',
                text: 'Какая техника лучше подходит для обработчика скролла (например, infinite scroll)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Throttle', isCorrect: true },
                    { id: 'b', text: 'Debounce' }
                ],
                explanation: 'Throttle гарантирует выполнение функции не чаще, чем раз в N миллисекунд, обеспечивая плавную (регулярную) проверку, пока пользователь скроллит.'
            }
        ]
    },
    {
        id: '214',
        title: 'Lazy Loading (214)',
        category: 'Performance',
        questions: [
            {
                id: 'q214_1',
                text: 'Какой нативный API лучше всего использовать для "ленивой" загрузки изображений при скролле?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Scroll Event Listener' },
                    { id: 'b', text: 'Intersection Observer API', isCorrect: true }
                ],
                explanation: 'Intersection Observer позволяет асинхронно следить за появлением элемента во viewport без постоянных (дорогих) проверок в событии scroll.'
            },
            {
                id: 'q214_2',
                text: 'Что такое Code Splitting?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Разделение CSS и JS' },
                    { id: 'b', text: 'Разбиение JS-бандла на части (chunks), которые загружаются по требованию', isCorrect: true }
                ],
                explanation: 'Это позволяет уменьшить размер начального бандла, загружая код страницы/библиотеки только тогда, когда она действительно нужна.'
            }
        ]
    },
    {
        id: '215',
        title: 'Memory Leaks (215)',
        category: 'Performance',
        questions: [
            {
                id: 'q215_1',
                text: 'Что такое Detached DOM nodes?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Элементы в Shadow DOM' },
                    { id: 'b', text: 'Элементы, удаленные из DOM, но на которые сохранилась ссылка в JavaScript', isCorrect: true }
                ],
                explanation: 'Пока есть JS-ссылка на элемент, сборщик мусора не может удалить его из памяти, даже если он уже не отображается на странице.'
            },
            {
                id: 'q215_2',
                text: 'Почему замыкания (closures) часто приводят к утечкам памяти?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Они создают слишком много функций' },
                    { id: 'b', text: 'Они могут удерживать ссылки на большие объекты из внешней области видимости дольше, чем нужно', isCorrect: true }
                ],
                explanation: 'Если замыкание используется в долгоживущем объекте (например, обработчик события), то весь его лексический контекст также остается в памяти.'
            }
        ]
    },
    {
        id: '216',
        title: 'XSS (Cross-Site Scripting) (216)',
        category: 'Security',
        questions: [
            {
                id: 'q216_1',
                text: 'Какой тип XSS атаки происходит, когда вредоносный скрипт сохраняется в базе данных сервера и отдается всем пользователям?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Reflected XSS' },
                    { id: 'b', text: 'Stored (Persistent) XSS', isCorrect: true },
                    { id: 'c', text: 'DOM-based XSS' }
                ],
                explanation: 'Stored XSS самая опасная, так как атакующий внедряет код один раз (например, в комментарий), а жертвами становятся все посетители страницы.'
            },
            {
                id: 'q216_2',
                text: 'Почему использование `v-html` (или `dangerouslySetInnerHTML`) опасно?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Это замедляет рендеринг' },
                    { id: 'b', text: 'Это открывает уязвимость для XSS, если данные не были предварительно очищены (sanitized)', isCorrect: true }
                ],
                explanation: 'Рендеринг сырого HTML позволяет злоумышленнику внедрить теги <script> или обработчики событий (onload/onerror).'
            }
        ]
    },
    {
        id: '217',
        title: 'CSRF (Cross-Site Request Forgery) (217)',
        category: 'Security',
        questions: [
            {
                id: 'q217_1',
                text: 'Как работает CSRF атака?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Атакующий крадет пароль пользователя' },
                    { id: 'b', text: 'Атакующий заставляет браузер жертвы выполнить нежелательный запрос на доверенный сайт (используя сохраненные куки)', isCorrect: true }
                ],
                explanation: 'Если пользователь залогинен в банке, и зайдет на вредоносный сайт, тот может отправить скрытую форму перевода денег, и браузер автоматически прикрепит куки банка.'
            },
            {
                id: 'q217_2',
                text: 'Какой атрибут Cookie помогает защититься от CSRF?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Secure' },
                    { id: 'b', text: 'SameSite (Strict или Lax)', isCorrect: true },
                    { id: 'c', text: 'HttpOnly' }
                ],
                explanation: 'SameSite=Lax/Strict запрещает браузеру отправлять куки при кросс-доменных запросах (с чужого сайта), что ломает механизм CSRF.'
            }
        ]
    },
    {
        id: '218',
        title: 'CSP (Content Security Policy) (218)',
        category: 'Security',
        questions: [
            {
                id: 'q218_1',
                text: 'Что делает заголовок Content-Security-Policy (CSP)?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Шифрует трафик' },
                    { id: 'b', text: 'Ограничивает источники, откуда браузеру разрешено загружать ресурсы (скрипты, стили, картинки)', isCorrect: true }
                ],
                explanation: 'CSP — это белый список источников. Он может запретить выполнение инлайн-скриптов и загрузку кода с чужих доменов, предотвращая XSS.'
            },
            {
                id: 'q218_2',
                text: 'Если CSP настроен как `script-src \`self\``, что произойдет с `<script>alert(1)</script>`?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Скрипт выполнится' },
                    { id: 'b', text: 'Браузер заблокирует выполнение скрипта, так как инлайн-скрипты запрещены по умолчанию', isCorrect: true }
                ],
                explanation: 'Для разрешения инлайн-скриптов нужно добавить `unsafe-inline` (не рекомендуется) или использовать nonce/hash.'
            }
        ]
    },
    {
        id: '219',
        title: 'Storage Security (219)',
        category: 'Security',
        questions: [
            {
                id: 'q219_1',
                text: 'Где безопаснее хранить JWT токены для защиты от XSS кражи?',
                type: 'single',
                options: [
                    { id: 'a', text: 'LocalStorage' },
                    { id: 'b', text: 'HttpOnly Cookies', isCorrect: true }
                ],
                explanation: 'JavaScript не имеет доступа к HttpOnly кукам, поэтому даже при наличии XSS уязвимости атакующий не сможет прочитать (украсть) токен.'
            },
            {
                id: 'q219_2',
                text: 'В чем уязвимость хранения чувствительных данных в LocalStorage?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Ограниченный объем памяти' },
                    { id: 'b', text: 'Любой JS код на странице (включая вредоносный) может прочитать всё содержимое LocalStorage', isCorrect: true }
                ],
                explanation: 'LocalStorage не имеет защиты от чтения, в отличие от Cookies с флагом HttpOnly.'
            }
        ]
    },
    {
        id: '220',
        title: 'HTTPS & MITM (220)',
        category: 'Security',
        questions: [
            {
                id: 'q220_1',
                text: 'От какой атаки защищает HTTPS?',
                type: 'single',
                options: [
                    { id: 'a', text: 'XSS' },
                    { id: 'b', text: 'Man-in-the-Middle (MITM)', isCorrect: true },
                    { id: 'c', text: 'DDoS' }
                ],
                explanation: 'HTTPS шифрует трафик между клиентом и сервером. Атакующий "посередине" видит только зашифрованные данные и не может их прочитать или подменить.'
            },
            {
                id: 'q220_2',
                text: 'Что такое Mixed Content?',
                type: 'single',
                options: [
                    { id: 'a', text: 'Смесь текста и картинок' },
                    { id: 'b', text: 'Загрузка ресурса по HTTP на странице, открытой по HTTPS', isCorrect: true }
                ],
                explanation: 'Браузеры блокируют "активный" смешанный контент (скрипты, iframe), так как он компрометирует безопасность всей защищенной страницы.'
            }
        ]
    }
];
