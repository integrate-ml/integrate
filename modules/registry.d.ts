export type FieldsOf<T> = { [K in keyof T]: T[K] extends Function ? never : K; }[keyof T];
export type Unconstructed<T> = Partial<Pick<T, FieldsOf<T>>> & {
    type?: string;
    registryName?: string;
};
export type ctor = new () => any;
/** @template T @typedef {{ [K in keyof T]: T[K] extends Function ? never : K }[keyof T]} FieldsOf */
/** @template T @typedef {Partial<Pick<T, FieldsOf<T>>> & { type?: string, registryName?: string }} Unconstructed */
/**
 * Data structure for holding **unique, case-insensitive** key-value pairs.
 * @template T
 */
export class Registry<T> {
    /**@param {string|undefined} name  */
    static #processName(name: string | undefined): string;
    /**@param {string} name  */
    static isValidName(name: string): boolean;
    get size(): number;
    /** Adds an item to registry.
     * @param {string} name Registry name of item. This is not case sensitive.
     * @param {Unconstructed<T>} item Item to add to registry.
     */
    add(name: string, item: Unconstructed<T>): void;
    /**
     * Checks for an item in registry.
     * @param {string} name Registry name to check for. Not case sensitive.
     * @returns Whether or not the name exists.
     */
    has(name: string, excludeAliases?: boolean): boolean;
    /**
     * Gets an item from registry name.
     * @param {string} [name=""] Registry name to get. Not case sensitive.
     * @returns {Unconstructed<T>?} The item, if present.
     */
    tryGet(name?: string): Unconstructed<T> | null;
    /**
     * Gets an item from registry name.
     * @param {string} [name=""] Registry name to get. Not case sensitive.
     * @returns {Unconstructed<T>} The item, if present.
     */
    get(name?: string): Unconstructed<T>;
    /**
     * Renames a registry item. Neither parameter is case-sensitive.
     * @param {string} name Registry name to change.
     * @param {string} newName What to change the name to.
     */
    rename(name: string, newName: string): void;
    /**
     * Adds another registry item with the same content as the specified one.\
     * Can't alias other aliases.
     * @param {string} name Registry name to change.
     * @param {string} as What to change the name to.
     */
    alias(name: string, as: string): void;
    /**
     * Gets an array of aliases for a specified name.
     * @param {string} name Registry name to look for.
     */
    aliasesFor(name: string): string[];
    /**
     * Gets the original name for an alias.
     * @param {string} alias Alias to get the original name for.
     */
    dealias(alias: string): string;
    /**
     * Performs a function on each item in registry.
     * @param {(item: Unconstructed<T>, name: string) => void} callback Function to perform on each item.
     */
    forEach(callback: (item: Unconstructed<T>, name: string) => void): void;
    /**
     * Performs a function on each item in registry, and returns a new registry with the projected items.
     * @template V
     * @param {(item: Unconstructed<T>, name: string) => Unconstructed<V>} callback Function to perform on each item.
     */
    map<V>(callback: (item: Unconstructed<T>, name: string) => Unconstructed<V>): Registry<V>;
    /**
     * Performs a function on each item in registry asynchronously.
     * @param {(item: Unconstructed<T>, name: string) => void} callback Function to perform on each item.
     */
    forEachAsync(callback: (item: Unconstructed<T>, name: string) => void): Promise<void>;
    /**
     * Gets the item an a certain index in the registry.
     * @param {number} index Zero-based index of the item to get.
     * @returns The registry name at the index.
     */
    at(index: number): string | undefined;
    /**
     * Constructs an item from this registry, using a type from another registry.
     * @param {string} name Name of item to construct.
     * @param {TypeRegistry} registry Registry for the type of the item.
     * @param {ctor} [defaultType=Object] Constructor function or class to use if there's no defined type.
     */
    create(name: string, registry: TypeRegistry, defaultType?: ctor): object | undefined;
    /**
     * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
     * @param {T} item Item to search for.
     * @returns {string | null} Null if no entry with the item exists, the corresponding name otherwise.
     */
    nameOf(item: T): string | null;
    [Symbol.iterator](): Generator<{
        key: string;
        value: Unconstructed<T>;
    }, void, unknown>;
    #private;
}
/** A `Registry` for holding other registries. Only has a subset of `Registry`'s available features. */
export class RegistryRegistry {
    /**@param {string|undefined} name  */
    static #processName(name: string | undefined): string;
    /**@param {string} name  */
    static isValidName(name: string): boolean;
    get size(): number;
    /** Adds an item to registry.
     * @template T
     * @param {string} name Registry name of item. This is not case sensitive.
     * @param {Registry<T>} item Item to add to registry.
     */
    add<T>(name: string, item: Registry<T>): void;
    /**
     * Checks for an item in registry.
     * @param {string} name Registry name to check for. Not case sensitive.
     * @returns Whether or not the name exists.
     */
    has(name: string): boolean;
    /**
     * Gets an item from registry name.
     * @template T
     * @param {string} [name=""] Registry name to get. Not case sensitive.
     * @returns {Registry<T>} The item, if present.
     */
    get<T>(name?: string): Registry<T>;
    /**
     * Renames a registry item. Neither parameter is case-sensitive.
     * @param {string} name Registry name to change.
     * @param {string} newName What to change the name to.
     */
    rename(name: string, newName: string): void;
    /**
     * Performs a function on each item in registry.
     * @param {(item: Registry<any>, name: string) => void} callback Function to perform on each item.
     */
    forEach(callback: (item: Registry<any>, name: string) => void): void;
    /**
     * Performs a function on each item in registry asynchronously.
     * @param {(item: Registry<any>, name: string) => void} callback Function to perform on each item.
     */
    forEachAsync(callback: (item: Registry<any>, name: string) => void): Promise<void>;
    /**
     * Gets the item an a certain index in the registry.
     * @param {number} index Zero-based index of the item to get.
     * @returns The registry name at the index.
     */
    at(index: number): string | undefined;
    /**
     * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
     * @template T
     * @param {Registry<T>} item Item to search for.
     * @returns {string | null} Null if no entry with the item exists, the corresponding name otherwise.
     */
    nameOf<T>(item: Registry<T>): string | null;
    [Symbol.iterator](): Generator<{
        key: string;
        value: Registry<any>;
    }, void, unknown>;
    #private;
}
/** @typedef {new () => any} ctor */
/** A simpler `Registry` for holding types. Only has a subset of `Registry`'s available features. */
export class TypeRegistry {
    /**@param {string|undefined} name  */
    static #processName(name: string | undefined): string;
    /**@param {string} name  */
    static isValidName(name: string): boolean;
    get size(): number;
    /** Adds an item to registry.
     * @param {string} name Registry name of item. This is not case sensitive.
     * @param {ctor} item Item to add to registry.
     */
    add(name: string, item: ctor): void;
    /**
     * Checks for an item in registry.
     * @param {string} name Registry name to check for. Not case sensitive.
     * @returns Whether or not the name exists.
     */
    has(name: string): boolean;
    /**
     * Gets an item from registry name.
     * @param {string} [name=""] Registry name to get. Not case sensitive.
     * @returns {ctor} The item, if present.
     */
    get(name?: string): ctor;
    /**
     * Renames a registry item. Neither parameter is case-sensitive.
     * @param {string} name Registry name to change.
     * @param {string} newName What to change the name to.
     */
    rename(name: string, newName: string): void;
    /**
     * Performs a function on each item in registry.
     * @param {(item: ctor, name: string) => void} callback Function to perform on each item.
     */
    forEach(callback: (item: ctor, name: string) => void): void;
    /**
     * Performs a function on each item in registry asynchronously.
     * @param {(item: ctor, name: string) => void} callback Function to perform on each item.
     */
    forEachAsync(callback: (item: ctor, name: string) => void): Promise<void>;
    /**
     * Gets the item an a certain index in the registry.
     * @param {number} index Zero-based index of the item to get.
     * @returns The registry name at the index.
     */
    at(index: number): string | undefined;
    /**
     * Constructs an item using a type from this registry. Note that this only works with objects.
     * @template {object} T
     * @param {Unconstructed<T>} object Object to construct.
     * @param {ctor} [defaultType=Object] Constructor function or class to use if there's no defined type.
     * @returns {T | undefined}
     */
    construct<T extends object>(object: Unconstructed<T>, defaultType?: ctor): T | undefined;
    /**
     * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
     * @param {ctor} item Item to search for.
     * @returns {string | null} Null if no entry with the item exists, the corresponding name otherwise.
     */
    nameOf(item: ctor): string | null;
    [Symbol.iterator](): Generator<{
        key: string;
        value: ctor;
    }, void, unknown>;
    #private;
}
