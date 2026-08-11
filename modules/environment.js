import { Registry, RegistryRegistry, StaticRegistry, TypeRegistry } from "./registry.js";
/** Registry of all types mod content can be. @type {TypeRegistry<object>} */
const types = new TypeRegistry();
/** Registry of categories of types mod content can be. @type {StaticRegistry<TypeRegistry<object>>} */
const categories = new StaticRegistry();
/** All moddable registries. */
const registries = new RegistryRegistry();
/** Default registry for content that doesn't specify a location. */
export const content = new Registry();
registries.add("content", content);

/** Gets an object from any moddable registries. Uses file path notation: `blocks/wall` gets the content named `wall` from the registry `blocks`.
 * @param {string} name
 * @param {string} [base] Optional base to resolve unfound references against.
 */
export function get(name, base) {
  const dot = name.indexOf("/");
  if (dot !== -1) {
    const rn = name.substring(0, dot),
      reg = registries.get(rn),
      nam = name.substring(dot + 1);
    let got = reg.tryGet(nam);
    if (base && !got) got = reg.tryGet(`${base}:${nam}`);
    if (!got)
      throw new ReferenceError(
        `Item '${nam}' is not present in the '${rn}' registry${base ? ` (and neither was '${base}:${nam}')` : ""}`,
      );
    return got;
  }
  return content.get(name);
}
/** Tries to get an object from any moddable registries. Uses file path notation: `blocks/wall` gets the content named `wall` from the registry `blocks`.\
 * Returns `null` if no object was found, or the registry was not present.
 * @param {string} name
 * @param {string} [base] Optional base to resolve unfound references against.
 */
export function tryGet(name, base) {
  const dot = name.indexOf("/");
  if (dot !== -1) {
    const rn = name.substring(0, dot),
      reg = registries.tryGet(rn),
      nam = name.substring(dot + 1);
    if (!reg) return null;
    let got = reg.tryGet(nam);
    if (base && !got) got = reg.tryGet(`${base}:${nam}`);

    return got;
  }
  return content.tryGet(name);
}

export { categories, registries, types };

