# MedHelp

A small Node.js + Express + MongoDB project (static frontend + API).

Quick steps to push to GitHub and host the repo:

1. Create a new GitHub repository (do not initialize with README or .gitignore).
2. From your project folder run the commands below.

# Commands (PowerShell)

```powershell
cd 'C:\Users\debas\OneDrive\Desktop\medihelp - Copy'
# initialize git (only if not already a repo)
git init
git add .
git commit -m "Initial commit"
# replace <YOUR_GITHUB_URL> with the repo HTTPS url, e.g. https://github.com/youruser/medhelp.git
git remote add origin <YOUR_GITHUB_URL>
git branch -M main
git push -u origin main
```

Notes:
- Make sure `.env` is not committed. The provided `.gitignore` will ignore common secrets.
- For GitHub Pages static hosting, move `frontend` contents into root or create a `gh-pages` branch. This repo is a full-stack app; consider hosting backend on Heroku/Render/Vercel and frontend on GitHub Pages.
"# med-help" 
"# med-help" 
