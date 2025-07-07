# Cover Letter Chrome Extension
## Summary
This is a basic chrome extension used to prefill coverletters for me since I absolutely detest them. 

Features include:
- Selecting three skills you have prefilled and adding them to the cover letter. 
- Weighting how important a skill is to said application with how many references of the tech stack there is.
- Highlight said references
- Autofill job title, company name, and presumed relevant skills. 

simply run `npm run build` from the directory and add the /dist file to chrome extensions via the 'load unpacked' prompt/

## Alterations
### App.jsx
- Change the reference skills.
- Change the name at the end.

### Content.js
Just update the `SKILL_RULES` const to match the reference skills.

# Standalone GUI
A super basic GUI for creating cover letters in a similar matter. 
As long as you have tk-linter installed it will work.