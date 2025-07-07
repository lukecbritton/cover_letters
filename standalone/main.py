import tkinter as tk
from tkinter import ttk

# Skill sentence templates
skill_sentences = {
    "TypeScript": "I’ve built and maintained scalable frontend and backend systems using TypeScript across multiple projects.",
    "AWS": "I'm comfortable deploying and managing infrastructure on AWS, using services like Lambda, ECS, and S3.",
    "React": "I've developed responsive and user-focused interfaces using React and modern frontend tools.",
    "Node.js": "I’ve delivered performant backend services using Node.js, including RESTful APIs and background workers.",
    "CI/CD": "I’ve implemented CI/CD pipelines using GitHub Actions and CodePipeline to automate testing and deployment.",
    "Agile": "I work well in Agile teams, regularly contributing to sprint planning, reviews, and retrospectives.",
}

# GUI App
class CoverLetterApp:
    def __init__(self, root):
        self.root = root
        root.title("Cover Letter Generator")

        # Job Title
        ttk.Label(root, text="Job Title:").grid(row=0, column=0, sticky='e')
        self.job_title = ttk.Entry(root, width=40)
        self.job_title.grid(row=0, column=1, pady=5)

        # Company Name
        ttk.Label(root, text="Company Name:").grid(row=1, column=0, sticky='e')
        self.company_name = ttk.Entry(root, width=40)
        self.company_name.grid(row=1, column=1, pady=5)

        # Skill Dropdowns
        self.skill_vars = []
        options = list(skill_sentences.keys())

        for i in range(3):
            ttk.Label(root, text=f"Skill {i+1}:").grid(row=2+i, column=0, sticky='e')
            var = tk.StringVar()
            dropdown = ttk.Combobox(root, textvariable=var, values=options, state="readonly", width=38)
            dropdown.grid(row=2+i, column=1, pady=2)
            self.skill_vars.append(var)

        # Generate Button
        self.generate_btn = ttk.Button(root, text="Generate Cover Letter", command=self.generate_letter)
        self.generate_btn.grid(row=5, column=0, columnspan=2, pady=10)

        # Output Text Box
        self.output = tk.Text(root, height=15, width=70, wrap='word')
        self.output.grid(row=6, column=0, columnspan=2, padx=10, pady=10)

    def generate_letter(self):
        job = self.job_title.get()
        company = self.company_name.get()
        selected_skills = [var.get() for var in self.skill_vars if var.get() in skill_sentences]

        intro = f"Dear {company} team,\n\nI'm writing to express my interest in the {job} position at {company}."
        
        middle = ""
        if selected_skills:
            middle += "\n\nI believe I would be a great fit for the role based on the following experience:\n"
            for skill in selected_skills:
                middle += f"- {skill_sentences[skill]}\n"

        outro = "\nI’m excited about the opportunity to contribute and would love to chat further.\n\nBest regards,\nLuke"

        self.output.delete('1.0', tk.END)
        self.output.insert(tk.END, intro + middle + outro)

# Run the app
if __name__ == "__main__":
    root = tk.Tk()
    app = CoverLetterApp(root)
    root.mainloop()
