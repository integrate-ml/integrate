# Integrate

A library for mod loading into serialisable registries.  
Can be used in conjunction with [ISL](https://github.com/LightningLaser8/ISL) to perform complex operations.

## Terminology

- A _registry_ is a data structure for holding case-insensitive key-value pairs. Simply, it matches names to objects, without caring about capitalisation. They are instances of `Integrate.Registry`.
- *Registry name*s or *Registry location*s are strings which are keys in a _registry_. They can be used to refer to a _constructible object_.
- *Constructible object*s are basic, serialisable objects with a `type` property, holding a _registry name_ of a class.
- _Content_ refers to any _constructible object_ with a _registry name_, defined by the _mod_. Any content is an instance of `Integrate.Content`.
- A _mod_ is a directory of files, each one adding _content_.
- A _content file_ is a JSON file holding a _constructible object_.

### ISL

- _ISL_, or _Integrate Scripting Language_ is an external interpreted scripting language for use with this modloader, to create complex events.
- A _script_ is a `.isl` file to be executed when an _event_ is fired.
- An _event_ is a signal from the game that Integrate needs to run some scripts. Every script needs to define which events they fire on.

## Example (JS)

_Adding Integrate mods to your project_

```js
// Import Integrate
import Integrate from "../integrate.js";
// Optional line for better VS Code IntelliSense
/// <reference path="../integrate"/>
// "Game" Setup
Integrate.types.add("entity", class Entity {});
Integrate.types.add("block", class Block {
  type = "block"
  health = 0;
  width = 0;
  height = 0;
});
Integrate.types.add("item", class Item {});

// Modloader Setup
Integrate.setPrefix(true);

// Tests
Integrate.load("./mod") // gets the mod asynchronously
  .then(() => {
    Integrate.postLoad(); // actually add the content
    Integrate.content.forEach(x => console.log(Integrate.construct(x)))
  });

// Alternatively,
Integrate.setMods("./mod") // cleans up, loads and implements in one go
  .then(() => {
    Integrate.content.forEach(x => console.log(Integrate.construct(x)))
  });
```

When used on the example directory below,
on load, logs:

```
> Block {type: "block", width: 20, height: 20, health: 200}
```

## Example (Directory)

_The directory structure for Integrate mods_

```
(mod root)
 |-> mod.json
 |-> definition file
 |=> (content)
```

### mod.json

Holds the basic information for the mod:

```json
{
  "name": "example",
  "displayName": "Example Mod",
  "definitions": "./definitions.json",
  "tagline": "Basic mod to show functionality.",
  "description": "This mod exists only to show functionality of the modloader, and is not intended to be played with in any game. It is purely for demonstrative purposes.",
  "author": "LightningLaser8",
  "version": "v0.1.0"
}
```

`name` defines the _mod identifier_ - a string used to differentiate this mod's content form another's.  
`displayName` defines the name shown, both in info and possibly other parts of the program.  
`tagline` defines a _short_ description of the mod, usually a single line.  
`description` defines a longer description, which can be multiple lines, and should describe the type of content, or the premise of the mod.  
`author` defines the name that should be shown to have made the mod.  
`version` defines the _mod's version_, should be used to detect updated mods in saves, for example.

`definitions` gives the path _from the mod.json file_ to the definition file.

### Definition File

This is the most important file in any Integrate mod, defining paths and registry names of _content_.

```json
[
  {
    "path": "./wall.idef",
    "name": "wall",
    "registry": "content"
  }
]
```

It consists of a _single array_, each entry being an object with these three properties:  
`path` defining the _relative location_ of the _content file_ being described.  
`name` being the _registry name_ of this content.  
`registry` being optional, defining the registry this content will be added to. By default, this will be `"content"`. **This registry does not exist by default, and will throw errors if not defined using `Integrate.addModdableRegistry()`.**

This file can be placed completely inline in `mod.json`:
```json
{
  "name": "example",
  "displayName": "Example Mod",
  "definitions": [
    {
      "path": "./wall.idef",
      "name": "wall",
      "registry": "content"
    }
  ],
  "tagline": "Basic mod to show functionality.",
  "description": "This mod exists only to show functionality of the modloader, and is not intended to be played with in any game. It is purely for demonstrative purposes.",
  "author": "LightningLaser8",
  "version": "v0.1.0"
}
```

Additionally, any entry `{ "path": "registry/name.idef", "name": "name", "registry": "registry"}` where the path matches the registry and name, may be listed as its path alone:
```json
{
  "name": "example",
  "displayName": "Example Mod",
  "definitions": [
    "content/wall.idef"
  ],
  "tagline": "Basic mod to show functionality.",
  "description": "This mod exists only to show functionality of the modloader, and is not intended to be played with in any game. It is purely for demonstrative purposes.",
  "author": "LightningLaser8",
  "version": "v0.1.0"
}
```
If the registry is omitted, then the default registry of `content` will be used:
```json
{
  "name": "example",
  "displayName": "Example Mod",
  "definitions": [
    "wall.idef" // The same as { "path": "./wall.idef", "name": "wall", "registry": "content" }
  ],
  "tagline": "Basic mod to show functionality.",
  "description": "This mod exists only to show functionality of the modloader, and is not intended to be played with in any game. It is purely for demonstrative purposes.",
  "author": "LightningLaser8",
  "version": "v0.1.0"
}
```

### Content Files

These describe the actual content itself, not metadata.
They can be anywhere, even outside the mod directory, as long as `definitions.json` points to them, and the program can reach them.  
This is to leave organisation up to the mod developer, so you can organise the files hovever you like.

These aren't JSON files, but they are similar - most JSON should work.

```json
{
  "type": "block",
  "width": 20,
  "height": 20,
  "health": 200
}
```

Equivalently, you could use some more friendly syntax:

```
// comments are allowed here too
type: block
width: 20
height: 20
health: 200
```

`type` is mandatory, it defines the _registry name_ of the class this object will be an instance of.  
`width`, `height` and `health` are specific to this type, and are not necessary in content files. They are properties of the class stored at `"block"` in the Registry `Integrate.types`.

### .idef Files
Integrate Content Definition files (.idef) store content in a JSON-like hierarchical data format, but with additional features.

**Most JSON will still work! This is unnecessary if you are upgrading your mod to use the new Integrate API.**

**Only `.idef` files will use this - if a file is `.json`, it will be interpreted as JSON.**

```
// Comments are allowed in these files.
{
  "type": "block",
  "width": 20,
  "height": 20, // in any position
  "health": 200
  // but only line comments.
}
```

Additionally, top-level braces are optional:

```
{
  "type": "block",
  "width": 20,
  "height": 20,
  "health": 200
}
```
and
```
"type": "block",
"width": 20,
"height": 20,
"health": 200
```
are equivalent.

---

Quotes on property names and single-line strings are optional too, as well as commas after each property, (as long as they are on separate lines):
```
type: block
width: 20 34
height: 20
health: 200
```

---

This format also introduces _macros_ to data structures: a simple find-and-replace system to reduce code duplication and file size.

To create one, place `<name: value>` at the top of the file, **before any content**:
```
<size: 20>
type: block
width: 20
height: 20
health: 200
```
To use it, put `<name>` _anywhere_ in the rest of the file.
They are evaluated top-to-bottom, and cannot be recursive (though they may still contain each other.)
```
<size: 20>
type: block
width: <size>
height: <size>
health: 200
```

Fragments of values are allowed: `<name>2` will resolve to `value2` (using the example macro `<name: value>`). Additionally, multiple properties can be used as the value:
```
<size: width:<sz>,height:<sz>><sz:20>
type: block
<size>
health: <sz>0
```
This is equivalent to all of the above code blocks.

_Note that `<sz>` must come **after** `<size>` to apply properly._

---

Object properties get an upgrade too: you can define registry names for objects inline:

```
type: weapon
reload: 60
bullet: bullets.laser {
  damage: 3
  length: 100
}
```

is similar to 
```
type: weapon
reload: 60
bullet: {
  type: bullets.laser
  damage: 3
  length: 100
}
```
but, in the former, the property `bullet` is automatically instantiated _without needing to use `init()`_, which reduces code clutter:
```js
class Weapon {
  reload = 0;
  bullet = new Bullet();
  init(){
    // will not pass in TS
    this.bullet = Integrate.construct(this.bullet);
  }
}
```
becomes
```js
class Weapon {
  reload = 0;
  bullet = new Bullet();
}
```
since the instantiation and construction of `bullet` is handled by Integrate.

---
For ease of mod interoperability and cooperation, this format allows delayed registry references - these are evaluated after the mod is implemented, to allow for dependencies to load.

```
// bullets/blaster-shot.idef
type: bullets.laser
damage: 3
length: 100

// weapons/blaster.idef
type: weapon
reload: 60
bullet: @bullets/blaster-shot
```

Additionally, typed objects and references can be combined, but this increases memory use, since the data are cloned for construction:

```
// bullets/blaster-shot.idef
damage: 3
length: 100

// weapons/blaster.idef
type: weapon
reload: 60
bullet: bullets.laser @bullets/blaster-shot
```

If your use-case doesn't demand the ability to reference the same registry item with different types, then you can define the automatic type in the file itself:
```
// bullets/blaster-shot.idef
$type: bullets.laser
damage: 3
length: 100

// weapons/blaster.idef
type: weapon
reload: 60
bullet: @bullets/blaster-shot
```

Side note: If using prefixes, references will try to resolve relative to the current mod if they don't find anything:

```
type: block
size: 1
image: @images/blocks.example
```
For example, if the mod's ID is `mod`, Integrate will search first for `blocks.example` in the registry `images`, and if that wasn't found, will search for `mod:blocks.example` in `images`.

## Interface

Integrate has several functions to customise modloading, which are documented here.
This section assumes you imported Integrate in a single namespace, called `Integrate`.

### Integrate.load()

`Integrate.load()` loads a mod from a path, and returns the `Integrate.Mod` object.

```ts
Integrate.load(path: string): Integrate.Mod
```

`path` is the relative path from the current window location to the mod's _root directory_, **not** the `mod.json`.  
Returns an `Integrate.Mod` object, holding all the info about the imported mod. Once loaded, this object is all that's needed.

### Integrate.postLoad()

`Integrate.postLoad()` Constructs and implements all current loaded mods.

```ts
Integrate.postLoad(): void
```
### Integrate.setMods()

`Integrate.setMods()` Clears loaded mods, loads those specified in its parameter list, and performs all post-load operations.

```ts
Integrate.setMods(...paths: string[]): void
```
`paths` are all relative paths from the current window location to the mods' _root directories_, **not** their `mod.json`s.  

### Integrate.addModdableRegistry()

`Integrate.addModdableRegistry()` adds a registry to the list of modifiable registries. This list defines which registries mods can add content to.

```ts
Integrate.addModdableRegistry(reg: Integrate.Registry, name: string): void
```

`reg` is the `Integrate.Registry` (or similar object implementing the same methods) to allow modification of.  
`name` is the string that this registry will be referred to by.

### Integrate.setPrefix()

`Integrate.setPrefix()` changes whether or not mod content's registry names should be prefixed with the mod's `name`.

```ts
Integrate.setPrefix(value: boolean): void
```

`value` is the new Boolean value of this flag. `true` means prefixes on, `false` means prefixes off. By default this is `false`.

### Integrate.setInfoOutput()

`Integrate.setInfoOutput()` changes the way Integrate shows status messages.

```ts
Integrate.setInfoOutput(func: (info: string) => void): void
```

`func` callback for each status message. The parameter `info` contains the message, as a string. By default, this function is `console.log`.

### Integrate.types
`Integrate.types` is an `Integrate.Registry` holding all types mod content can be an instance of.
```ts
Integrate.types: Integrate.Registry
```

### Integrate.construct()
`Integrate.construct()` is a helpful function that combines `Integrate.Registry.create()` and `Integrate.Registry.construct()` for mod content. It constructs an object either literally or from any moddable registry, using types from `Integrate.types`.
```ts
Integrate.construct(object: object | string, defaultType: class): object
```
`object` is either a constructible object, or a registry name of one in any moddable registry.  
`defaultType` is an optional parameter defining a fallback type for if the constructible has no `type` property.

## Classes

### Integrate.Content

```ts
class Content {
  registry: string;
  name: string;
  constructible: object;
  JSON: string;
  implement() {}: void
  create() {}: object
}
```

`registry` Name of the registry this content is to be added to.
`name` Name of this content in registry.  
`constructible` The JSON serialisable constructible object used to create instances of this content.  
`JSON` The JSON equivalent of the constructible.  
`implement()` Adds this content to its designated registry.
`create()` Returns a constructed instance of this content directly.

### Integrate.Mod

```ts
class Mod {
  displayName: string;
  name: string;
  version: string;
  author: string;
  tagline: string;
  description: string;
  content: Content[];
}
```

`displayName` Display name of the mod.  
`name` Internal ID for the mod. Used for registry items.  
`version` Mod version.  
`author` Who made this mod.  
`tagline` Short, one-line description of the mod.  
`description` Longer description of the mod.  
`content` Array of all content in this mod.

### Integrate.Registry

```ts
/**
 * Data structure for holding **unique, case-insensitive** key-value pairs.
 */
class Registry {
  get size() {}: number;
  add(name: string, item: any) {}: void;
  has(name: string) {}: boolean;
  get(name: string) {}: object;
  create(name: string, registry: Integrate.Registry, defaultType: class) {}: object;
  construct(object: object, defaultType: class) {}: object;
  rename(name: string, newName: string) {}: void;
  alias(name: string, as: string) {}: void;
  forEach(func: (item, name: string) => void) {}: void;
  nameOf(item: any) {}: string | null;
}
```

`size` Returns the size of the registry.  
`add()` Adds an item to registry.  
`has()` Checks for an item in registry.
`get()` Gets an item from registry name.  
`create()` Constructs an item from this registry. Note that this only works with object entries. The parameter `registry` should be the registry holding all types, such as `Integrate.types`.  
`construct()` Constructs an item using a type from this registry. Note that this only works with object parameters.  
`rename()` Renames a registry item. Neither parameter is case-sensitive.  
`alias()` Adds another registry item with the same content as the specified one.  
`forEach()` Executes a function for each element in the registry.  
`nameOf()` Searches the registry for any entries with matching content. Equivalence follows `===` rules.
