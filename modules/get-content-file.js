// @ts-check

import { Content, CustomContent } from "./content.js";
import { parseContent } from "./language.js";

/**
 * @param {string} path
 */
export async function getDefFromFile(path = "") {
  try {
    const txt = await (await fetch("" + new URL(path, globalThis.location.toString()).href)).text();
    const obj = parseContent(txt);
    return obj;
  } catch (error) {
    console.warn(`Could not load [${path}]:`, error);
    return null;
  }
}
/**
 * @param {string} path
 */
export async function getJSONFromFile(path = "") {
  try {
    const txt = await (await fetch("" + new URL(path, globalThis.location.toString()).href)).text();
    const obj = JSON.parse(txt);
    return obj;
  } catch (error) {
    console.warn(`Could not load [${path}]:`, error);
    return null;
  }
}

/** @typedef {{ transformer: (file: Uint8Array<ArrayBuffer>, path:string) => any, disableAnalysis: boolean, disablePrefixes: boolean }} FileHandler */

/** @type {Map<string, FileHandler>} */
const handlers = new Map();

/**
 * Adds a new handler for a custom file type. \
 * For example,
 * ```js
 * addHandler("png", bytes => new Image(bytes));
 * ```
 * adds a handler for `.png` content files, which creates `Image` instances from the file.
 * @param {string} extension File extension, without the dot.
 * @param {FileHandler} handler Function to convert the file's bytes to the desired object.
 */
export function addHandler(extension, handler) {
  const ext = `${extension}`;
  if (!handlers.has(ext)) handlers.set(ext, handler);
  else throw new SyntaxError(`Cannot add clashing handler for '${ext}'`);
}
/**
 * @param {string} path
 */
export async function getCustomFile(path = "") {
  try {
    const truePath = new URL(path, globalThis.location.toString()).href;
    const ext = truePath.substring(truePath.lastIndexOf(".") + 1);
    const bytes = await (await fetch(truePath)).bytes();
    const handler = handlers.get(ext);

    if (handler) {
      const content = new CustomContent(
        handler.transformer ? handler.transformer(bytes, truePath) : {},
      );
      content.disableAnalysis = !!(handler.disableAnalysis ?? false);
      content.disablePrefixes = !!(handler.disablePrefixes ?? false);
      return content;
    }

    console.error(
      `Unrecognised file type [${ext}] - add a handler with 'Integrate.addHandler("${ext}", bytes => ...)'`,
    );
  } catch (error) {
    console.warn(`Could not load [${path}]:`, error);
  }
  return null;
}
export async function getJSONContent(path = "") {
  return new Content(await getJSONFromFile(path));
}
export async function getIdefContent(path = "") {
  return new Content(await getDefFromFile(path));
}
