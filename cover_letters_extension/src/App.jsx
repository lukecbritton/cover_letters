import { useEffect, useState } from "react";

const SKILL_SENTENCES = {
  "TypeScript": "I’ve built and maintained scalable frontend and backend systems using TypeScript that support thousands of remote users.",
  "AWS": "I have multiple years of experience and am comfortable deploying and managing infrastructure on AWS, using services like Lambda, ECS, DynamoDB, and API Gateway.",
  "React": "I've developed multiple responsive and user-focused interfaces using React.",
  "Node.js": "I’ve delivered strong-performing backend services using Node.js.",
  "CI/CD": "I’ve implemented dozens of CI/CD pipelines using GitHub Actions and CodePipeline.",
  "Agile": "I work well in Agile teams, contributing to sprint planning and retrospectives, having run some in the past myself."
};

function App() {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [skills, setSkills] = useState(["", "", ""]);
  const [letter, setLetter] = useState("");

  useEffect(() => {
    if (chrome?.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "getJobInfo" },
          (res) => {
            if (res) {
              setJobTitle(res.jobTitle || "");
              setCompanyName(res.companyName.replaceAll(" ", "") || "");

              // Pre-fill skills if any matched
              if (Array.isArray(res.matchedSkills)) {
                const top3 = res.matchedSkills.slice(0, 3);
                setSkills([
                  top3[0] || "",
                  top3[1] || "",
                  top3[2] || ""
                ]);
              }
            }
          }
        );
      });
    }
  }, []);

  const generateLetter = () => {
    const intro = `Dear ${companyName} team,\n\nI'm writing to express my interest in the ${jobTitle} position at ${companyName}.`;

    const experienceList = skills
      .filter(Boolean)
      .map((skill) => `- ${SKILL_SENTENCES[skill]}`)
      .join("\n");

    const outro =
      "\n\nI’m excited about the opportunity and would love to chat further.\n\nBest regards,\nLuke";

    setLetter(`${intro}\n\nI believe I would be a great fit for the role based on the following experience:\n${experienceList}${outro}`);
  };

  const handleSkillChange = (index, value) => {
    const updated = [...skills];
    updated[index] = value;
    setSkills(updated);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter);
  };

  return (
    <div
      style={{
        padding: 12,
        width: 300,
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h3>Cover Letter Generator</h3>

      <label htmlFor="jobTitle">Job Title</label>
      <input
        id="jobTitle"
        type="text"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
      />

      <label htmlFor="companyName">Company Name</label>
      <input
        id="companyName"
        type="text"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />

      <label>Skills</label>
      {[0, 1, 2].map((index) => (
        <select
          key={index}
          value={skills[index]}
          onChange={(e) => handleSkillChange(index, e.target.value)}
        >
          <option value="">-- Select Skill --</option>
          {Object.keys(SKILL_SENTENCES).map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
      ))}

      <button onClick={generateLetter}>Generate Cover Letter</button>

      <label htmlFor="output">Generated Letter</label>
      <textarea
        id="output"
        value={letter}
        readOnly
        rows={10}
        style={{ width: "100%", whiteSpace: "pre-wrap" }}
      />

      <button onClick={copyToClipboard}>Copy to Clipboard</button>
    </div>
  );
}

export default App;
