// Utility: Levenshtein distance (fuzzy match threshold)
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Map of skills → synonyms/related terms
const SKILL_RULES = {
  "TypeScript": ["typescript", "type script", "ts"],
  "AWS": ["aws", "amazon web services", "ec2", "lambda", "s3"],
  "React": ["react", "reactjs", "react.js"],
  "Node.js": ["node.js", "node", "express"],
  "CI/CD": ["ci", "cd", "devops", "github actions", "jenkins", "ci-cd"],
  "Agile": ["agile", "scrum", "kanban", "sprint"]
};

// Highlight matched terms
function highlightMatchedTerms(textRoot, terms) {
  const walker = document.createTreeWalker(textRoot, NodeFilter.SHOW_TEXT);
  const matches = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (!parent || parent.closest("script, style")) continue;

    const originalText = node.textContent;
    let newHTML = originalText;

    for (const term of terms) {
      const regex = new RegExp(`\\b(${term})\\b`, 'gi');
      if (regex.test(newHTML)) {
        newHTML = newHTML.replace(regex, '<mark style="background:yellow;">$1</mark>');
      }
    }

    if (newHTML !== originalText) {
      const temp = document.createElement("span");
      temp.innerHTML = newHTML;
      parent.replaceChild(temp, node);
    }
  }
}

// Normalize & fuzzy-match description against skills
function findMatchedSkills(text) {
  const lowerText = text.toLowerCase();
  const matched = new Set();

  for (const [skill, keywords] of Object.entries(SKILL_RULES)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(lowerText)) {
        matched.add(skill);
        break;
      }

      // Fuzzy match fallback
      const words = lowerText.split(/\s+/);
      for (const word of words) {
        if (levenshtein(word, keyword) <= 2 && keyword.length > 3) {
          matched.add(skill);
          break;
        }
      }
    }
  }

  return Array.from(matched);
}

function extractJobInfo() {
  const jobTitleEl = document.querySelector('h1[data-automation="job-detail-title"]');
  const companyNameEl = document.querySelector('span[data-automation="advertiser-name"]');
  const text = document.body.innerText;

  const matchedSkills = findMatchedSkills(text);

  // Highlight those terms
  const highlightTerms = Object.values(SKILL_RULES).flat();
  highlightMatchedTerms(document.body, highlightTerms);

  return {
    jobTitle: jobTitleEl?.innerText || "",
    companyName: companyNameEl?.innerText || "",
    matchedSkills
  };
}

chrome.runtime.onMessage.addListener((req, _, sendResponse) => {
  if (req.action === "getJobInfo") {
    sendResponse(extractJobInfo());
  }
});
