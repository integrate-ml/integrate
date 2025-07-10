/**
 * Data structure for holding **unique, case-insensitive** key-value pairs.
 */
class Registry {
  // Internal Map for holding the registry items.
  #content = new Map();
  // holds aliased names
  #aliases = new Map();
  get size() {
    //Get size of the internal Map.
    return this.#content.size;
  }
  /** Adds an item to registry.
   * @param {string} name Registry name of item. This is not case sensitive.
   * @param {*} item Item to add to registry.
   */
  add(name, item) {
    name = Registry.#processName(name);
    if (!item) throw new TypeError("Registries cannot contain null");
    //Throw an error if the item already exists.
    if (this.has(name))
      throw new SyntaxError(
        "Item " +
          name +
          " already exists in registry! Consider using a different name."
      );
    //Add to internal Map
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
   * @param {string} name Registry name to get. Not case sensitive.
   * @returns The item, if present.
   */
  get(name) {
    if (!name) throw new ReferenceError("No registry contains null!");
    name = Registry.#processName(name);
    name = name.toLowerCase(); //Remove case sensitivity.
    //Throw an error if the item doesn't exist.
    if (!this.has(name))
      throw new ReferenceError(
        "Item " +
          name +
          " does not exist in registry! Consider checking your spelling."
      );
    //Return item, if it exists.
    if (this.#content.has(name)) {
      let item = this.#content.get(name);
      try {
        item.registryName = name;
      } catch (e) {
        console.warn("Non-object entries do not have full feature support.");
      }
      return item;
    }
    //if no item, it's an alias
    else {
      //use recursion
      return this.get(this.#aliases.get(name));
    }
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
        "Item " +
          name +
          " does not exist in registry! Consider checking your spelling."
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
        "Item " +
          name +
          " does not exist in registry! Consider checking your spelling."
      );
    //Add alias
    this.#aliases.set(as, name);
    console.log("added alias " + as + " for " + name, this.#aliases);
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
        "Item " +
          name +
          " does not exist in registry! Consider checking your spelling."
      );
    return this.#aliases.get(alias) || alias;
  }
  /**
   * Performs a function on each item in registry.
   * @param {(item, name: string) => void} callback Function to perform on each item.
   */
  forEach(callback) {
    this.#content.forEach((value, key) => void callback(value, key));
  }
  /**
   * Performs a function on each item in registry, and returns a new registry with the projected items.
   * @param {(item: any, name: string) => any} callback Function to perform on each item.
   */
  map(callback) {
    let newreg = new Registry();
    this.#content.forEach((value, key) => newreg.add(key, callback(value, key)));
    return newreg;
  }
  /**
   * Performs a function on each item in registry asynchronously.
   * @param {(name: string, item) => void} callback Function to perform on each item.
   */
  async forEachAsync(callback) {
    this.#content.forEach(
      async (value, key) => await void callback(key, value)
    );
  }
  /**
   *
   * @param {int} index Zero-based index of the item to get.
   * @returns The registry name at the index.
   */
  at(index) {
    if (index >= this.#content.size)
      throw new RangeError(
        "Index " + index + " out of bounds for registry length " + this.size
      );
    return [...this.#content.keys()][index];
  }
  static #processName(name) {
    if (!name) throw new TypeError("Registry name must be defined");
    if (hasNonAscii(name))
      throw new TypeError("Registry names may only contain ASCII characters");
    return name.toString().toLowerCase();
  }
  static isValidName(name) {
    try {
      this.#processName(name);
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Constructs an item from this registry, using a type from another registry.
   * @param {string} name Name of item to construct.
   * @param {Registry} registry Registry for the type of the item.
   * @param {Function} [defaultType=Object] Constructor function or class to use if there's no defined type.
   */
  create(name, registry, defaultType = Object) {
    return Registry.#construct(this.get(name), registry, defaultType);
  }
  /**
   * Constructs an item using a type from this registry. Note that this only works with objects.
   * @param {object} object Object to construct.
   * @param {Function} [defaultType=Object] Constructor function or class to use if there's no defined type.
   */
  construct(object, defaultType = Object) {
    return Registry.#construct(object, this, defaultType);
  }
  static #construct(object, registry, defaultType = Object) {
    if (!object) return; //Catch accidental calls using null, undefined or similar
    //Constructs an instance using type from registry, if it exists. If not, throw error.
    //If type is undefined, use the default.
    let instantiated = new (
      object.type ? registry.get(object.type) : defaultType
    )();
    let cloned = {};
    //Clone the object if possible, to copy stuff like bullet drawers, or weapon.shoot.pattern. If it fails, just use the original.
    try {
      cloned = structuredClone(object);
    } catch (error) {
      cloned = object;
      console.warn("Could not clone object:", error);
    }
    assign(instantiated, cloned);
    instantiated.init ? instantiated.init() : {}; //Initialise if possible.
    return instantiated;
  }
  *[Symbol.iterator]() {
    for (let item of this.#content.values()) {
      yield item;
    }
  }
  /**
   * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
   * @param {*} item Item to search for.
   * @returns {string | null} Null if no entry with the item exists, the corresponding name otherwise.
   */
  nameOf(item) {
    let found = null;
    this.forEach((ritem, name) => {
      if (ritem === item) found = name;
    });
    return found;
  }
}

let hasNonAscii = (str) => [...str].some((char) => char.charCodeAt(0) > 127);

/**A version of `Object.assign()` which only copies keys present on both objects, and will not allow functions to be overridden.\
 * Mutates the original object, and returns it.
 */
function assign(target, source) {
  for (let key of Object.getOwnPropertyNames(source)) {
    let value = source[key];
    let replace = target[key];
    if (replace !== undefined) {
      if (typeof replace !== "function") {
        target[key] = value;
      } else console.warn("Cannot replace an object's method: " + key);
    } else {
      console.warn(
        "Cannot create properties using `construct()`-derived functions: " +
          key +
          " is not present on type " +
          target.constructor.name
      );
    }
  }
  return target;
}

export { Registry };
