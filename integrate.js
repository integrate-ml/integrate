// @ts-check
//Basics
import { registries, types } from "./modules/environment.js";
import { addModdableRegistry, Content } from "./modules/modcontent.js";
import { add, load, setInfoOutput, setPrefix } from "./modules/modloader.js";
import { RegisteredItem } from "./modules/registry-item.js";
import { Registry } from "./modules/registry.js";

export {
  add,
  addModdableRegistry,
  Content,
  load,
  RegisteredItem,
  registries,
  Registry,
  setInfoOutput,
  setPrefix,
  types
};

/**
 * Constructs an object using types from the `Integrate.types` registry.\
 * **Only works with types extending RegisteredItem!**
 * @template T
 * @param {import("./modules/registry.js").Unconstructed<T> | string} object Object to construct, or its registry name. Registry names will be searched for through any moddable registry, searching the first registry added first.
 * @param {import("./modules/registry.js").ctor} defaultType Type to use if no other can be found.
 */
function construct(object, defaultType = Object) {
  if (typeof object === "string") {
    const toconstruct = getFromAnyRegistry(object);
    // console.log(toconstruct)
    return types.construct(toconstruct, defaultType);
  } else {
    return types.construct(object, defaultType);
  }
}
/**
 * @param {string} name
 */
function getFromAnyRegistry(name) {
  for (const { value } of registries) {
    if (value.has(name)) return value.get(name);
  }
  throw new ReferenceError(
    "Item " + name + " does not exist in any registry! Consider checking your spelling.",
  );
}
export { construct };

