import fs from 'fs';

try {
    const rawData = fs.readFileSync('questions_dump.json', 'utf8');
    const questions = JSON.parse(rawData);

    // Group by category
    const categories = {};
    questions.forEach(q => {
        if (!categories[q.category]) {
            categories[q.category] = [];
        }
        categories[q.category].push(q);
    });

    let report = '# Question Categorization Analysis\n\n';

    // Sort categories alphabetically
    const sortedCategories = Object.keys(categories).sort();

    sortedCategories.forEach(cat => {
        report += `## ${cat} (${categories[cat].length})\n`;
        categories[cat].forEach(q => {
            report += `- [${q.id}] ${q.title}\n`;
        });
        report += '\n';
    });

    fs.writeFileSync('categorization_analysis.md', report);
    console.log('Report generated: categorization_analysis.md');

} catch (e) {
    console.error('Error:', e);
}
