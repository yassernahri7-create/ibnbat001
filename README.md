# websolution Website

Simple 2-page website for local business website services.

## Files
- index.html
- services.html
- styles.css
- script.js

## Run
Run a local static server (Node.js provided) and open the site in your browser.

Start the website server (default port 5500):

```powershell
node website-server.js
```
Admin panel is available at `/admin.html` on the same host, for example:

```powershell
http://localhost:5510/admin.html
```

Or run on a different port:

```powershell
$env:PORT=5510; node website-server.js
```

Contact form submissions are saved to `data/contacts.json` when sent from the site.

## Edit brand/contact quickly
- Instagram links: search `websolution0101`
- WhatsApp link: search `wa.me/212717430045`
- Email: search `saad12eq@gmail.com`

## Language
- Default uses browser language (Auto mode)
- Manual switch available in header: English / Francais / العربية
- Preference is saved in browser localStorage key: `site_lang`

