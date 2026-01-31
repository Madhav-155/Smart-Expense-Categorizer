# Smart Expense Categorizer

A simple, explainable, keyword-based function to categorize unstructured bank transaction descriptions into one of:

- Food
- Transport
- Shopping
- Utilities
- Subscription
- Insurance
- Others

## Approach

- Normalize description to lowercase and collapse whitespace.
- Sequentially scan category-specific keyword lists.
- Return the first matching category; otherwise return `Others`.

This is deterministic, easy to extend, and suitable for early-stage backend utilities.

## Assumptions

- Matching is case-insensitive.
- Presence of a keyword implies the category.
- On multiple matches, the first category in the defined order wins.
- Empty/invalid input returns `Others`.

## File Structure

- `src/categorizeTransaction.js` — categorization logic (keywords + fuzzy matching)
- `src/aiFallback.js` — optional Gemini fallback
- `scripts/run-file.js` — file-based runner (reads input.txt, writes output.txt)
- `package.json` — npm scripts and dependencies

## Usage

Install prerequisites: Node.js (no packages required).

### Flow

1) Keyword match (case-insensitive)

2) Fuzzy match to handle common misspellings (e.g., "swigy" → "swiggy", "ubr" → "uber")

3) Optional Gemini fallback (only if `GEMINI_API_KEY` is set).

If none of the above match with confidence, returns `Others`.

### File-based I/O

Process descriptions from a text file and write results to another file. Input should contain one transaction description per line. Output will be in the form: `description\t----> Category`.

Run with the provided sample files:

```bash
npm run file:run
```

Or specify custom paths:

```bash
node scripts/run-file.js path/to/input.txt path/to/output.txt
```

Example output:

```
Swiggy order #2391	----> Food
Uber trip Jan 12	----> Transport
LIC premium paid	----> Insurance
```

### Optional: Gemini AI fallback
- Set `GEMINI_API_KEY` in your environment to enable a second-opinion classifier via Gemini when the keyword/fuzzy pass returns `Others`.
- The runner will then query Gemini to pick exactly one of: Food, Transport, Shopping, Utilities, Subscription, Insurance, Others. If Gemini also returns Others (or the call fails), the result stays `Others`.

Windows PowerShell example:

```powershell
$env:GEMINI_API_KEY = "<your-api-key>"
npm run file:run
```

Note: If you prefer a `.env` file, run with the Node dotenv preloader:

```powershell
node -r dotenv/config scripts/run-file.js input.txt output.txt
```

## Example

```js
const { categorizeTransaction } = require('./src/categorizeTransaction');

console.log(categorizeTransaction('Swiggy order #2391')); // Food
console.log(categorizeTransaction('Uber trip Jan 12'));   // Transport
console.log(categorizeTransaction('LIC premium paid'));   // Insurance
```

## Extending

Add keywords to the `CATEGORY_KEYWORDS` list in `src/categorizeTransaction.js` to improve coverage. Keep keywords specific to avoid false positives (e.g., prefer `gas bill` under Utilities rather than generic `gas`). Misspellings are handled by fuzzy matching, but precise keywords give more reliable results.
