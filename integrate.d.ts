declare namespace Integrate {
  export const types: TypeRegistry;
  export const registries: RegistryRegistry;
  type FieldsOf<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
  export type Unconstructed<T> = Partial<Pick<T, FieldsOf<T>>> & {
    type?: string;
    registryName?: string;
  };
  export type ctor = new () => any;
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
    create(name: string, registry: TypeRegistry, defaultType?: ctor): T;
    /**
     * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
     * @param item Item to search for.
     * @returns Null if no entry with the item exists, the corresponding name otherwise.
     */
    nameOf(item: Unconstructed<T>): string | null;
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
    add<T>(name: string, item: Registry<T>): void;
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
  export class TypeRegistry {
    /**@param name  */
    static isValidName(name: string): boolean;
    get size(): number;
    /** Adds an item to registry.
     * @param name Registry name of item. This is not case sensitive.
     * @param item Item to add to registry.
     */
    add(name: string, item: ctor): void;
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
    get(name?: string): ctor;
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
    forEach(callback: (item: ctor, name: string) => void): void;
    /**
     * Performs a function on each item in registry asynchronously.
     * @param callback Function to perform on each item.
     */
    forEachAsync(callback: (item: ctor, name: string) => void): Promise<void>;
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
    construct<T extends object>(object: Unconstructed<T>, defaultType?: ctor): T | undefined;
    /**
     * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
     * @param item Item to search for.
     * @returns Null if no entry with the item exists, the corresponding name otherwise.
     */
    nameOf(item: ctor): string | null;
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
}
export = Integrate;
