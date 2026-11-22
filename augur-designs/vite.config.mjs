import react from "@vitejs/plugin-react";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const designDataPath = fileURLToPath(new URL("./src/design-data/roster-builder.design.json", import.meta.url));

function designDataMiddleware() {
  return {
    name: "design-data-middleware",
    configureServer(server) {
      server.middlewares.use("/__design-data/roster-builder", async (req, res) => {
        try {
          if (req.method === "GET") {
            const body = await readFile(designDataPath, "utf8");
            res.setHeader("Content-Type", "application/json");
            res.end(body);
            return;
          }

          if (req.method === "PUT") {
            let body = "";
            req.setEncoding("utf8");
            req.on("data", (chunk) => {
              body += chunk;
            });
            req.on("end", async () => {
              JSON.parse(body);
              await writeFile(designDataPath, `${JSON.stringify(JSON.parse(body), null, 2)}\n`, "utf8");
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true }));
            });
            return;
          }

          res.statusCode = 405;
          res.end("Method not allowed");
        } catch (error) {
          server.config.logger.error(error);
          res.statusCode = 500;
          res.end("Design data request failed");
        }
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), designDataMiddleware()],
});
