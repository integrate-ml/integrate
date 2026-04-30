import { RegistryRegistry, TypeRegistry } from "./registry.js";
/** Registry of all types mod content can be. */
const types = new TypeRegistry();
const registries = new RegistryRegistry();
export { registries, types };

