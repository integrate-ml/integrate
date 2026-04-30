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
    /** Array of all content in this mod. @type {Content[]} */
    content: Content[];
}
import { Content } from "./modcontent.js";
