// @ts-check

import { categories, types } from "./environment.js";
import { RegisteredItem } from "./registry-item.js";

/** @template T @typedef {{ [K in keyof T]: T[K] extends Function ? never : K }[keyof T]} FieldsOf */
/** @template T @typedef {Partial<Pick<T, FieldsOf<T>>> & { type?: string, registryName?: string }} Unconstructed */
/** @typedef {new () => any} Constructor */
/** @template T @typedef {new () => T} TypedConstructor<T> */

/**
 * Data structure for holding **unique, case-insensitive** key-value pairs.
 * @template {object} T
 */
class Registry {
  // Internal Map for holding the registry items.
  /**@type {Map<string, Unconstructed<T>>} */
  #content = new Map();
  // holds aliased names
  /**@type {Map<string, string>} */
  #aliases = new Map();
  get size() {
    //Get size of the internal Map.
    return this.#content.size;
  }
  /** Removes all content. */
  destroy(){
    this.#content.clear();
    this.#aliases.clear();
  }
  /** Adds an item to registry.
   * @param {string} name Registry name of item. This is not case sensitive.
   * @param {Unconstructed<T>} item Item to add to registry.
   */
  add(name, item) {
    name = Registry.#processName(name);
    if (!item) throw new TypeError("Registries cannot contain null");
    //Throw an error if the item already exists.
    if (this.has(name))
      throw new SyntaxError(
        `Item ${name} already exists in registry! Consider using a different name.`,
      );
    //Add to internal Map
    item.registryName = name;
    this.#content.set(name, item);
  }
  /**
   * Checks for an item in registry.
   * @param {string} name Registry name to check for. Not case sensitive.
   * @returns Whether or not the name exists.
   */
  has(name, excludeAliases = false) {
    if (!name) return false;
    name = Registry.#processName(name);
    //Return presence
    return (
      this.#content.has(name) ||
      (!excludeAliases && this.#aliases.has(name) && !!this.#aliases.get(name))
    );
  }
  /**
   * Gets an item from registry name.
   * @param {string} [name=""] Registry name to get. Not case sensitive.
   * @returns {Unconstructed<T>?} The item, if present.
   */
  tryGet(name = "") {
    if (!name) return null;
    name = Registry.#processName(name);
    //Throw an error if the item doesn't exist.
    //Return item, if it exists.
    let item = this.#content.get(name);
    if (!item) item = this.#content.get(this.#aliases.get(name) ?? name);
    return item ?? null;
  }
  /**
   * Gets an item from registry name.
   * @param {string} [name=""] Registry name to get. Not case sensitive.
   * @returns {Unconstructed<T>} The item, if present.
   */
  get(name = "") {
    if (!name) throw new ReferenceError("No registry contains null!");
    name = Registry.#processName(name);
    //Throw an error if the item doesn't exist.
    //Return item, if it exists.
    let item = this.#content.get(name);
    if (!item) item = this.#content.get(this.#aliases.get(name) ?? name);
    if (item) {
      return item;
    } else
      throw new ReferenceError(
        `Item ${name} does not exist in registry! Consider checking your spelling.`,
      );
  }
  /**
   * Renames a registry item. Neither parameter is case-sensitive.
   * @param {string} name Registry name to change.
   * @param {string} newName What to change the name to.
   */
  rename(name, newName) {
    name = Registry.#processName(name);
    //Throw an error if the item doesn't exist.
    if (!this.has(name))
      throw new ReferenceError(
        `Item ${name} does not exist in registry! Consider checking your spelling.`,
      );
    //Get entry
    let current = this.get(name);
    //Remove current entry
    this.#content.delete(name);
    //Add new entry
    this.add(newName, current);
  }
  /**
   * Adds another registry item with the same content as the specified one.\
   * Can't alias other aliases.
   * @param {string} name Registry name to change.
   * @param {string} as What to change the name to.
   */
  alias(name, as) {
    name = Registry.#processName(name);
    //Throw an error if the item doesn't exist.
    if (!this.has(name, true))
      throw new ReferenceError(
        `Item ${name} does not exist in registry! Consider checking your spelling.`,
      );
    //Add alias
    this.#aliases.set(as, name);
    // console.log(`added alias ${as} for ${name}`, this.#aliases);
  }
  /**
   * Gets an array of aliases for a specified name.
   * @param {string} name Registry name to look for.
   */
  aliasesFor(name) {
    name = Registry.#processName(name);
    let aliases = [];
    for (let al of this.#aliases.entries()) {
      if (al[1] === name) aliases.push(al[0]);
    }
    return aliases;
  }
  /**
   * Gets the original name for an alias.
   * @param {string} alias Alias to get the original name for.
   */
  dealias(alias) {
    alias = Registry.#processName(alias);
    if (!this.has(alias))
      throw new ReferenceError(
        `Item ${alias} does not exist in registry! Consider checking your spelling.`,
      );
    return this.#aliases.get(alias) || alias;
  }
  /**
   * Performs a function on each item in registry.
   * @param {(item: Unconstructed<T>, name: string) => void} callback Function to perform on each item.
   */
  forEach(callback) {
    for (let v of this.#content) {
      void callback(v[1], v[0]);
    }
  }
  /**
   * Performs a function on each item in registry, and returns a new registry with the projected items.
   * @template {T} V
   * @param {(item: Unconstructed<T>, name: string) => Unconstructed<V>} callback Function to perform on each item.
   */
  map(callback) {
    /**@type {Registry<V>} */
    let newreg = new Registry();
    this.#content.forEach((value, key) => newreg.add(key, callback(value, key)));
    return newreg;
  }
  /**
   * Performs a function on each item in registry asynchronously.
   * @param {(item: Unconstructed<T>, name: string) => void} callback Function to perform on each item.
   */
  async forEachAsync(callback) {
    for (let v of this.#content) {
      void (await callback(v[1], v[0]));
    }
  }
  /**
   * Gets the item an a certain index in the registry.
   * @param {number} index Zero-based index of the item to get.
   * @returns The registry name at the index.
   */
  at(index) {
    if (index >= this.#content.size)
      throw new RangeError(`Index ${index} out of bounds for registry length ${this.size}`);
    let iter = this.#content.keys();
    let count = 0;
    for (const entry of iter) {
      if (count == index) return entry;
      count++;
    }
  }
  /**@param {string|undefined} name  */
  static #processName(name) {
    if (!name) throw new TypeError("Registry name must be defined");
    const ns = `${name}`;
    if (hasNonAscii(ns)) throw new TypeError("Registry names may only contain ASCII characters");
    return ns.toLowerCase();
  }
  /**@param {string} name  */
  static isValidName(name) {
    return typeof name === "string" && !hasNonAscii(name);
  }
  /**
   * Constructs an item from this registry, using a type from another registry.
   * @param {string} name Name of item to construct.
   * @param {TypeRegistry<T>} registry Registry for the type of the item.
   * @param {TypedConstructor<T>} defaultType Constructor function or class to use if there's no defined type.
   */
  create(name, registry, defaultType) {
    return construct(this.get(name), registry, defaultType);
  }
  *[Symbol.iterator]() {
    for (let item of this.#content) {
      yield { key: item[0], value: item[1] };
    }
  }
  /**
   * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
   * @param {T} item Item to search for.
   * @returns {string | null} Null if no entry with the item exists, the corresponding name otherwise.
   */
  nameOf(item) {
    for (let v of this.#content) {
      if (v[1] === item) return v[0];
    }
    return null;
  }
}
/**
 * Data structure for holding **unique, case-insensitive** key-value pairs.
 * @template {object} T
 */
class StaticRegistry {
  // Internal Map for holding the registry items.
  /**@type {Map<string, T>} */
  #content = new Map();
  // holds aliased names
  /**@type {Map<string, string>} */
  #aliases = new Map();
  get size() {
    //Get size of the internal Map.
    return this.#content.size;
  }
  /** Removes all content. */
  destroy(){
    this.#content.clear();
    this.#aliases.clear();
  }
  /** Adds an item to registry.
   * @param {string} name Registry name of item. This is not case sensitive.
   * @param {T} item Item to add to registry.
   */
  add(name, item) {
    name = StaticRegistry.#processName(name);
    if (!item) throw new TypeError("Registries cannot contain null");
    //Throw an error if the item already exists.
    if (this.has(name))
      throw new SyntaxError(
        `Item ${name} already exists in registry! Consider using a different name.`,
      );
    //Add to internal Map
    if ("registryName" in item) item.registryName = name;
    this.#content.set(name, item);
  }
  /**
   * Checks for an item in registry.
   * @param {string} name Registry name to check for. Not case sensitive.
   * @returns Whether or not the name exists.
   */
  has(name, excludeAliases = false) {
    if (!name) return false;
    name = StaticRegistry.#processName(name);
    //Return presence
    return (
      this.#content.has(name) ||
      (!excludeAliases && this.#aliases.has(name) && !!this.#aliases.get(name))
    );
  }
  /**
   * Gets an item from registry name.
   * @param {string} [name=""] Registry name to get. Not case sensitive.
   * @returns {T?} The item, if present.
   */
  tryGet(name = "") {
    if (!name) return null;
    name = StaticRegistry.#processName(name);
    //Throw an error if the item doesn't exist.
    //Return item, if it exists.
    let item = this.#content.get(name);
    if (!item) item = this.#content.get(this.#aliases.get(name) ?? name);
    return item ?? null;
  }
  /**
   * Gets an item from registry name.
   * @param {string} [name=""] Registry name to get. Not case sensitive.
   * @returns {T} The item, if present.
   */
  get(name = "") {
    if (!name) throw new ReferenceError("No registry contains null!");
    name = StaticRegistry.#processName(name);
    //Throw an error if the item doesn't exist.
    //Return item, if it exists.
    let item = this.#content.get(name);
    if (!item) item = this.#content.get(this.#aliases.get(name) ?? name);
    if (item) {
      return item;
    } else
      throw new ReferenceError(
        `Item ${name} does not exist in registry! Consider checking your spelling.`,
      );
  }
  /**
   * Renames a registry item. Neither parameter is case-sensitive.
   * @param {string} name Registry name to change.
   * @param {string} newName What to change the name to.
   */
  rename(name, newName) {
    name = StaticRegistry.#processName(name);
    //Throw an error if the item doesn't exist.
    if (!this.has(name))
      throw new ReferenceError(
        `Item ${name} does not exist in registry! Consider checking your spelling.`,
      );
    //Get entry
    let current = this.get(name);
    //Remove current entry
    this.#content.delete(name);
    //Add new entry
    this.add(newName, current);
  }
  /**
   * Adds another registry item with the same content as the specified one.\
   * Can't alias other aliases.
   * @param {string} name Registry name to change.
   * @param {string} as What to change the name to.
   */
  alias(name, as) {
    name = StaticRegistry.#processName(name);
    //Throw an error if the item doesn't exist.
    if (!this.has(name, true))
      throw new ReferenceError(
        `Item ${name} does not exist in registry! Consider checking your spelling.`,
      );
    //Add alias
    this.#aliases.set(as, name);
    // console.log(`added alias ${as} for ${name}`, this.#aliases);
  }
  /**
   * Gets an array of aliases for a specified name.
   * @param {string} name Registry name to look for.
   */
  aliasesFor(name) {
    name = StaticRegistry.#processName(name);
    let aliases = [];
    for (let al of this.#aliases.entries()) {
      if (al[1] === name) aliases.push(al[0]);
    }
    return aliases;
  }
  /**
   * Gets the original name for an alias.
   * @param {string} alias Alias to get the original name for.
   */
  dealias(alias) {
    alias = StaticRegistry.#processName(alias);
    if (!this.has(alias))
      throw new ReferenceError(
        `Item ${alias} does not exist in registry! Consider checking your spelling.`,
      );
    return this.#aliases.get(alias) || alias;
  }
  /**
   * Performs a function on each item in registry.
   * @param {(item: Unconstructed<T>, name: string) => void} callback Function to perform on each item.
   */
  forEach(callback) {
    for (let v of this.#content) {
      void callback(v[1], v[0]);
    }
  }
  /**
   * Performs a function on each item in registry, and returns a new registry with the projected items.
   * @template {T} V
   * @param {(item: T, name: string) => V} callback Function to perform on each item.
   */
  map(callback) {
    /**@type {Registry<V>} */
    let newreg = new Registry();
    this.#content.forEach((value, key) => newreg.add(key, callback(value, key)));
    return newreg;
  }
  /**
   * Performs a function on each item in registry asynchronously.
   * @param {(item: T, name: string) => void} callback Function to perform on each item.
   */
  async forEachAsync(callback) {
    for (let v of this.#content) {
      void (await callback(v[1], v[0]));
    }
  }
  /**
   * Gets the item an a certain index in the registry.
   * @param {number} index Zero-based index of the item to get.
   * @returns The registry name at the index.
   */
  at(index) {
    if (index >= this.#content.size)
      throw new RangeError(`Index ${index} out of bounds for registry length ${this.size}`);
    let iter = this.#content.keys();
    let count = 0;
    for (const entry of iter) {
      if (count == index) return entry;
      count++;
    }
  }
  /**@param {string|undefined} name  */
  static #processName(name) {
    if (!name) throw new TypeError("Registry name must be defined");
    const ns = `${name}`;
    if (hasNonAscii(ns)) throw new TypeError("Registry names may only contain ASCII characters");
    return ns.toLowerCase();
  }
  /**@param {string} name  */
  static isValidName(name) {
    return typeof name === "string" && !hasNonAscii(name);
  }
  /**
   * Constructs an item from this registry, using a type from another registry.
   * @param {string} name Name of item to construct.
   * @param {TypeRegistry<T>} registry Registry for the type of the item.
   * @param {TypedConstructor<T>} defaultType Constructor function or class to use if there's no defined type.
   */
  create(name, registry, defaultType) {
    return construct(this.get(name), registry, defaultType);
  }
  *[Symbol.iterator]() {
    for (let item of this.#content) {
      yield { key: item[0], value: item[1] };
    }
  }
  /**
   * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
   * @param {T} item Item to search for.
   * @returns {string | null} Null if no entry with the item exists, the corresponding name otherwise.
   */
  nameOf(item) {
    for (let v of this.#content) {
      if (v[1] === item) return v[0];
    }
    return null;
  }
}

/** A simpler `Registry` for holding types. Only has a subset of `Registry`'s available features. @template {object} T */
class TypeRegistry {
  // Internal Map for holding the registry items.
  /**@type {Map<string, TypedConstructor<T>>} */
  #content = new Map();
  get size() {
    //Get size of the internal Map.
    return this.#content.size;
  }
  /** Removes all content. */
  destroy(){
    this.#content.clear();
  }
  /** Adds an item to registry.
   * @param {string} name Registry name of item. This is not case sensitive.
   * @param {TypedConstructor<T>} item Item to add to registry.
   */
  add(name, item) {
    name = TypeRegistry.#processName(name);
    if (!item) throw new TypeError("Registries cannot contain null");
    //Throw an error if the item already exists.
    if (this.has(name))
      throw new SyntaxError(
        `Type ${name} already exists in registry! Consider using a different name.`,
      );
    //Add to internal Map
    this.#content.set(name, item);
  }
  /**
   * Checks for an item in registry.
   * @param {string} name Registry name to check for. Not case sensitive.
   * @returns Whether or not the name exists.
   */
  has(name) {
    if (!name) return false;
    name = TypeRegistry.#processName(name);
    //Return presence
    return this.#content.has(name);
  }
  /**
   * Gets an item from registry name.
   * @param {string} [name=""] Registry name to get. Not case sensitive.
   * @returns {TypedConstructor<T>} The item, if present.
   */
  get(name = "") {
    if (!name) throw new ReferenceError("No registry contains null!");
    name = TypeRegistry.#processName(name);
    //Return item, if it exists.
    let item = this.#content.get(name);
    if (item) return item;
    else
      throw new ReferenceError(
        `Type ${name} does not exist in registry! Consider checking your spelling.`,
      );
  }
  /**
   * Renames a registry item. Neither parameter is case-sensitive.
   * @param {string} name Registry name to change.
   * @param {string} newName What to change the name to.
   */
  rename(name, newName) {
    name = TypeRegistry.#processName(name);
    //Throw an error if the item doesn't exist.
    if (!this.has(name))
      throw new ReferenceError(
        `Type ${name} does not exist in registry! Consider checking your spelling.`,
      );
    //Get entry
    let current = this.get(name);
    //Remove current entry
    this.#content.delete(name);
    //Add new entry
    this.add(newName, current);
  }
  /**
   * Performs a function on each item in registry.
   * @param {<V extends T>(item: TypedConstructor<V>, name: string) => void} callback Function to perform on each item.
   */
  forEach(callback) {
    for (let v of this.#content) {
      void callback(v[1], v[0]);
    }
  }
  /**
   * Performs a function on each item in registry asynchronously.
   * @param {<V extends T>(item: TypedConstructor<V>, name: string) => Promise<void>} callback Function to perform on each item.
   */
  async forEachAsync(callback) {
    for (let v of this.#content) {
      void (await callback(v[1], v[0]));
    }
  }
  /**
   * Gets the item an a certain index in the registry.
   * @param {number} index Zero-based index of the item to get.
   * @returns The registry name at the index.
   */
  at(index) {
    if (index >= this.#content.size)
      throw new RangeError(`Index ${index} out of bounds for registry length ${this.size}`);
    let iter = this.#content.keys();
    let count = 0;
    for (const entry of iter) {
      if (count == index) return entry;
      count++;
    }
  }
  /**@param {string|undefined} name  */
  static #processName(name) {
    if (!name) throw new TypeError("Registry name must be defined");
    const ns = `${name}`;
    if (hasNonAscii(ns)) throw new TypeError("Registry names may only contain ASCII characters");
    return ns.toLowerCase();
  }
  /**@param {string} name  */
  static isValidName(name) {
    return typeof name === "string" && !hasNonAscii(name);
  }
  /**
   * Constructs an item using a type from this registry. Note that this only works with objects.
   * @template {T} V
   * @param {Unconstructed<V>} object Object to construct.
   * @param {TypedConstructor<V>} defaultType Constructor function or class to use if there's no defined type.
   * @returns {T | undefined}
   */
  construct(object, defaultType) {
    return construct(object, this, defaultType ?? Object);
  }
  *[Symbol.iterator]() {
    for (let item of this.#content) {
      yield { key: item[0], value: item[1] };
    }
  }
  /**
   * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
   * @param {TypedConstructor<T>} item Item to search for.
   * @returns {string | null} Null if no entry with the item exists, the corresponding name otherwise.
   */
  nameOf(item) {
    for (let v of this.#content) {
      if (v[1] === item) return v[0];
    }
    return null;
  }
}
/** A `Registry` for holding other registries. Only has a subset of `Registry`'s available features. */
class RegistryRegistry {
  // Internal Map for holding the registry items.
  /**@type {Map<string, Registry<any>>} */
  #content = new Map();
  get size() {
    //Get size of the internal Map.
    return this.#content.size;
  }
  /** Removes all content. */
  destroy(){
    this.#content.clear();
  }
  /** Adds an item to registry.
   * @template {object} T
   * @param {string} name Registry name of item. This is not case sensitive.
   * @param {Registry<T>|undefined} item Item to add to registry. Will create a new registry if one is not provided.
   */
  add(name, item = new Registry()) {
    name = RegistryRegistry.#processName(name);
    if (!item) throw new TypeError("Registries cannot contain null");
    //Throw an error if the item already exists.
    if (this.has(name))
      throw new SyntaxError(`Registry '${name}' already defined! Consider using a different name.`);
    //Add to internal Map
    this.#content.set(name, item);
  }
  /**
   * Checks for an item in registry.
   * @param {string} name Registry name to check for. Not case sensitive.
   * @returns Whether or not the name exists.
   */
  has(name) {
    if (!name) return false;
    name = RegistryRegistry.#processName(name);
    //Return presence
    return this.#content.has(name);
  }
  /**
   * Gets an item from registry name.
   * @template T
   * @param {string} [name=""] Registry name to get. Not case sensitive.
   * @returns {Registry<T>} The item, if present.
   */
  get(name = "") {
    if (!name) throw new ReferenceError("No registry contains null!");
    name = RegistryRegistry.#processName(name);
    //Return item, if it exists.
    let item = this.#content.get(name);
    if (item) return item;
    else
      throw new ReferenceError(
        `Registry '${name}' has not been defined! Consider checking your spelling.`,
      );
  }
  /**
   * Gets an item from registry name.
   * @template T
   * @param {string} [name=""] Registry name to get. Not case sensitive.
   * @returns {Registry<T>?} The item, if present.
   */
  tryGet(name = "") {
    if (!name) throw new ReferenceError("No registry contains null!");
    name = RegistryRegistry.#processName(name);
    //Return item, if it exists.
    return this.#content.get(name) ?? null;
  }
  /**
   * Renames a registry item. Neither parameter is case-sensitive.
   * @param {string} name Registry name to change.
   * @param {string} newName What to change the name to.
   */
  rename(name, newName) {
    name = RegistryRegistry.#processName(name);
    //Get entry
    let current = this.get(name);
    //Remove current entry
    this.#content.delete(name);
    //Add new entry
    this.add(newName, current);
  }
  /**
   * Performs a function on each item in registry.
   * @param {(item: Registry<any>, name: string) => void} callback Function to perform on each item.
   */
  forEach(callback) {
    for (const [key, value] of this.#content) {
      void callback(value, key);
    }
  }
  /**
   * Performs a function on each item in registry asynchronously.
   * @param {(item: Registry<any>, name: string) => void} callback Function to perform on each item.
   */
  async forEachAsync(callback) {
    for (const [key, value] of this.#content) {
      void (await callback(value, key));
    }
  }
  /**
   * Gets the item an a certain index in the registry.
   * @param {number} index Zero-based index of the item to get.
   * @returns The registry name at the index.
   */
  at(index) {
    if (index >= this.#content.size)
      throw new RangeError(`Registry ${index} out of bounds for registry length ${this.size}`);
    let iter = this.#content.keys();
    let count = 0;
    for (const entry of iter) {
      if (count == index) return entry;
      count++;
    }
  }
  /**@param {string|undefined} name  */
  static #processName(name) {
    if (!name) throw new TypeError("Registry name must be defined");
    const ns = `${name}`;
    if (hasNonAscii(ns)) throw new TypeError("Registry names may only contain ASCII characters");
    return ns.toLowerCase();
  }
  /**@param {string} name  */
  static isValidName(name) {
    return typeof name === "string" && !hasNonAscii(name);
  }
  *[Symbol.iterator]() {
    for (let item of this.#content) {
      yield { key: item[0], value: item[1] };
    }
  }
  /**
   * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
   * @template {object} T
   * @param {Registry<T>} item Item to search for.
   * @returns {string | null} Null if no entry with the item exists, the corresponding name otherwise.
   */
  nameOf(item) {
    for (const [key, value] of this.#content) {
      if (value === item) return key;
    }
    return null;
  }
}
/**@param {string} str */
function hasNonAscii(str) {
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 31 || c > 127) return true;
  }
  return false;
}
// const hasNonAscii = (str) => [...str].some((char) => char.charCodeAt(0) > 127);

/**
 * @template {object} T
 * @template {T} V
 * @param {Unconstructed<V>} object
 * @param {TypeRegistry<T>} typeRegistry
 * @param {TypedConstructor<V>} defaultType
 * @returns {T | undefined}
 */
function construct(object, typeRegistry, defaultType) {
  return constructFromType(
    // @ts-ignore
    object,
    object.type ? typeRegistry.get(object.type) : (defaultType ?? Object),
  );
}
/**
 * @template {object} T
 * @param {Unconstructed<T>} object
 * @param {TypedConstructor<T>} type
 * @returns {T | undefined}
 */
function constructFromType(object, type) {
  if (!object) return; //Catch accidental calls using null, undefined or similar
  //Constructs an instance using type from registry, if it exists. If not, throw error.
  //If type is undefined, use the default.
  /** @type {T} */
  let instantiated = new type();
  let cloned = {};
  //Clone the object if possible, to copy stuff like bullet drawers, or weapon.shoot.pattern. If it fails, just use the original.
  try {
    cloned = structuredClone(object);
  } catch (error) {
    cloned = object;
    console.warn("Could not clone object:", error);
  }
  resolve$Types(cloned);
  if (!(instantiated instanceof RegisteredItem)) {
    if ("registryName" in cloned) delete cloned.registryName;
    if ("type" in cloned) delete cloned.type;
  }
  assign(instantiated, cloned);
  if ("init" in instantiated && typeof instantiated.init === "function") instantiated.init(); //Initialise if possible.
  return instantiated;
}

/**
 *
 * @param {({[x:string]:any})} obj
 */
function resolve$Types(obj) {
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === "object") {
      resolve$Types(val);
      if ("$type" in val) {
        const type = `${val.$type}`,
          ci = type.indexOf(".");

        delete val.$type;
        obj[key] = constructFromType(
          val,
          ci === -1 ?
            types.get(type)
          : categories.get(type.substring(0, ci)).get(type.substring(ci + 1)),
        );
      }
    }
  }
}

/**A version of `Object.assign()` which only copies keys present on both objects, and will not allow functions to be overridden.\
 * Mutates the original object, and returns it.
 */
/** @template {object} T @param {T} target @param {Unconstructed<T>} source  */
function assign(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (Reflect.has(target, key)) {
      let replace = Reflect.get(target, key);
      if (typeof replace !== "function") {
        Reflect.set(target, key, value);
      } else console.warn(`Integrate construction cannot replace an object's method: ${key}`);
    } else {
      console.warn(
        `Cannot create properties using Integrate constructions: ${key} is not present on type ${target.constructor.name}`,
      );
    }
  }
  return target;
}

export { Registry, RegistryRegistry, StaticRegistry, TypeRegistry };
