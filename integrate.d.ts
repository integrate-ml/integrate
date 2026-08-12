declare namespace Integrate {
  /**
   * A registry for all types. Prefer using your own type registries for more complicated use cases.
   */
  export const types: TypeRegistry<any>;
  /**
   * A registry for categories of types. More convenient for complicated use cases.
   */
  export const categories: StaticRegistry<TypeRegistry<any>>;
  /**
   * A registry for moddable registries. Add registries to this to allow mods to add content to them.
   */
  export const registries: RegistryRegistry;
  /** Default registry for content that doesn't specify a location. */
  export const content: Registry<any>;
  type FieldsOf<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
  export type Unconstructed<T> = Partial<Pick<T, FieldsOf<T>>> & {
    type?: string;
    registryName?: string;
  };
  export type Constructor = new () => any;
  export type TypedConstructor<T> = new () => T;
  export type FileHandler = {
    /** Function to create the content's actual value from the file's content. */
    transformer: (file: Uint8Array<ArrayBuffer>, path: string) => any;
    /** Disables automatic reference resolution for content from this file type. Useful when `transformer` is defined. \
     * Will not prevent reference resolution attempts when used inline (or through a reference), but can still reduce load times. \
     * Strongly recommended if your `transformer` returns any non-object value.
     */
    disableAnalysis?: boolean;
    /** Fairly self-explanatory - disables automatic prefixing for content from this file type. */
    disablePrefixes?: boolean;
  };
  /**
   * Data structure for holding **unique, case-insensitive** key-value pairs.
   */
  export class Registry<T> {
    static isValidName(name: string): boolean;
    get size(): number;
    /** Adds an item to registry.
     * @param name Registry name of item. This is not case sensitive.
     * @param item Item to add to registry.
     */
    add(name: string, item: Unconstructed<T>): void;
    /**
     * Checks for an item in registry.
     * @param name Registry name to check for. Not case sensitive.
     * @returns Whether or not the name exists.
     */
    has(name: string, excludeAliases?: boolean): boolean;
    /**
     * Gets an item from registry name.
     * @param name Registry name to get. Not case sensitive.
     * @returns The item, if present.
     */
    tryGet(name?: string): Unconstructed<T> | null;
    /**
     * Gets an item from registry name.
     * @param name Registry name to get. Not case sensitive.
     * @returns The item, if present.
     */
    get(name?: string): Unconstructed<T>;
    /**
     * Renames a registry item. Neither parameter is case-sensitive.
     * @param name Registry name to change.
     * @param newName What to change the name to.
     */
    rename(name: string, newName: string): void;
    /**
     * Adds another registry item with the same content as the specified one.\
     * Can't alias other aliases.
     * @param name Registry name to change.
     * @param as What to change the name to.
     */
    alias(name: string, as: string): void;
    /**
     * Gets an array of aliases for a specified name.
     * @param name Registry name to look for.
     */
    aliasesFor(name: string): any[];
    /**
     * Gets the original name for an alias.
     * @param alias Alias to get the original name for.
     */
    dealias(alias: string): any;
    /**
     * Performs a function on each item in registry.
     * @param callback Function to perform on each item.
     */
    forEach(callback: (item: Unconstructed<T>, name: string) => void): void;
    /**
     * Performs a function on each item in registry, and returns a new registry with the projected items.
     * @template V
     * @param callback Function to perform on each item.
     */
    map<V>(callback: (item: Unconstructed<T>, name: string) => Unconstructed<V>): Registry<V>;
    /**
     * Performs a function on each item in registry asynchronously.
     * @param callback Function to perform on each item.
     */
    forEachAsync(callback: (item: Unconstructed<T>, name: string) => void): Promise<void>;
    /**
     * Gets the item an a certain index in the registry.
     * @param index Zero-based index of the item to get.
     * @returns The registry name at the index.
     */
    at(index: number): string;
    /**
     * Constructs an item from this registry, using a type from another registry.
     * @param name Name of item to construct.
     * @param registry Registry for the type of the item.
     * @param defaultType Constructor function or class to use if there's no defined type.
     */
    create(name: string, registry: TypeRegistry<T>, defaultType?: TypedConstructor<T>): T;
    /**
     * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
     * @param item Item to search for.
     * @returns Null if no entry with the item exists, the corresponding name otherwise.
     */
    nameOf(item: Unconstructed<T>): string | null;
  }
  /**
   * Data structure for holding **unique, case-insensitive** key-value pairs.
   */
  export class StaticRegistry<T> {
    static isValidName(name: string): boolean;
    get size(): number;
    /** Adds an item to registry.
     * @param name Registry name of item. This is not case sensitive.
     * @param item Item to add to registry.
     */
    add(name: string, item: T): void;
    /**
     * Checks for an item in registry.
     * @param name Registry name to check for. Not case sensitive.
     * @returns Whether or not the name exists.
     */
    has(name: string, excludeAliases?: boolean): boolean;
    /**
     * Gets an item from registry name.
     * @param name Registry name to get. Not case sensitive.
     * @returns The item, if present.
     */
    tryGet(name?: string): T | null;
    /**
     * Gets an item from registry name.
     * @param name Registry name to get. Not case sensitive.
     * @returns The item, if present.
     */
    get(name?: string): T;
    /**
     * Renames a registry item. Neither parameter is case-sensitive.
     * @param name Registry name to change.
     * @param newName What to change the name to.
     */
    rename(name: string, newName: string): void;
    /**
     * Adds another registry item with the same content as the specified one.\
     * Can't alias other aliases.
     * @param name Registry name to change.
     * @param as What to change the name to.
     */
    alias(name: string, as: string): void;
    /**
     * Gets an array of aliases for a specified name.
     * @param name Registry name to look for.
     */
    aliasesFor(name: string): any[];
    /**
     * Gets the original name for an alias.
     * @param alias Alias to get the original name for.
     */
    dealias(alias: string): any;
    /**
     * Performs a function on each item in registry.
     * @param callback Function to perform on each item.
     */
    forEach(callback: (item: T, name: string) => void): void;
    /**
     * Performs a function on each item in registry, and returns a new registry with the projected items.
     * @template V
     * @param callback Function to perform on each item.
     */
    map<V>(callback: (item: T, name: string) => V): Registry<V>;
    /**
     * Performs a function on each item in registry asynchronously.
     * @param callback Function to perform on each item.
     */
    forEachAsync(callback: (item: T, name: string) => void): Promise<void>;
    /**
     * Gets the item an a certain index in the registry.
     * @param index Zero-based index of the item to get.
     * @returns The registry name at the index.
     */
    at(index: number): string;
    /**
     * Constructs an item from this registry, using a type from another registry.
     * @param name Name of item to construct.
     * @param registry Registry for the type of the item.
     * @param defaultType Constructor function or class to use if there's no defined type.
     */
    create(name: string, registry: TypeRegistry<T>, defaultType?: TypedConstructor<T>): T;
    /**
     * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
     * @param item Item to search for.
     * @returns Null if no entry with the item exists, the corresponding name otherwise.
     */
    nameOf(item: T): string | null;
  }
  /** A `Registry` for holding other registries. Only has a subset of `Registry`'s available features. */
  export class RegistryRegistry {
    /**@param name  */
    static isValidName(name: string): boolean;
    get size(): number;
    /** Adds an item to registry.
     * @param name Registry name of item. This is not case sensitive.
     * @param item Item to add to registry.
     */
    add<T>(name: string, item?: Registry<T>): void;
    /**
     * Checks for an item in registry.
     * @param name Registry name to check for. Not case sensitive.
     * @returns Whether or not the name exists.
     */
    has(name: string): boolean;
    /**
     * Gets an item from registry name.
     * @param name Registry name to get. Not case sensitive.
     * @returns The item, if present.
     */
    get<T>(name?: string): Registry<T>;
    /**
     * Renames a registry item. Neither parameter is case-sensitive.
     * @param name Registry name to change.
     * @param newName What to change the name to.
     */
    rename(name: string, newName: string): void;
    /**
     * Performs a function on each item in registry.
     * @param callback Function to perform on each item.
     */
    forEach(callback: (item: Registry<any>, name: string) => void): void;
    /**
     * Performs a function on each item in registry asynchronously.
     * @param callback Function to perform on each item.
     */
    forEachAsync(callback: (item: Registry<any>, name: string) => void): Promise<void>;
    /**
     * Gets the item an a certain index in the registry.
     * @param index Zero-based index of the item to get.
     * @returns The registry name at the index.
     */
    at(index: number): string;
    /**
     * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
     * @param item Item to search for.
     * @returns Null if no entry with the item exists, the corresponding name otherwise.
     */
    nameOf<T>(item: Registry<T>): string | null;
  }
  /** A simpler `Registry` for holding types. Only has a subset of `Registry`'s available features. */
  export class TypeRegistry<T> {
    /**@param name  */
    static isValidName(name: string): boolean;
    get size(): number;
    /** Adds an item to registry.
     * @param name Registry name of item. This is not case sensitive.
     * @param item Item to add to registry.
     */
    add(name: string, item: TypedConstructor<T>): void;
    /**
     * Checks for an item in registry.
     * @param name Registry name to check for. Not case sensitive.
     * @returns Whether or not the name exists.
     */
    has(name: string): boolean;
    /**
     * Gets an item from registry name.
     * @param name Registry name to get. Not case sensitive.
     * @returns The item, if present.
     */
    get(name?: string): Constructor;
    /**
     * Renames a registry item. Neither parameter is case-sensitive.
     * @param name Registry name to change.
     * @param newName What to change the name to.
     */
    rename(name: string, newName: string): void;
    /**
     * Performs a function on each item in registry.
     * @param callback Function to perform on each item.
     */
    forEach(callback: <V extends T>(item: TypedConstructor<V>, name: string) => void): void;
    /**
     * Performs a function on each item in registry asynchronously.
     * @param callback Function to perform on each item.
     */
    forEachAsync(
      callback: <V extends T>(item: TypedConstructor<V>, name: string) => Promise<void>,
    ): Promise<void>;
    /**
     * Gets the item an a certain index in the registry.
     * @param index Zero-based index of the item to get.
     * @returns The registry name at the index.
     */
    at(index: number): string;
    /**
     * Constructs an item using a type from this registry. Note that this only works with objects.
     * @param object Object to construct.
     * @param defaultType Constructor function or class to use if there's no defined type.
     * @returns {T | undefined}
     */
    construct<V extends T>(
      object: Unconstructed<V>,
      defaultType?: TypedConstructor<V>,
    ): V | undefined;
    /**
     * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
     * @param item Item to search for.
     * @returns Null if no entry with the item exists, the corresponding name otherwise.
     */
    nameOf(item: TypedConstructor<T>): string | null;
  }
  export class Mod {
    /** Display name of the mod. */
    displayName: string;
    /** Internal ID for the mod. Used for registry items. */
    name: string;
    /** Mod version. */
    version: string;
    /** Who made this mod. */
    author: string;
    /** Short, one-line description of the mod. */
    tagline: string;
    /** Longer description of the mod. */
    description: string;
    /** Array of all content in this mod.*/
    content: Content[];
  }
  /**
   * Allows mods to modify a registry, by using a certain name.
   * @deprecated Use {@linkcode registries}`.add(name, reg)` instead.
   * @param reg Registry to add.
   * @param name Name of the registry, to be used in mod content.
   */
  export function addModdableRegistry<T>(reg: Registry<T>, name: string): void;
  export class Content {
    /** Name of the registry this content is to be added to. */
    registry: string;
    /** Name of this content in registry. */
    name: string;
    /** The JSON serialisable constructible object used to create instances of this content. */
    constructible: {};
    /** The JSON equivalent of the constructible. */
    JSON: string;
    implement(): void;
    create(): object;
  }
  export class RegisteredItem {
    registryName: string;
    type: string;
    init(): void;
  }
  /**
   * Constructs an object using types from the `Integrate.types` registry.\
   * **Only works with types extending RegisteredItem!**
   * @param object Object to construct, or its registry name. Can be in one of 2 forms: `registry/name` to search in `registry` for `name`, or simply `name` to search in the default `'content'` registry.
   * @param defaultType Type to use if no other can be found.
   */
  export function construct<T>(
    object: Unconstructed<T> | string,
    defaultType: TypedConstructor<T>,
  ): T;
  /**
   * Sets the prefix mode for new items. `true` prefixes the mod's name to the item's registry name, `false` just adds it directly.
   * **By default, this is `false`.**
   */
  export function setPrefix(value: boolean): void;
  /**
   * Sets a callback to define how the loader shows info text.
   */
  export function setInfoOutput(func: (info: string) => void): void;

  /** Adds content from all mods loaded. Required for mods to be applied. */
  export function postLoad(): void;
  /** Adds content from one specific mod. Prefer using `postLoad` or `setMods` when possible, but if registry clearing is undesirable, use this. */
  export function postLoad(mod: Mod): void;
  /** Removes all mod definitions loaded. Does nothing to registries, but can reduce memory use. */
  export function unloadMods(): void;
  /** Unloads existing mods, loads the specified mods and performs post-loading. Useful for compact loading of a known list. @param paths Paths to mods, as you would pass them to {@linkcode loadMod} */
  export async function setMods(...paths: string[]): Promise<void>;
  /** Loads a mod. */
  export async function load(path: string): Promise<Mod>;
  /** Loads and post-loads a mod, without clearing registries. */
  export async function add(path: string): Promise<Mod>;
  /** Gets an object from any moddable registries. Uses file path notation: `blocks/wall` gets the content named `wall` from the registry `blocks`.
   */
  export function get(name: string): object;
  /** Tries to get an object from any moddable registries. Uses file path notation: `blocks/wall` gets the content named `wall` from the registry `blocks`.\
   * Returns `null` if no object was found, or the registry was not present.
   */
  export function tryGet(name: string): object | null;
  /**
   * Adds a new handler for a custom file type. \
   * For example,
   * ```js
   * addHandler("png", { transformer: bytes => new Image(bytes) });
   * ```
   * adds a handler for `.png` content files, which creates `Image` instances from the file.
   * @param extension File extension, without the dot.
   * @param handler Options, including a function to convert the file's bytes to the desired object.
   */
  export function addHandler(extension: string, handler: FileHandler): void;
}
export = Integrate;
