# AB 2047 3D Printing Outreach Tool

A ready-to-host static GitHub Pages site for helping people respectfully contact 3D printing companies about California AB 2047.

## What it does

- Shows a plain-language AB 2047 summary with a link to the official California bill page.
- Lets visitors personalize an outreach email.
- Lets visitors select 3D printing companies from a searchable checklist.
- Generates individual `mailto:` drafts from the visitor’s own email app.
- Provides contact/source links for companies that do not publish direct public emails.
- Includes the full contact directory with source links.

## Why this is static

This project intentionally does **not** send emails from a server. Individual drafts are better for deliverability and harder to mistake for automated spam. The site has no backend and collects no visitor data.

## Deploy on GitHub Pages

1. Create a new GitHub repository.
2. Upload all files in this folder to the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your default branch and `/root` folder.
6. Save.

Your site will appear at a URL similar to:

```text
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

## Files

- `index.html` — the static page.
- `style.css` — styling.
- `script.js` — checklist, filters, template preview, and `mailto:` generation.
- `contacts.js` — company contact data generated from the contact directory.
- `contacts.csv` — plain CSV export of the same contact directory.
- `sources.md` — bill and data source notes.
- `.nojekyll` — disables Jekyll processing so GitHub Pages serves files as-is.

## Important note

Contact details change. Verify important contacts before major outreach. This page is intended for respectful civic participation, not harassment or bulk spam.
