import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const REQUIRED_SITE_FIELDS = ["title", "purpose", "instructions"];
const REQUIRED_COURSE_FIELDS = ["semester", "title", "slug", "description", "order"];
const REQUIRED_MATERIAL_FIELDS = ["title", "description", "file_type"];

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireObject(value, location, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${location}: 必須是 JSON object。`);
    return false;
  }
  return true;
}

function requireString(object, field, location, errors) {
  if (typeof object[field] !== "string" || object[field].trim() === "") {
    errors.push(`${location}: ${field} 必須是非空白字串。`);
  }
}

function validateDate(value, location, errors) {
  if (value === undefined || value === null || value === "") return;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.push(`${location}: updated 必須是 YYYY-MM-DD。`);
    return;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    errors.push(`${location}: updated 不是有效日期。`);
  }
}

function validateDropboxUrl(value, location, errors) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || !(host === "dropbox.com" || host.endsWith(".dropbox.com"))) {
      errors.push(`${location}: dropbox_url 必須是 HTTPS Dropbox 網址。`);
    }
  } catch {
    errors.push(`${location}: dropbox_url 不是有效網址。`);
  }
}

function validateMaterials(materials, location, errors) {
  if (!Array.isArray(materials)) {
    errors.push(`${location}: materials 必須是 array。`);
    return;
  }
  materials.forEach((material, index) => {
    const itemLocation = `${location}.materials[${index}]`;
    if (!requireObject(material, itemLocation, errors)) return;
    for (const field of REQUIRED_MATERIAL_FIELDS) requireString(material, field, itemLocation, errors);
    const status = material.status ?? "available";
    if (!new Set(["available", "planned"]).has(status)) {
      errors.push(`${itemLocation}: status 只能是 available 或 planned。`);
    }
    if (status === "planned") {
      if (typeof material.dropbox_url === "string" && material.dropbox_url.trim()) {
        errors.push(`${itemLocation}: planned 教材尚未可用，不應設定 dropbox_url。`);
      }
    } else {
      requireString(material, "dropbox_url", itemLocation, errors);
      if (typeof material.dropbox_url === "string" && material.dropbox_url.trim()) {
        validateDropboxUrl(material.dropbox_url, itemLocation, errors);
      }
    }
    validateDate(material.updated, itemLocation, errors);
    if (material.filename !== undefined && (typeof material.filename !== "string" || material.filename.trim() === "")) {
      errors.push(`${itemLocation}: filename 如有提供，必須是非空白字串。`);
    }
    if (material.note !== undefined && typeof material.note !== "string") {
      errors.push(`${itemLocation}: note 必須是字串。`);
    }
    if (material.is_demo !== undefined && typeof material.is_demo !== "boolean") {
      errors.push(`${itemLocation}: is_demo 必須是 boolean。`);
    }
  });
}

function validateSupplements(supplements, location, errors) {
  if (!Array.isArray(supplements)) {
    errors.push(`${location}: supplements 必須是 array。`);
    return;
  }
  supplements.forEach((item, index) => {
    const itemLocation = `${location}.supplements[${index}]`;
    if (!requireObject(item, itemLocation, errors)) return;
    for (const field of ["title", "description", "url"]) requireString(item, field, itemLocation, errors);
    if (typeof item.url === "string" && item.url.trim()) {
      try {
        const url = new URL(item.url);
        if (url.protocol !== "https:") errors.push(`${itemLocation}: url 必須使用 HTTPS。`);
      } catch {
        errors.push(`${itemLocation}: url 不是有效網址。`);
      }
    }
    validateDate(item.updated, itemLocation, errors);
  });
}

export async function readJson(file) {
  const source = await readFile(file, "utf8");
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`${file}: JSON 格式錯誤：${error.message}`);
  }
}

export async function loadContent(contentRoot) {
  const errors = [];
  const sitePath = path.join(contentRoot, "site.json");
  const site = await readJson(sitePath);
  if (requireObject(site, "content/site.json", errors)) {
    for (const field of REQUIRED_SITE_FIELDS) requireString(site, field, "content/site.json", errors);
  }

  const coursesRoot = path.join(contentRoot, "courses");
  const entries = await readdir(coursesRoot, { withFileTypes: true });
  const courseDirectories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (courseDirectories.length === 0) errors.push("content/courses: 至少需要一門課程。");

  const courses = [];
  for (const directory of courseDirectories) {
    const courseRoot = path.join(coursesRoot, directory);
    const courseLocation = `content/courses/${directory}/course.json`;
    const course = await readJson(path.join(courseRoot, "course.json"));
    if (requireObject(course, courseLocation, errors)) {
      for (const field of REQUIRED_COURSE_FIELDS) {
        if (field === "order") continue;
        requireString(course, field, courseLocation, errors);
      }
      if (!Number.isInteger(course.order) || course.order < 0) {
        errors.push(`${courseLocation}: order 必須是非負整數。`);
      }
      if (course.slug !== directory) errors.push(`${courseLocation}: slug 必須與資料夾名稱相同。`);
      if (typeof course.slug === "string" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(course.slug)) {
        errors.push(`${courseLocation}: slug 只能使用小寫英文、數字與單一連字號。`);
      }
    }

    const unitEntries = (await readdir(courseRoot, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && /^unit-\d{2,}\.json$/.test(entry.name))
      .map((entry) => entry.name)
      .sort();
    if (unitEntries.length === 0) errors.push(`${courseLocation}: 至少需要一個單元檔案。`);

    const units = [];
    for (const filename of unitEntries) {
      const unitLocation = `content/courses/${directory}/${filename}`;
      const unit = await readJson(path.join(courseRoot, filename));
      if (requireObject(unit, unitLocation, errors)) {
        if (!Number.isInteger(unit.unit) || unit.unit < 0) errors.push(`${unitLocation}: unit 必須是非負整數。`);
        requireString(unit, "title", unitLocation, errors);
        requireString(unit, "description", unitLocation, errors);
        if (unit.code !== undefined && (typeof unit.code !== "string" || unit.code.trim() === "")) {
          errors.push(`${unitLocation}: code 如有提供，必須是非空白字串。`);
        }
        const filenameUnit = Number(filename.match(/\d+/)[0]);
        if (unit.unit !== filenameUnit) errors.push(`${unitLocation}: unit 與檔名編號不一致。`);
        validateDate(unit.updated, unitLocation, errors);
        validateMaterials(unit.materials, unitLocation, errors);
        validateSupplements(unit.supplements, unitLocation, errors);
      }
      units.push(unit);
    }

    const unitNumbers = units.map((unit) => unit.unit);
    const unitCodes = units.map((unit) => unit.code).filter(Boolean);
    if (unitNumbers[0] !== 0) errors.push(`${courseLocation}: 課程必須從第 0 單元開始。`);
    if (new Set(unitNumbers).size !== unitNumbers.length) errors.push(`${courseLocation}: 單元編號不得重複。`);
    if (new Set(unitCodes).size !== unitCodes.length) errors.push(`${courseLocation}: 單元 code 不得重複。`);
    course.units = units.sort((a, b) => a.unit - b.unit);
    courses.push(course);
  }

  const slugs = courses.map((course) => course.slug);
  if (new Set(slugs).size !== slugs.length) errors.push("content/courses: 課程 slug 不得重複。");
  const orders = courses.map((course) => course.order);
  if (new Set(orders).size !== orders.length) errors.push("content/courses: 課程 order 不得重複。");

  if (errors.length > 0) {
    throw new Error(`內容驗證失敗：\n- ${errors.join("\n- ")}`);
  }
  courses.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  return { site, courses };
}
