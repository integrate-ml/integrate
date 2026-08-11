// @ts-check
import { registries, types } from "./environment.js";
import { Registry } from "./registry.js";

//Content
class Content {
  /** @param {object} v  */
  constructor(v) {
    this.value = v;
  }
  /** Name of the registry this content is to be added to. */
  registry = "content";
  /** Name of this content in registry. */
  name = "thing";
  /** The (serialisable and constructible) object used to create instances of this content. */
  value = {};
  implement() {
    //Add the stuff
    registries.get(this.registry).add(this.name, this.value);
  }
  isStatic = false;
  create() {
    return this.isStatic ? this.value : types.construct(this.value, Object);
  }
  get disableAnalysis() {
    return false;
  }
  get disablePrefixes() {
    return false;
  }
}
class CustomContent extends Content {
  // @ts-ignore
  disableAnalysis = false;
  // @ts-ignore
  disablePrefixes = false;
}

//Manipulation and Exports
/**
 * Allows mods to modify a registry, by using a certain name.
 * @deprecated Use {@linkcode registries}`.add(name, reg)` instead.
 * @template {object} T
 * @param {Registry<T>} reg Registry to add.
 * @param {string} name Name of the registry, to be used in mod content.
 */
function addModdableRegistry(reg, name) {
  //Funny, isn't it?
  registries.add(name, reg);
}
export { addModdableRegistry, Content, CustomContent };

