import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadContent } from "./lib/content.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { courses } = await loadContent(path.join(projectRoot, "content"));
const unitCount = courses.reduce((total, course) => total + course.units.length, 0);
const materialCount = courses.reduce(
  (total, course) => total + course.units.reduce((count, unit) => count + unit.materials.length, 0),
  0,
);
console.log(`內容驗證通過：${courses.length} 門課程、${unitCount} 個單元、${materialCount} 項教材。`);
