const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 5500;
const root = process.cwd();

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

http.createServer((req, res) => {
  const raw = req.url.split("?")[0];
  // API: store contact requests server-side (simple JSON file)
  if (req.method === "POST" && raw === "/api/contact") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        // ensure data directory
        const dataDir = path.join(root, "data");
        try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
        const contactsFile = path.join(dataDir, "contacts.json");
        let list = [];
        try {
          if (fs.existsSync(contactsFile)) {
            const rawFile = fs.readFileSync(contactsFile, "utf8");
            list = JSON.parse(rawFile || "[]");
          }
        } catch (e) {
          list = [];
        }
        payload.receivedAt = new Date().toISOString();
        list.push(payload);
        fs.writeFileSync(contactsFile, JSON.stringify(list, null, 2), "utf8");
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: false, error: "invalid_json" }));
      }
    });
    return;
  }

  let urlPath = raw === "/" ? "/index.html" : raw;
  if (raw === "/admin" || raw === "/admin/") {
    urlPath = "/admin.html";
  }

  const filePath = path.join(root, decodeURIComponent(urlPath));
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(port, () => {
  console.log(`Website server running at http://localhost:${port}`);
});
