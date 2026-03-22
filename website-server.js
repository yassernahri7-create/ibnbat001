const http = require("http");
const fs = require("fs");
const path = require("path");

const parsedPort = Number.parseInt(process.env.PORT || "", 10);
const isValidPort = Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535;
const port = isValidPort ? parsedPort : 5500;
const root = process.cwd();

const MAX_JSON_BYTES = 256 * 1024;

const WEBSITE_ALLOWED_EXACT = new Set([
  "/index.html",
  "/script.js",
  "/styles.css",
  "/favicon.ico",
  "/service-restaurant.html",
  "/service-rental.html",
  "/service-nightclub.html",
  "/service-ecommerce.html",
  "/translations.js"
]);
const WEBSITE_ALLOWED_PREFIXES = ["/assets/"];

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

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function collectBody(req, res, maxBytes, onDone) {
  let size = 0;
  const chunks = [];
  let closed = false;

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

function readConfigObject() {
  const configPath = path.join(root, "data", "config.json");
  if (!fs.existsSync(configPath)) return {};
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw || "{}");

    // Auto-heal legacy plans: If we have 5 plans, or if branding is old (Yearly Plan), reset to the 3 new Super bundles
    const isLegacy = (parsed.services && parsed.services.length === 5) ||
      (parsed.services && parsed.services[1] && parsed.services[1].en && parsed.services[1].en.title && parsed.services[1].en.title.includes("Yearly Plan"));

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

function toPublicConfig(config) {
  return {
    social: config.social || {},
    services: Array.isArray(config.services) ? config.services : [],
    projects: Array.isArray(config.projects) ? config.projects : [],
    brand: config.brand || {},
    promo: config.promo || {}
  };
}

function isAllowedWebsitePath(urlPath) {
  if (WEBSITE_ALLOWED_EXACT.has(urlPath)) return true;
  return WEBSITE_ALLOWED_PREFIXES.some((prefix) => urlPath.startsWith(prefix));
}

const server = http.createServer((req, res) => {
  const raw = (req.url || "/").split("?")[0];

  // Uploads are only accepted on the admin server.
  if (req.method === "POST" && raw === "/api/upload") {
    sendJson(res, 403, { ok: false, error: "disabled_on_public_server" });
    return;
  }

  // Public contact endpoint.
  if (req.method === "POST" && raw === "/api/contact") {
    collectBody(req, res, MAX_JSON_BYTES, (buffer) => {
      try {
        const payload = JSON.parse(buffer.toString("utf8") || "{}");
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
          sendJson(res, 400, { ok: false, error: "invalid_json" });
          return;
        }

        const dataDir = path.join(root, "data");
        fs.mkdirSync(dataDir, { recursive: true });
        const contactsFile = path.join(dataDir, "contacts.json");

        let list = [];
        try {
          if (fs.existsSync(contactsFile)) {
            const rawFile = fs.readFileSync(contactsFile, "utf8");
            const parsedList = JSON.parse(rawFile || "[]");
            if (Array.isArray(parsedList)) list = parsedList;
          }
        } catch (e) {
          list = [];
        }

        const record = { ...payload, receivedAt: new Date().toISOString() };
        list.push(record);
        fs.writeFileSync(contactsFile, JSON.stringify(list, null, 2), "utf8");
        sendJson(res, 200, { ok: true });
      } catch (e) {
        sendJson(res, 400, { ok: false, error: "invalid_json" });
      }
    });
    return;
  }

  // Public read-only config endpoint.
  if (raw === "/api/config") {
    if (req.method === "GET") {
      const publicConfig = toPublicConfig(readConfigObject());
      sendJson(res, 200, publicConfig);
      return;
    }
    sendJson(res, 403, { ok: false, error: "read_only" });
    return;
  }

  const urlPath = raw === "/" ? "/index.html" : raw;
  if (!isAllowedWebsitePath(urlPath)) {
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
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Website server running on 0.0.0.0:${port}`);
});
