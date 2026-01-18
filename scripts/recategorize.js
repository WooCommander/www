
import fs from 'fs';

const mapping = {
    // JavaScript Core
    100: 'JavaScript Core', 103: 'JavaScript Core', 106: 'JavaScript Core', 107: 'JavaScript Core',
    108: 'JavaScript Core', 109: 'JavaScript Core', 157: 'JavaScript Core', 161: 'JavaScript Core',
    165: 'JavaScript Core',

    // Types & Variables
    101: 'Types & Variables', 102: 'Types & Variables', 104: 'Types & Variables', 118: 'Types & Variables',
    119: 'Types & Variables', 120: 'Types & Variables', 129: 'Types & Variables',

    // Functions
    105: 'Functions', 110: 'Functions', 114: 'Functions', 115: 'Functions', 131: 'Functions',
    132: 'Functions', 133: 'Functions', 136: 'Functions', 137: 'Functions', 138: 'Functions',
    139: 'Functions', 158: 'Functions', 159: 'Functions',

    // Objects & Classes
    111: 'Objects & Classes', 112: 'Objects & Classes', 113: 'Objects & Classes', 116: 'Objects & Classes',
    117: 'Objects & Classes', 127: 'Objects & Classes', 134: 'Objects & Classes', 135: 'Objects & Classes',
    146: 'Objects & Classes', 147: 'Objects & Classes', 148: 'Objects & Classes', 149: 'Objects & Classes',
    150: 'Objects & Classes', 151: 'Objects & Classes', 152: 'Objects & Classes', 153: 'Objects & Classes',
    154: 'Objects & Classes', 155: 'Objects & Classes', 156: 'Objects & Classes', 162: 'Objects & Classes',
    185: 'Objects & Classes',

    // Arrays & Collections
    121: 'Arrays & Collections', 122: 'Arrays & Collections', 123: 'Arrays & Collections',
    124: 'Arrays & Collections', 125: 'Arrays & Collections', 126: 'Arrays & Collections',
    128: 'Arrays & Collections', 130: 'Arrays & Collections',

    // DOM & Events
    140: 'DOM & Events', 141: 'DOM & Events', 142: 'DOM & Events', 143: 'DOM & Events',
    144: 'DOM & Events', 145: 'DOM & Events', 163: 'DOM & Events', 164: 'DOM & Events',

    // Network & Storage
    160: 'JavaScript Core', // Async generators fit better in JS Core or Functions, but let's put generic async stuff
    167: 'Network & Storage', 169: 'Network & Storage', 170: 'Network & Storage',
    171: 'Network & Storage', 172: 'Network & Storage', 173: 'Network & Storage',

    // RegExp
    174: 'RegExp', 175: 'RegExp', 176: 'RegExp', 177: 'RegExp', 178: 'RegExp', 179: 'RegExp',
    180: 'RegExp',

    // TypeScript
    181: 'TypeScript', 182: 'TypeScript', 183: 'TypeScript', 184: 'TypeScript',
    186: 'TypeScript', 187: 'TypeScript',

    // Browser API
    166: 'Browser API', 168: 'Browser API'
};

// Fix Async/General mapping adjustment
mapping[160] = 'Functions'; // Async Generators -> Functions

try {
    const questions = JSON.parse(fs.readFileSync('questions_dump.json', 'utf8'));
    let updatedCount = 0;

    questions.forEach(q => {
        if (mapping[q.id]) {
            if (q.category !== mapping[q.id]) {
                q.category = mapping[q.id];
                updatedCount++;
            }
        }
    });

    fs.writeFileSync('questions_dump.json', JSON.stringify(questions, null, 2));
    console.log(`Updated ${updatedCount} questions.`);
} catch (e) {
    console.error(e);
}
