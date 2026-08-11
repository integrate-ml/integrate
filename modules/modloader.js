// @ts-check

import { Content } from "./content.js";
import { registries } from "./environment.js";
import { getCustomFile, getDefFromFile, getJSONFromFile } from "./get-content-file.js";
import { RegistryReference } from "./language.js";
import { Mod } from "./mod.js";

let info = console.log;

let currentPath = globalThis.location.href;
let prefix = false;
/**
 * @param {string} path Path to search for the file at.
 * @param {string} name Registry name of the content at that location.
 * @param {string} registry Name of the registry to add the content to.
 * @returns
 */
async function loadContentFile(path, name, registry) {
  info(`Fetching content: ${name} [at ${path}]`);
  const pth = makeAbsolute(path);
  let content = null;
  if (pth.endsWith(".json")) content = new Content(await getJSONFromFile(pth));
  else if (pth.endsWith(".idef")) content = new Content(await getDefFromFile(pth));
  else content = await getCustomFile(pth);

  if (!content)
    throw new ReferenceError(`Mod content file [at ${path}] is either empty or not found.`);
  content.name = name;
  content.registry = registry;
  return content;
}
/**
 * Loads an entire mod.
 * @param {string} path Path to a directory containing the mod.
 */
async function loadMod(path) {
  resetPath();
  //##### SETUP #####
  let root = makeAbsolute(path) + "/";
  let definitionPath = "";
  let mod = new Mod();

  info(`|| LOADING MOD FROM ${root} ||`);
  try {
    //##### GET MOD #####

    let modJSON = await getJSONFromFile(root + "mod.json");
    if (!modJSON) throw new ReferenceError("Mod contains no mod.json file!");
    info(`| MOD FILE LOCATED |`);

    //##### BASIC FEATURES #####
    info("| STAGE 1: DETAILS |");
    //No construct() here for security
    if (modJSON.name) mod.name = modJSON.name;
    else throw new SyntaxError('mod.json must define mod ID! ("name")');
    if (modJSON.displayName) mod.displayName = modJSON.displayName;
    if (modJSON.author) mod.author = modJSON.author;
    if (modJSON.version) mod.version = modJSON.version;
    if (modJSON.tagline) mod.tagline = modJSON.tagline;
    if (modJSON.description) mod.description = modJSON.description;
    if (modJSON.definitions) definitionPath = modJSON.definitions;
    else throw new SyntaxError("mod.json must define the path to the definition file!");

    info(
      `Got info: ${mod.displayName} (${mod.name}) ${mod.version} by ${mod.author}: '${mod.tagline}'`,
    );

    //##### DEFINITIONS #####
    info("| STAGE 2: DEFINITIONS |");
    let definitions = [];
    if (typeof definitionPath === "string") {
      definitionPath = makeAbsoluteRelativeTo(root, definitionPath);
      definitions = await getJSONFromFile(definitionPath);
    } else {
      definitions = definitionPath;
      definitionPath = root;
    }
    if (!definitions)
      throw new ReferenceError(
        `Definition file [at ${definitionPath}] is either empty or not found.`,
      );
    if (!Array.isArray(definitions))
      throw new SyntaxError("Definition file (or property) must contain only a single array.");

    info(`${definitions.length} definitions`);
    let contents = [];
    for (let entry of definitions) {
      if (typeof entry === "object") {
        if (!entry.path)
          throw new SyntaxError("Content definitions must contain a path to the content.");
        contents.push(entry);
      } else if (typeof entry === "string") {
        const parts = entry.split("/"),
          fname = parts.at(-1);
        const name = fname ? fname.substring(0, fname?.lastIndexOf(".")) : "item",
          registry = parts.at(-2) ?? "content";

        contents.push({ path: entry, name, registry });
      } else throw new SyntaxError("Content definitions must be objects or strings.");
      // TODO: Make this work with strings:  "../registry/name.idef" or "../registry/name.json"
      //        equivalent to { path: "../registry/name.idef", name: "name", registry: "registry" }
    }
    info(`Validated all definitions`);
    info("| STAGE 3: CONTENT |");
    for (const entry of contents) {
      let content = await loadContentFile(
        makeAbsoluteRelativeTo(definitionPath, entry.path),
        entry.name ?? "item",
        entry.registry ?? "content",
      );
      mod.content.push(content);
    }
    info(`Loaded ${mod.content.length} items`);

    info("|| MOD LOADING SUCCESSFUL ||");
  } catch (e) {
    info("|| MOD LOADING FAILED ||");
    throw e;
  }
  mods.push(mod);
  return mod;
}

export function unloadMods() {
  mods.splice(1);
}

/** Unloads existing mods, loads the specified mods and performs post-loading. Useful for compact loading of a known list. @param {...string} paths Paths to mods, as you would pass them to {@linkcode loadMod} */
export async function setMods(...paths) {
  mods.splice(1);
  for (const path of paths) {
    await loadMod(path);
  }
  postLoad();
}

/** @type {Mod[]} */
const mods = [];

function postLoadClean() {
  info("| POST-LOAD STAGE 0: PREPARATION |");
  registries.forEach((r) => {
    r.destroy();
  });
  info(`Cleared registries`);
}
function postLoadPrefixes() {
  info("| POST-LOAD STAGE 1: PREFIXES |");
  if (prefix)
    for (const mod of mods) {
      info(`| PREFIXES [${mod.displayName}] |`);
      for (const content of mod.content) {
        if (content.disablePrefixes) continue;
        const cn = content.name,
          pf = `${mod.name}:`;
        if (!cn.startsWith(pf)) content.name = pf + cn;

        info(`Prefixed [${cn}] -> [${content.name}]`);
      }
    }
  else info("| PREFIXES DISABLED |");
}
function postLoadImpl() {
  info("| POST-LOAD STAGE 2: REGISTRY |");
  for (const mod of mods) {
    info(`| REGISTRY [${mod.displayName}] |`);
    for (const content of mod.content) {
      info(`Implementing [${content.name}]`);
      content.implement();
    }
  }
}
function postLoadRefs() {
  info("| POST-LOAD STAGE 3: REFERENCES |");
  for (const mod of mods) {
    info(`| REFERENCES [${mod.displayName}] |`);
    for (const content of mod.content) {
      if (content.disableAnalysis) continue;
      info(`Resolving references for [${content.name}]`);
      RegistryReference.dereference(content, mod.name);
    }
  }
}

/** Adds all mods loaded. */
function postLoad() {
  info("|| POST-LOADING ALL MODS ||");
  postLoadClean();
  postLoadPrefixes();
  postLoadImpl();
  postLoadRefs();
  info("|| POST-LOAD COMPLETE ||");
}

/** @param {string} path Path to absolve (or whatever it's called) */
function makeAbsolute(path) {
  return new URL(path, currentPath).href;
}
/** @param {string} path Path to absolve (or whatever it's called) @param {string} base The base to resolve relative to.*/
function makeAbsoluteRelativeTo(base, path) {
  return new URL(path, base).href;
}
function resetPath() {
  currentPath = window.location.href;
}
/**
 * Sets the prefix mode for new items. `true` prefixes the mod's name to the item's registry name, `false` just adds it directly.
 * **By default, this is `false`.**
 * @param {boolean} value
 */
function setPrefix(value) {
  prefix = !!value;
}
/**
 * Sets a callback to define how the loader shows info text.
 * @param {(info: string) => void} func Callback to handle info text.
 */
function setInfoOutput(func) {
  if (typeof func !== "function") throw new TypeError("Cannot set info output to a non-function!");
  info = func;
}

export { loadMod as load, postLoad, setInfoOutput, setPrefix };

