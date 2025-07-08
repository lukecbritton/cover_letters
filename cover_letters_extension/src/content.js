const SKILL_RULES = {
  "TypeScript": {
    synonyms: ["typescript", "ts", "type script"],
    weight: 10,
    color: "#ffd54f"
  },
  "AWS": {
    synonyms: ["aws", "ec2", "lambda", "s3", "amazon web services"],
    weight: 10,
    color: "#a5d6a7"
  },
  "React": {
    synonyms: ["react", "reactjs", "react.js"],
    weight: 9,
    color: "#90caf9"
  },
  "Node.js": {
    synonyms: ["node", "nodejs", "express"],
    weight: 8,
    color: "#ce93d8"
  },
  "CI/CD": {
    synonyms: ["ci", "cd", "ci-cd", "github actions", "jenkins"],
    weight: 6,
    color: "#ffab91"
  },
  "Agile": {
    synonyms: ["agile", "scrum", "sprints", "kanban"],
    weight: 5,
    color: "#b0bec5"
  }
};

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

// Normalize & fuzzy-match description against skills
function findMatchedSkills(text) {
  const lowerText = text.toLowerCase();
  const matched = new Set();

  for (const [skill, config] of Object.entries(SKILL_RULES)) {
    const allTerms = [skill, ...config.synonyms];
    for (const term of allTerms) {
      if (lowerText.includes(term.toLowerCase())) {
        matched.add(skill);
        break;
      }

      for (const word of lowerText.split(/\s+/)) {
        if (levenshtein(word, term.toLowerCase()) <= 2 && term.length > 3) {
          matched.add(skill);
          break;
        }
      }
    }
  }

  return Array.from(matched);
}

function highlightMatchedTerms(root, skillRules) {
  const flatTerms = [];

  for (const [skill, { synonyms, color }] of Object.entries(skillRules)) {
    const terms = [skill, ...synonyms];
    for (const term of terms) {
      flatTerms.push({ term, skill, color });
    }
  }

  const termRegex = new RegExp(
    `\\b(${flatTerms.map(t => t.term).sort((a, b) => b.length - a.length).join("|")})\\b`,
    "gi"
  );

  function wrapMatchesInNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const originalText = node.nodeValue;
      const matches = [...originalText.matchAll(termRegex)];

      if (!matches.length) return;

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;

      for (const match of matches) {
        const [word] = match;
        const start = match.index;
        const end = start + word.length;

        if (start > lastIndex) {
          fragment.appendChild(document.createTextNode(originalText.slice(lastIndex, start)));
        }

        const meta = flatTerms.find(t => t.term.toLowerCase() === word.toLowerCase());

        const mark = document.createElement("mark");
        mark.textContent = word;
        mark.dataset.skillHighlight = "true";
        mark.style.backgroundColor = meta?.color || "yellow";
        mark.style.padding = "0 2px";
        mark.style.borderRadius = "3px";

        fragment.appendChild(mark);
        lastIndex = end;
      }

      if (lastIndex < originalText.length) {
        fragment.appendChild(document.createTextNode(originalText.slice(lastIndex)));
      }

      node.parentNode.replaceChild(fragment, node);
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !["SCRIPT", "STYLE", "IFRAME", "NOSCRIPT", "HEAD"].includes(node.tagName)
    ) {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        wrapMatchesInNode(child);
      }
    }
  }

  wrapMatchesInNode(root);
}


function addFloatingToggleAndLegend(skillRules) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.zIndex = "9999";
  container.style.background = "white";
  container.style.padding = "10px";
  container.style.border = "1px solid #ccc";
  container.style.borderRadius = "6px";
  container.style.fontSize = "12px";
  container.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  container.id = "highlight-toggle-panel";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = true;
  checkbox.id = "highlightToggle";

  const label = document.createElement("label");
  label.htmlFor = "highlightToggle";
  label.style.marginLeft = "6px";
  label.textContent = "Skill Highlights";

  checkbox.addEventListener("change", () => {
    const marks = document.querySelectorAll("[data-skill-highlight]");
    marks.forEach(mark => {
      mark.style.display = checkbox.checked ? "inline" : "none";
    });
  });

  container.appendChild(checkbox);
  container.appendChild(label);

  const legendTitle = document.createElement("div");
  legendTitle.textContent = "Legend:";
  legendTitle.style.marginTop = "8px";
  legendTitle.style.fontWeight = "bold";
  container.appendChild(legendTitle);

  for (const [skill, { color }] of Object.entries(skillRules)) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.marginTop = "4px";

    const swatch = document.createElement("span");
    swatch.style.display = "inline-block";
    swatch.style.width = "12px";
    swatch.style.height = "12px";
    swatch.style.backgroundColor = color;
    swatch.style.marginRight = "6px";
    swatch.style.borderRadius = "2px";

    const skillLabel = document.createElement("span");
    skillLabel.textContent = skill;

    row.appendChild(swatch);
    row.appendChild(skillLabel);
    container.appendChild(row);
  }

  document.body.appendChild(container);
}

function extractJobInfo() {
  const jobTitleEl = document.querySelector('h1[data-automation="job-detail-title"]');
  const companyNameEl = document.querySelector('span[data-automation="advertiser-name"]');
  const text = document.body.innerText;

  const matchedSkills = findMatchedSkills(text);
  highlightMatchedTerms(document.body, SKILL_RULES);
  addFloatingToggleAndLegend(SKILL_RULES);

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
