// Simple, explainable keyword-based categorizer
// Returns one of: Food, Transport, Shopping, Utilities, Subscription, Insurance, Others


const CATEGORY_KEYWORDS = [
  {
    category: "Food",
    keywords: [
      "swiggy",
      "zomato",
      "uber eats",
      "ubereats",
      "restaurant",
      "cafe",
      "dominos",
      "kfc",
      "mcdonalds",
      "starbucks",
      "pizza",
      "burger",
      "food",
      "Blinkit"
    ]
  },
  {
    category: "Transport",
    keywords: [
      "uber",
      "ola",
      "lyft",
      "metro",
      "bus",
      "train",
      "cab",
      "taxi",
      "toll",
      "parking",
      "fuel",
      "petrol",
      "diesel"
    ]
  },
  {
    category: "Subscription",
    keywords: [
      "netflix",
      "spotify",
      "prime",
      "amazon prime",
      "hotstar",
      "disney+",
      "youtube premium",
      "apple music",
      "apple tv",
      "audible",
      "zee5",
      "sonyliv",
      "sony liv",
      "subscription",
      "membership"
    ]
  },
  {
    category: "Shopping",
    keywords: [
      "amazon",
      "flipkart",
      "myntra",
      "walmart",
      "target",
      "mall",
      "store",
      "shop",
      "retail",
      "messika",
      "grocery"
    ]
  },
  {
    category: "Utilities",
    keywords: [
      "electricity",
      "water bill",
      "water",
      "gas bill",
      "internet",
      "broadband",
      "wifi",
      "Recharge",
      "utility",
      "power",
      "mobile bill",
      "postpaid",
      "prepaid recharge",
      "recharge",
      "landline",
      "dth"
    ]
  },
  
  {
    category: "Insurance",
    keywords: [
      "insurance",
      "premium",
      "lic",
      "policy",
      "mediclaim",
      "term plan",
      "hdfc ergo",
      "bajaj allianz"
    ]
  }
];


function normalize(text) {
  if (typeof text !== "string") return "";
  const lower = text.toLowerCase();
  // Replace common separators with spaces, collapse whitespace
  return lower
    .replace(/[\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function categorizeTransaction(description) {
  const text = normalize(description);
  if (!text) return "Others";

  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => text.includes(kw))) {
      return category;
    }
  }

  // Fuzzy match stage: handle common misspellings (e.g., "swigy" -> "swiggy", "ubr" -> "uber")
  const words = text
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  }

  function isFuzzyMatch(token, keyword) {
    const a = token;
    const b = keyword;
    if (!a || !b) return false;
    const dist = levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length);
    if (maxLen <= 3) return dist <= 1; // tiny words: 1 edit
    if (maxLen <= 6) return dist <= 2; // short words: up to 2 edits
    return dist / maxLen <= 0.3; // longer words: <=30% edits
  }

  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    for (const kw of keywords) {
      const kwParts = kw.split(/\s+/);
      // Any token close to any keyword part is a match
      if (kwParts.some((part) => words.some((w) => isFuzzyMatch(w, part)))) {
        return category;
      }
    }
  }


  return "Others";
}

module.exports = { categorizeTransaction };
