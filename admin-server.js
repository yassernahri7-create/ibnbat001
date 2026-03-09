const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const parsedPort = Number.parseInt(process.env.PORT || "", 10);
const isValidPort = Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535;
const port = isValidPort ? parsedPort : 5600;
const root = process.cwd();

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin";
const SESSION_COOKIE = "ibn_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_JSON_BYTES = 512 * 1024;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);

const ADMIN_ALLOWED_EXACT = new Set(["/admin.html", "/admin.js", "/admin.css"]);
const ADMIN_ALLOWED_PREFIXES = ["/assets/"];

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

if (!process.env.ADMIN_PASS) {
  console.warn("ADMIN_PASS is not set. Using insecure default credentials (admin/admin).");
}

const sessions = new Map();

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders
  });
  res.end(JSON.stringify(payload));
}

function collectBody(req, res, maxBytes, onDone) {
  let size = 0;
  let closed = false;
  const chunks = [];

  req.on("data", (chunk) => {
    if (closed) return;
    size += chunk.length;
    if (size > maxBytes) {
      closed = true;
      sendJson(res, 413, { ok: false, error: "payload_too_large" });
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });

  req.on("end", () => {
    if (closed) return;
    closed = true;
    onDone(Buffer.concat(chunks));
  });

  req.on("error", () => {
    if (closed) return;
    closed = true;
    sendJson(res, 400, { ok: false, error: "bad_request" });
  });
}

function parseCookies(req) {
  const cookieHeader = req.headers.cookie || "";
  const out = {};
  cookieHeader.split(";").forEach((entry) => {
    const idx = entry.indexOf("=");
    if (idx === -1) return;
    const key = entry.slice(0, idx).trim();
    const value = entry.slice(idx + 1).trim();
    if (!key) return;
    out[key] = decodeURIComponent(value);
  });
  return out;
}

function clearExpiredSessions() {
  const now = Date.now();
  for (const [token, expiresAt] of sessions.entries()) {
    if (expiresAt <= now) sessions.delete(token);
  }
}

function createSession() {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  sessions.set(token, expiresAt);
  return token;
}

function getSessionToken(req) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  return typeof token === "string" && token ? token : null;
}

function isAuthenticated(req) {
  clearExpiredSessions();
  const token = getSessionToken(req);
  if (!token) return false;
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (expiresAt <= Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function shouldUseSecureCookie(req) {
  const forced = String(process.env.COOKIE_SECURE || "").trim().toLowerCase();
  if (forced === "true" || forced === "1" || forced === "yes") return true;
  if (forced === "false" || forced === "0" || forced === "no") return false;

  const forwardedProto = String(req.headers["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  return forwardedProto === "https";
}

function buildSessionCookie(req, token) {
  const secure = shouldUseSecureCookie(req) ? " Secure;" : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)};${secure}`;
}

function buildLogoutCookie(req) {
  const secure = shouldUseSecureCookie(req) ? " Secure;" : "";
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0;${secure}`;
}

function requireAuth(req, res) {
  if (isAuthenticated(req)) return true;
  sendJson(res, 401, { ok: false, error: "unauthorized" });
  return false;
}

function resolveSafePath(baseDir, requestPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(requestPath);
  } catch (e) {
    return null;
  }

  const normalized = decoded.replace(/\\/g, "/");
  const relative = normalized.replace(/^\/+/, "");
  const base = path.resolve(baseDir);
  const resolved = path.resolve(base, relative);
  if (resolved === base || resolved.startsWith(base + path.sep)) {
    return resolved;
  }
  return null;
}

function isAllowedAdminPath(urlPath) {
  if (ADMIN_ALLOWED_EXACT.has(urlPath)) return true;
  return ADMIN_ALLOWED_PREFIXES.some((prefix) => urlPath.startsWith(prefix));
}

function readConfigObject() {
  const configPath = path.join(root, "data", "config.json");
  if (!fs.existsSync(configPath)) return {};
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch (e) {
    return {};
  }
}

function toAdminConfig(config) {
  const safeConfig = { ...config };
  delete safeConfig.admin;
  return safeConfig;
}

function saveConfigObject(config) {
  const dataDir = path.join(root, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const configPath = path.join(dataDir, "config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
}

http.createServer((req, res) => {
  const raw = (req.url || "/").split("?")[0];

  if (req.method === "POST" && raw === "/api/admin/login") {
    collectBody(req, res, MAX_JSON_BYTES, (buffer) => {
      try {
        const parsed = JSON.parse(buffer.toString("utf8") || "{}");
        const user = typeof parsed.user === "string" ? parsed.user.trim() : "";
        const pass = typeof parsed.pass === "string" ? parsed.pass : "";
        if (user === ADMIN_USER && pass === ADMIN_PASS) {
          const token = createSession();
          sendJson(
            res,
            200,
            { ok: true },
            { "Set-Cookie": buildSessionCookie(req, token) }
          );
          return;
        }
        sendJson(res, 401, { ok: false, error: "invalid_credentials" });
      } catch (e) {
        sendJson(res, 400, { ok: false, error: "invalid_json" });
      }
    });
    return;
  }

  if (req.method === "GET" && raw === "/api/admin/session") {
    sendJson(res, 200, { ok: true, authenticated: isAuthenticated(req) });
    return;
  }

  if (req.method === "POST" && raw === "/api/admin/logout") {
    const token = getSessionToken(req);
    if (token) sessions.delete(token);
    sendJson(res, 200, { ok: true }, { "Set-Cookie": buildLogoutCookie(req) });
    return;
  }

  if (req.method === "POST" && raw === "/api/upload") {
    if (!requireAuth(req, res)) return;
    collectBody(req, res, MAX_UPLOAD_BYTES, (buffer) => {
      try {
        if (!buffer.length) {
          sendJson(res, 400, { ok: false, error: "empty_file" });
          return;
        }

        const rawExt = String(req.headers["x-extension"] || "jpg").toLowerCase();
        const ext = rawExt.replace(/[^a-z0-9]/g, "");
        if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
          sendJson(res, 400, { ok: false, error: "invalid_extension" });
          return;
        }

        const uploadDir = path.join(root, "assets", "uploads");
        fs.mkdirSync(uploadDir, { recursive: true });

        const uniquePart = crypto.randomUUID().replace(/-/g, "");
        const filename = `upload_${Date.now()}_${uniquePart}.${ext}`;
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer, { flag: "wx" });

        sendJson(res, 200, { ok: true, url: `/assets/uploads/${filename}` });
      } catch (err) {
        sendJson(res, 500, { ok: false, error: "upload_failed" });
      }
    });
    return;
  }

  if (raw === "/api/config") {
    if (!requireAuth(req, res)) return;

    if (req.method === "GET") {
      sendJson(res, 200, toAdminConfig(readConfigObject()));
      return;
    }

    if (req.method === "POST") {
      collectBody(req, res, MAX_JSON_BYTES, (buffer) => {
        try {
          const parsed = JSON.parse(buffer.toString("utf8") || "{}");
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            sendJson(res, 400, { ok: false, error: "invalid_json" });
            return;
          }
          delete parsed.admin;
          saveConfigObject(parsed);
          sendJson(res, 200, { ok: true });
        } catch (e) {
          sendJson(res, 400, { ok: false, error: "invalid_json" });
        }
      });
      return;
    }

    sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    return;
  }

  let urlPath = raw === "/" ? "/admin.html" : raw;
  if (raw === "/admin" || raw === "/admin/") {
    urlPath = "/admin.html";
  }

  if (!isAllowedAdminPath(urlPath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
    return;
  }

  const filePath = resolveSafePath(root, urlPath);
  if (!filePath) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
    return;
  }

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
}).listen(port, "0.0.0.0", () => {
  console.log(`Admin server running on 0.0.0.0:${port}`);
});
