// @ts-check
//Basics
import { addModdableRegistry, Content } from "./content.js";
import { categories, content, get, registries, tryGet, types } from "./environment.js";
import { addHandler } from "./get-content-file.js";
import { parseContent } from "./language.js";
import { Mod } from "./mod.js";
import { load, postLoad, setInfoOutput, setMods, setPrefix } from "./modloader.js";
import { RegisteredItem } from "./registry-item.js";
import { Registry, StaticRegistry, TypeRegistry } from "./registry.js";

export {
  addHandler, addModdableRegistry,
  categories,
  Content,
  content,
  get,
  load,
  Mod,
  parseContent, postLoad, RegisteredItem,
  registries,
  Registry,
  setInfoOutput, setMods, setPrefix,
  StaticRegistry,
  tryGet,
  TypeRegistry,
  types
};
/**
 * Constructs an object using types from the `Integrate.types` registry.\
 * **Only works with types extending RegisteredItem!**
 * @template {object} T
 * @param {import("./registry.js").Unconstructed<T> | string} object Object to construct, or its registry name. Can be in one of 2 forms: `registry/name` to search in `registry` for `name`, or simply `name` to search in the default `'content'` registry.
 * @param {import("./registry.js").TypedConstructor<T>} defaultType Type to use if no other can be found.
 */
export function construct(object, defaultType) {
  if (typeof object === "string") {
    // console.log(toconstruct)
    return types.construct(get(object), defaultType);
  } else {
    return types.construct(object, defaultType);
  }
}
