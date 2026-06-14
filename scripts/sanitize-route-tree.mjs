import fs from "node:fs";

const file = new URL("../src/routeTree.gen.js", import.meta.url);

if (fs.existsSync(file)) {
  const code = fs.readFileSync(file, "utf8");
  const typeBlockStart = code.indexOf("\nimport type { getRouter }");
  const nextCode = typeBlockStart === -1 ? code : code.slice(0, typeBlockStart);

  if (nextCode !== code) {
    fs.writeFileSync(file, nextCode);
  }
}
