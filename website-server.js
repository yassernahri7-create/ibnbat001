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

  // API: Handle Image Uploads (Synchronized with admin-server)
  if (req.method === "POST" && raw === "/api/upload") {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => {
      try {
        const buffer = Buffer.concat(chunks);
        const ext = (req.headers["x-extension"] || "jpg").replace(".", "");
        const filename = `upload_${Date.now()}.${ext}`;
        const uploadDir = path.join(root, "assets", "uploads");

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ url: `/assets/uploads/${filename}` }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: "upload_failed" }));
      }
    });
    return;
  }
  // API: store contact requests server-side (simple JSON file)
  if (req.method === "POST" && raw === "/api/contact") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const dataDir = path.join(root, "data");
        try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) { }
        const contactsFile = path.join(dataDir, "contacts.json");
        let list = [];
        try {
          if (fs.existsSync(contactsFile)) {
            const rawFile = fs.readFileSync(contactsFile, "utf8");
            list = JSON.parse(rawFile || "[]");
          }
        } catch (e) { list = []; }
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

  // API: Get/Set site configuration
  if (raw === "/api/config") {
    const configPath = path.join(root, "data", "config.json");
    if (req.method === "GET") {
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
    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
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
