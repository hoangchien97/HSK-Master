const fs = require('fs');

// Check HSK2 example quality
const d = JSON.parse(fs.readFileSync('./prisma/hsk_vocab_exports/vocabulary_hsk2.json', 'utf8'));

// Count template-like examples
const templates = [
  '请你注意',
  '我学会了',
  '这个词',
  '的用法',
  '是一个常用词',
];

let templateCount = 0;
let goodCount = 0;

d.forEach(v => {
  const ex = v.example_sentence || '';
  const isTemplate = templates.some(t => ex.includes(t));
  if (isTemplate) {
    templateCount++;
    console.log(`  TEMPLATE: ${v.chinese_word} (${v.pinyin}) → ${ex}`);
  } else {
    goodCount++;
  }
});

console.log(`\nHSK2: ${templateCount} template examples, ${goodCount} good examples out of ${d.length}`);

// Also check HSK3 sample
console.log('\n--- HSK3 Sample (first 10) ---');
const d3 = JSON.parse(fs.readFileSync('./prisma/hsk_vocab_exports/vocabulary_hsk3.json', 'utf8'));
d3.slice(0, 10).forEach(v => {
  console.log(`  ${v.chinese_word} (${v.pinyin}): ${v.example_sentence}`);
});

// Check HSK4 sample
console.log('\n--- HSK4 Sample (first 10) ---');
const d4 = JSON.parse(fs.readFileSync('./prisma/hsk_vocab_exports/vocabulary_hsk4.json', 'utf8'));
d4.slice(0, 10).forEach(v => {
  console.log(`  ${v.chinese_word} (${v.pinyin}): ${v.example_sentence}`);
});
