const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");

const parsedPort = Number.parseInt(process.env.PORT || "", 10);
const isValidPort = Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535;
const port = isValidPort ? parsedPort : 5600;
const root = process.cwd();

const SESSION_COOKIE = "ibn_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getAdminCredentials() {
  const config = readConfigObject();
  const user = (config.admin && config.admin.user) || process.env.ADMIN_USER || "admin";
  const pass = (config.admin && config.admin.pass) || process.env.ADMIN_PASS || "admin";
  return { user, pass };
}
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

    // Auto-heal legacy plans: Force the 3 new Super bundles on the first boot
    const isLegacy = !parsed._super_bundle_v1;

    if (isLegacy) {
      console.log("Auto-healing legacy config to Super Plan 3-pack...");
      const newServices = [
        {
          fr: { title: "Essai Gratuit — 0 DH", desc: "Testez le système complet sans risque avant de vous engager.", features: ["3 Langues Incluses (AR/EN/FR)", "Panel d'Administration Complet", "Hébergement Cloud 1 An Offert", "Assistance Tech 24/7 VIP", "Design Premium Responsive", "Intégration WhatsApp Direct"] },
          en: { title: "Free Trial — 0 DH", desc: "Experience the full system risk-free before you commit.", features: ["3 Languages Included (AR/EN/FR)", "Full Dynamic Admin Panel", "1 Year Cloud Hosting Included", "24/7 Technical VIP Assistance", "Premium Responsive Design", "Direct WhatsApp Integration"] },
          ar: { title: "تجربة مجانية — 0 درهم", desc: "جرب النظام الكامل بدون مخاطر قبل الالتزام.", features: ["3 لغات متضمنة (AR/EN/FR)", "لوحة تحكم ديناميكية كاملة", "استضافة سحابية لمدة سنة مجاناً", "دعم فني VIP على مدار الساعة", "تصميم مميز ومتجاوب", "دمج مباشر لتطبيق WhatsApp"] }
        },
        {
          fr: { title: "Super Plan — 1600 DH", desc: "La solution complète tout-en-un pour une année de succès.", features: ["3 Langues Incluses (AR/EN/FR)", "Panel d'Administration Complet", "Hébergement Cloud 1 An Offert", "Assistance Tech 24/7 VIP", "Design Premium Responsive", "Optimisation SEO & Google", "Intégration WhatsApp Direct"] },
          en: { title: "Super Plan — 1600 DH", desc: "The all-in-one complete solution for a year of success.", features: ["3 Languages Included (AR/EN/FR)", "Full Dynamic Admin Panel", "1 Year Cloud Hosting Included", "24/7 Technical VIP Assistance", "Premium Responsive Design", "SEO & Google Optimization", "Direct WhatsApp Integration"] },
          ar: { title: "سوبر بلان — 1600 درهم", desc: "الحل الشامل والكامل لسنة من النجاح.", features: ["3 لغات متضمنة (AR/EN/FR)", "لوحة تحكم ديناميكية كاملة", "استضافة سحابية لمدة سنة مجاناً", "دعم فني VIP على مدار الساعة", "تصميم مميز ومتجاوب", "تحسين محركات البحث SEO", "دمج مباشر لتطبيق WhatsApp"] }
        },
        {
          fr: { title: "Pack Mensuel — 200 DH", desc: "Liberté totale avec un paiement mensuel flexible.", features: ["3 Langues Incluses (AR/EN/FR)", "Panel d'Administration Complet", "Hébergement Cloud Inclus", "Assistance Tech 24/7 VIP", "Design Premium Responsive", "Intégration WhatsApp Direct"] },
          en: { title: "Monthly Pack — 200 DH", desc: "Total freedom with a flexible monthly payment.", features: ["3 Languages Included (AR/EN/FR)", "Full Dynamic Admin Panel", "Cloud Hosting Included", "24/7 Technical VIP Assistance", "Premium Responsive Design", "Direct WhatsApp Integration"] },
          ar: { title: "الباقة الشهرية — 200 درهم", desc: "حرية تامة مع دفع شهري مرن.", features: ["3 لغات متضمنة (AR/EN/FR)", "لوحة تحكم ديناميكية كاملة", "استضافة سحابية متضمنة", "دعم فني VIP على مدار الساعة", "تصميم مميز ومتجاوب", "دمج مباشر لتطبيق WhatsApp"] }
        }
      ];
      parsed.services = newServices;
      parsed._super_bundle_v1 = true;
      try { fs.writeFileSync(configPath, JSON.stringify(parsed, null, 2), "utf8"); } catch (e) { }
    }
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
        const { user: ADMIN_USER, pass: ADMIN_PASS } = getAdminCredentials();
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
    const contentType = mime[ext] || "application/octet-stream";
    const acceptEncoding = req.headers["accept-encoding"] || "";

    // Smart Caching Logic
    let cacheControl = "no-cache, no-store, must-revalidate"; // Default: No cache for HTML/Config/Auth

    // Assets or versioned files can be cached
    const isVersioned = req.url.includes("?v=");
    const isAsset = urlPath.startsWith("/assets/");
    if (isVersioned || isAsset) {
      cacheControl = "public, max-age=31536000, immutable";
    }

    const headers = {
      "Content-Type": contentType,
      "Cache-Control": cacheControl
    };

    // Gzip Compression for text-based assets
    const shouldCompress = contentType.includes("text") || contentType.includes("json") || contentType.includes("javascript") || contentType.includes("svg");

    if (shouldCompress && acceptEncoding.includes("gzip")) {
      res.writeHead(200, { ...headers, "Content-Encoding": "gzip" });
      const gzip = zlib.createGzip();
      fs.createReadStream(filePath).pipe(gzip).pipe(res);
    } else {
      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
    }
  });
}).listen(port, "0.0.0.0", () => {
  console.log(`Admin server running on 0.0.0.0:${port}`);
});
