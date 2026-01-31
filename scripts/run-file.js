// Usage: node scripts/run-file.js <input.txt> <output.txt>
// Reads transaction descriptions (one per line) and writes: "description\t----> Category"

const fs = require('fs');
const path = require('path');
const { categorizeTransaction } = require('../src/categorizeTransaction');
let ai;
try {
  ai = require('../src/aiFallback');
} catch (_) {
  ai = null;
}

function printUsageAndExit() {
  console.error('Usage: node scripts/run-file.js <input.txt> <output.txt>');
  process.exit(1);
}

async function processLine(line) {
  const first = categorizeTransaction(line);
  if (first && first !== 'Others') return first;
  if (!process.env.GEMINI_API_KEY || !ai) return 'Others';
  return await ai.aiClassify(line);
}

async function main() {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    printUsageAndExit();
  }

  const absIn = path.resolve(inputPath);
  const absOut = path.resolve(outputPath);

  if (!fs.existsSync(absIn)) {
    console.error(`Input file not found: ${absIn}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(absIn, 'utf8');
  const lines = raw.split(/\r?\n/);

  const outLines = [];
  for (const line of lines) {
    const category = await processLine(line);
    outLines.push(`${line}\t----> ${category}`);
  }

  fs.writeFileSync(absOut, outLines.join('\n'), 'utf8');
}

// Run async
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
