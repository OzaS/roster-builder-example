// Builds every gallery and assembles the GitHub Pages site in dist/:
//   dist/index.html      the landing page (old root links with a query string go on to /augur/)
//   dist/augur/          Battle Augur design gallery
//   dist/cogitator/      Field Cogitator design gallery
import { execSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const galleries = [
  { workspace: "augur-designs", path: "augur" },
  { workspace: "cogitator-designs", path: "cogitator" },
];

rmSync(`${root}dist`, { recursive: true, force: true });
mkdirSync(`${root}dist`, { recursive: true });
for (const gallery of galleries) {
  execSync(`npm run build -w ${gallery.workspace}`, { cwd: root, stdio: "inherit" });
  cpSync(`${root}${gallery.workspace}/dist`, `${root}dist/${gallery.path}`, { recursive: true });
}
cpSync(`${root}pages`, `${root}dist`, { recursive: true });
console.log("Pages site assembled in dist/");
