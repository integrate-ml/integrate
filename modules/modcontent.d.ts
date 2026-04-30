/**
 * Allows mods to modify a registry, by using a certain name.
 * @template T
 * @param {Registry<T>} reg Registry to add.
 * @param {string} name Name of the registry, to be used in mod content.
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
    create(): object | undefined;
}
import { Registry } from "./registry.js";
