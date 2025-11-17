# Admeme

A small Simon-style color memory game built with HTML, CSS and JavaScript.

How to run locally

1. Open a local HTTP server in the project folder so audio loads and autoplay policies don't block playback.

- With Python 3:

```powershell
python -m http.server 8000
Start-Process "http://localhost:8000"
```

- With Node (no install required):

```powershell
npx http-server . -p 8000
Start-Process "http://localhost:8000"
```

2. Press the Start button or any key and play.

Notes

- The `sounds/` folder must match the path used in `game.js` (case-sensitive on some hosts). If your folder is `Sounds/` rename it to `sounds/` or update the paths.
- To deploy, push this repo to GitHub and use GitHub Pages, or connect to Netlify/Vercel.

License

Feel free to reuse or modify for learning projects.
