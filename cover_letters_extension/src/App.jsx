import { useEffect, useState } from "react";

const SKILL_SENTENCES = {
  "TypeScript": "I’ve built and maintained scalable frontend and backend systems using TypeScript.",
  "AWS": "I'm comfortable deploying and managing infrastructure on AWS, using services like Lambda, ECS, and S3.",
  "React": "I've developed responsive and user-focused interfaces using React.",
  "Node.js": "I’ve delivered performant backend services using Node.js.",
  "CI/CD": "I’ve implemented CI/CD pipelines using GitHub Actions and CodePipeline.",
  "Agile": "I work well in Agile teams, contributing to sprint planning and retrospectives."
};

function App() {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [skills, setSkills] = useState(["", "", ""]);
  const [letter, setLetter] = useState("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getJobInfo" },
        (res) => {
          if (res) {
            setJobTitle(res.jobTitle || "");
            setCompanyName(res.companyName || "");
            const top3 = res.matchedSkills?.slice(0, 3) || [];
            setSkills([top3[0] || "", top3[1] || "", top3[2] || ""]);
          }
        }
      );
    });
  }, []);

  const generateLetter = () => {
    const intro = `Dear ${companyName} team,\n\nI'm writing to express my interest in the ${jobTitle} position at ${companyName}.`;

    const body = skills
      .filter(Boolean)
      .map(skill => `- ${SKILL_SENTENCES[skill]}`)
      .join("\n");

    const outro = "\n\nI’m excited about the opportunity and would love to chat further.\n\nBest regards,\nLuke Britton";

    setLetter(`${intro}\n\nI believe I would be a great fit for the role based on the following experience:\n${body}${outro}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter);
  };

  return (
    <div style={{ padding: 12, width: 300, fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: 10 }}>
      <h3>Cover Letter Generator</h3>

      <label>Job Title</label>
      <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />

      <label>Company Name</label>
      <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />

      <label>Skills</label>
      {[0, 1, 2].map((i) => (
        <select key={i} value={skills[i]} onChange={(e) => {
          const updated = [...skills];
          updated[i] = e.target.value;
          setSkills(updated);
        }}>
          <option value="">-- Select Skill --</option>
          {Object.keys(SKILL_SENTENCES).map(skill => (
            <option key={skill} value={skill}>{skill}</option>
          ))}
        </select>
      ))}

      <button onClick={generateLetter}>Generate Cover Letter</button>

      <label>Generated Letter</label>
      <textarea value={letter} readOnly rows={10} style={{ width: "100%", whiteSpace: "pre-wrap" }} />

      <button onClick={copyToClipboard}>Copy to Clipboard</button>
    </div>
  );
}

export default App;
