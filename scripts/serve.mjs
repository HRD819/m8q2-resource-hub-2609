import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "dist");
const port = Number(process.env.PORT || 4173);
const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
]);

createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    let file = path.resolve(outputRoot, `.${requestPath}`);
    if (!file.startsWith(`${outputRoot}${path.sep}`) && file !== outputRoot) throw new Error("路徑越界");
    const fileStat = await stat(file);
    if (fileStat.isDirectory()) file = path.join(file, "index.html");
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": mimeTypes.get(path.extname(file)) || "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("找不到頁面");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`預覽伺服器：http://127.0.0.1:${port}/`);
});
