import { add } from "./modules/modloader.js";
import { addModdableRegistry } from "./modules/modcontent.js";
import { Content } from "./modules/modcontent.js";
import { load } from "./modules/modloader.js";
import { RegisteredItem } from "./modules/registry-item.js";
import { registries } from "./modules/environment.js";
import { Registry } from "./modules/registry.js";
import { setInfoOutput } from "./modules/modloader.js";
import { setPrefix } from "./modules/modloader.js";
import { types } from "./modules/environment.js";
/**
 * Constructs an object using types from the `Integrate.types` registry.\
 * **Only works with types extending RegisteredItem!**
 * @template T
 * @param {import("./modules/registry.js").Unconstructed<T> | string} object Object to construct, or its registry name. Registry names will be searched for through any moddable registry, searching the first registry added first.
 * @param {import("./modules/registry.js").ctor} defaultType Type to use if no other can be found.
 */
export function construct<T>(object: import("./modules/registry.js").Unconstructed<T> | string, defaultType?: import("./modules/registry.js").ctor): object;
export { add, addModdableRegistry, Content, load, RegisteredItem, registries, Registry, setInfoOutput, setPrefix, types };
