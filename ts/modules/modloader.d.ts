/** @param {string} path Path to the mod's directory. */
export function add(path: string): Promise<void>;
/**
 * Loads an entire mod.
 * @param {string} path Path to a directory containing the mod.
 */
declare function loadMod(path: string): Promise<Mod>;
/**
 * Sets a callback to define how the loader shows info text.
 * @param {(info: string) => void} func Callback to handle info text.
 */
export function setInfoOutput(func: (info: string) => void): void;
/**
 * Sets the prefix mode for new items. `true` prefixes the mod's name to the item's registry name, `false` just adds it directly.
 * **By default, this is `false`.**
 * @param {boolean} value
 */
export function setPrefix(value: boolean): void;
import { Mod } from "./mod.js";
export { loadMod as load };
