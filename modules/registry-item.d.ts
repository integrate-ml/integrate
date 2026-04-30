/** Extend this type to have full support for all `Registry` features, such as type extensions, and automatic construction from `Integrate.construct(...)`. */
export class RegisteredItem {
    registryName: string;
    type: string;
    init(): void;
}
