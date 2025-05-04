## ISL
_Integrate Scripting Language_

ISL is a scripting language designed for use with this loader, allowing mods to script complex events in addition to simple content.  
This can be disabled by game devs, so check the project's Integrate documentation for this information.

There are no standard keywords in Integrate, as they are all added by the developer. Because of this, it is recommended to fully read through their extension documentation before making an ISL mod for their project.

This documentation from this point assumes you know about ISL, and have familiarised yourself with its basic features. If not, go read the [ISL wiki](https://github.com/LightningLaser8/ISL/wiki).

### Creating Scripts
Scripts are a bit different to normal mod content. They don't have a `type`, and are defined in `.isl` files, instead of `.json`.

A script file is essentially a normal ISL program, with some extra properties, defined in metatags.

An example script file (`script.isl`):
```isl
[onevent mod-load] // When the mod loads
[with loadstate, contentnamelist] // Using some properties from the event

// Regular ISL from here
function logstr name:string
log :\name\
end logstr

if \loadstate\ = true log "Mod loaded."
else log "Loading failed."
| stop

iterate \contentnamelist\ with logstr
```

Definitions look like this:
```json
[
  {
    "type": "script",
    "path": "./script.isl"
  }
]
```
