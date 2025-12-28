import { createServer } from "http";
import { readFile } from "fs/promises";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = Number.parseInt(process.env.PORT ?? "", 10) || 4173;
const host = process.env.HOST ?? "0.0.0.0";
const distDir = join(__dirname, "..", "dist");
const apiBase = process.env.API_URL ?? process.env.VITE_API_URL ?? "";
const apiOrigin = apiBase.replace(/\/$/, "");
const apiRoot = apiOrigin.endsWith("/api") ? apiOrigin.slice(0, -4) : apiOrigin;

console.log("[web] Starting server...");
console.log("[web] PORT from env:", process.env.PORT);
console.log("[web] Final port:", port);
console.log("[web] Host:", host);
console.log("[web] Dist directory:", distDir);

const getContentType = (filePath) => {
  const extension = extname(filePath).toLowerCase();
  switch (extension) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".ico":
      return "image/x-icon";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    case ".map":
      return "application/json";
    case ".txt":
      return "text/plain; charset=utf-8";
    default:
      return "application/octet-stream";
  }
};

const server = createServer(async (req, res) => {
  try {
    // Quick health check response for Railway
    if (req.url === "/health" || req.url === "/healthz") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("OK");
      return;
    }

    const rawUrl = req.url ?? "/";
    const pathOnly = rawUrl.split("?")[0];

    if ((pathOnly === "/sitemap.xml" || pathOnly === "/robots.txt") && apiRoot) {
      try {
        const apiUrl = new URL(rawUrl, apiRoot);
        const apiResponse = await fetch(apiUrl, {
          headers: { "User-Agent": req.headers["user-agent"] ?? "web-proxy" },
        });
        const buffer = Buffer.from(await apiResponse.arrayBuffer());
        res.writeHead(apiResponse.status, {
          "Content-Type": apiResponse.headers.get("content-type") ?? "text/plain; charset=utf-8",
          "Cache-Control": apiResponse.headers.get("cache-control") ?? "public, max-age=300",
          "X-Content-Type-Options": "nosniff",
        });
        res.end(buffer);
        return;
      } catch (error) {
        console.error("[server] SEO proxy error:", error);
      }
    }

    let filePath = rawUrl === "/" ? "/index.html" : rawUrl;

    const queryIndex = filePath.indexOf("?");
    if (queryIndex !== -1) {
      filePath = filePath.substring(0, queryIndex);
    }

    if (filePath.includes("..")) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden");
      return;
    }

    const fullPath = join(distDir, filePath);
    let content;
    let contentType = getContentType(filePath);

    try {
      content = await readFile(fullPath);
    } catch (err) {
      if (err.code === "ENOENT" && !filePath.match(/\.\w+$/)) {
        content = await readFile(join(distDir, "index.html"));
        contentType = "text/html; charset=utf-8";
      } else {
        res.writeHead(err.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain" });
        res.end(err.code === "ENOENT" ? "Not Found" : "Internal Server Error");
        return;
      }
    }

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": filePath.includes("/assets/") ? "public, max-age=31536000, immutable" : "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(content);
  } catch (error) {
    console.error("[server] Error:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`[web] Production server listening on http://${host}:${port}`);
  console.log(`[web] Serving from: ${distDir}`);
  console.log(`[web] Health check: http://${host}:${port}/`);
});

const handleShutdown = () => {
  console.log("[web] Shutting down server");
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGTERM", handleShutdown);
process.on("SIGINT", handleShutdown);
