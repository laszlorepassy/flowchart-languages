// Checks the language files of Folyamatábrázoló (languages/<code>.json)
// against the English reference (languages/en.json). Plain Node.js, no
// dependencies: the app's build (build.mjs) imports it, and the public
// flowchart-languages repository runs the same file for every pull request.
//
//   node tools/languages.mjs [languages dir]   check every file, exit 1 on an error
//
// Errors (the file can't be used): invalid JSON, a missing or malformed
// "language" block, a file name that doesn't match its code, a message or
// help text that isn't a string, a message key the reference doesn't have, a
// message whose {placeholders} differ from the English one, a help section
// that is neither text nor a table, a table row of the wrong width.
// Warnings (the file works, English fills the gaps): messages or help parts
// that are not translated yet.
import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const REFERENCE = 'en';
const CODE_RE = /^[a-z]{2,3}(-[A-Z]{2})?$/;
const PLACEHOLDER_RE = /\{([A-Za-z][A-Za-z0-9]*)\}/g;
const DOWNLOAD_KINDS = ['appImage', 'deb', 'exe', 'msi'];

/** The {placeholders} of a text, sorted and without repeats. */
export function placeholders(text) {
  return [...new Set([...String(text).matchAll(PLACEHOLDER_RE)].map((m) => m[1]))].sort();
}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isString = (v) => typeof v === 'string';
const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * Checks one parsed language file. `reference` is the parsed en.json (or
 * null when checking en.json itself); `fileName` its file name, e.g. "de.json".
 * Returns { errors: string[], warnings: string[] }.
 */
export function checkLanguage(data, reference, fileName) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);

  if (!isObject(data)) return { errors: ['the file must contain one JSON object'], warnings };

  // "language": who the file is for, and who made it.
  const lang = data.language;
  if (!isObject(lang)) err('missing "language" block');
  else {
    if (!isString(lang.code) || !CODE_RE.test(lang.code)) err('"language.code" must be a language code such as "de" or "pt-BR"');
    else if (fileName && fileName !== `${lang.code}.json`) err(`the file must be named ${lang.code}.json (after "language.code")`);
    for (const key of ['name', 'nativeName']) {
      if (!isString(lang[key]) || !lang[key].trim()) err(`"language.${key}" must be a non-empty text`);
    }
    if (!Array.isArray(lang.translators) || !lang.translators.length || !lang.translators.every(isString)) {
      err('"language.translators" must list the translators\' names, e.g. ["Anna Kovács"]');
    }
  }

  // "messages": the user interface texts.
  const messages = data.messages;
  const refMessages = reference ? reference.messages : null;
  if (!isObject(messages)) err('missing "messages" block');
  else {
    for (const [key, text] of Object.entries(messages)) {
      if (!isString(text)) { err(`message "${key}" must be a text`); continue; }
      if (!refMessages) continue;
      if (!(key in refMessages)) { err(`unknown message "${key}" (not in ${REFERENCE}.json; check the spelling)`); continue; }
      const want = placeholders(refMessages[key]);
      const got = placeholders(text);
      if (!sameList(want, got)) {
        err(`message "${key}" must use the placeholders ${want.map((p) => `{${p}}`).join(' ') || '(none)'}, `
          + `not ${got.map((p) => `{${p}}`).join(' ') || '(none)'}`);
      }
    }
    if (refMessages) {
      const missing = Object.keys(refMessages).filter((k) => !(k in messages));
      if (missing.length) {
        const shown = missing.slice(0, 15).join(', ') + (missing.length > 15 ? `, … (${missing.length - 15} more)` : '');
        warn(`${missing.length} message(s) not translated yet (English is shown): ${shown}`);
      }
    }
  }

  // "help": the help page (optional; English is shown without it).
  const help = data.help;
  if (help === undefined) warn('no "help" block: the help page is shown in English');
  else if (!isObject(help)) err('"help" must be an object');
  else checkHelp(help, reference && isObject(reference.help) ? reference.help : null, err, warn);

  return { errors, warnings };
}

function checkHelp(help, refHelp, err, warn) {
  if (!Array.isArray(help.sections) || !help.sections.length) err('"help.sections" must be a non-empty list');
  else {
    help.sections.forEach((s, i) => {
      const where = `help section ${i + 1}`;
      if (!isObject(s) || !isString(s.title)) { err(`${where} needs a "title" text`); return; }
      if ('table' in s) {
        const tbl = s.table;
        if (!isObject(tbl) || !Array.isArray(tbl.head) || !tbl.head.every(isString) || !Array.isArray(tbl.rows)) {
          err(`${where} ("${s.title}"): "table" needs "head" (texts) and "rows"`); return;
        }
        tbl.rows.forEach((row, r) => {
          if (!Array.isArray(row) || !row.every(isString) || row.length !== tbl.head.length) {
            err(`${where} ("${s.title}"), row ${r + 1}: ${tbl.head.length} texts expected, like "head"`);
          }
        });
        if ('codeColumns' in tbl && (!Array.isArray(tbl.codeColumns) || !tbl.codeColumns.every((c) => Number.isInteger(c) && c >= 0 && c < tbl.head.length))) {
          err(`${where} ("${s.title}"): "codeColumns" must list column numbers from 0`);
        }
      } else if (Array.isArray(s.content)) {
        s.content.forEach((part, p) => {
          if (!isString(part) && !(Array.isArray(part) && part.every(isString))) {
            err(`${where} ("${s.title}"), part ${p + 1}: a text (paragraph) or a list of texts (bullets) expected`);
          }
        });
      } else err(`${where} ("${s.title}") needs "content" (paragraphs) or "table"`);
    });
    if (refHelp && Array.isArray(refHelp.sections) && help.sections.length !== refHelp.sections.length) {
      warn(`the help has ${help.sections.length} sections, the English one ${refHelp.sections.length}: check that none is missing`);
    }
  }
  if ('examReplacements' in help) {
    const ex = help.examReplacements;
    if (!isObject(ex) || !Object.values(ex).every(isString)) err('"help.examReplacements" must map texts to texts');
  } else warn('no "help.examReplacements": the exam edition shows the help lines about examples and updates unchanged');
  if ('download' in help) {
    const d = help.download;
    if (!isObject(d)) { err('"help.download" must be an object'); return; }
    for (const key of ['title', 'lead', 'action']) if (!isString(d[key])) err(`"help.download.${key}" must be a text`);
    if (isString(d.title) && !placeholders(d.title).includes('version')) err('"help.download.title" must contain {version}');
    if (!Array.isArray(d.points) || !d.points.every((p) => isObject(p) && isString(p.title) && isString(p.text))) {
      err('"help.download.points" must be a list of { "title", "text" }');
    }
    for (const kind of DOWNLOAD_KINDS) {
      const b = d[kind];
      if (!isObject(b) || !isString(b.label) || !isString(b.note)) err(`"help.download.${kind}" needs "label" and "note" texts`);
      else if (placeholders(b.note).some((p) => p !== 'file' && p !== 'version')) err(`"help.download.${kind}.note" may only use {file} and {version}`);
    }
  } else warn('no "help.download": the download panel is shown in English');
}

/**
 * Reads and checks every languages/*.json. Returns
 * { files: [{ fileName, data }], problems: [{ fileName, errors, warnings }] }
 * with en.json first; a file that isn't valid JSON has data === null.
 */
export function checkDirectory(dir) {
  const names = readdirSync(dir).filter((f) => f.endsWith('.json')).sort((a, b) =>
    (a === `${REFERENCE}.json` ? -1 : b === `${REFERENCE}.json` ? 1 : a.localeCompare(b)));
  if (!names.includes(`${REFERENCE}.json`)) throw new Error(`${dir}/${REFERENCE}.json (the reference) is missing`);
  const files = [];
  const problems = [];
  let reference = null;
  for (const fileName of names) {
    let data = null;
    try {
      data = JSON.parse(readFileSync(path.join(dir, fileName), 'utf8'));
    } catch (e) {
      problems.push({ fileName, errors: [`not valid JSON: ${e.message}`], warnings: [] });
      files.push({ fileName, data: null });
      continue;
    }
    if (fileName === `${REFERENCE}.json`) reference = data;
    const { errors, warnings } = checkLanguage(data, fileName === `${REFERENCE}.json` ? null : reference, fileName);
    problems.push({ fileName, errors, warnings });
    files.push({ fileName, data });
  }
  return { files, problems };
}

// Command line: node tools/languages.mjs [dir]
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2] || 'languages';
  const { problems } = checkDirectory(dir);
  let failed = false;
  for (const { fileName, errors, warnings } of problems) {
    console.log(`${errors.length ? '✗' : '✓'} ${fileName}`);
    for (const e of errors) console.log(`    ERROR: ${e}`);
    for (const w of warnings) console.log(`    note: ${w}`);
    if (errors.length) failed = true;
  }
  console.log(failed ? '\nSome files have errors: fix the ERROR lines above.' : '\nAll language files are valid.');
  process.exit(failed ? 1 : 0);
}
