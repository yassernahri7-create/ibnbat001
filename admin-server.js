const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 5600;
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
  let urlPath = raw === "/" ? "/admin.html" : raw;

  if (req.method === "POST" && raw === "/api/config") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const configPath = path.join(root, "data", "config.json");
        const dataDir = path.join(root, "data");
        try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) { }
        fs.writeFileSync(configPath, body, "utf8");
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: "write_fail" }));
      }
    });
    return;
  }

  if (req.method === "GET" && raw === "/api/config") {
    const configPath = path.join(root, "data", "config.json");
    try {
      const data = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf8") : "{}";
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(data);
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: "read_fail" }));
    }
    return;
  }

  if (urlPath !== "/admin.html" && urlPath !== "/admin.js" && urlPath !== "/admin.css" && !urlPath.startsWith("/assets/")) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
    return;
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
  console.log(`Admin server running at http://localhost:${port}`);
});

