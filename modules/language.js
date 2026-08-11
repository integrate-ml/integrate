import { get } from "./environment.js";

/** @param {string} s  */
export function parseContent(s) {
  const source = `${s}`
    .replaceAll(/ +/g, " ")
    .replaceAll(/,\s+/g, ",")
    .replaceAll(/:\s+/g, ":")
    .replaceAll(/(\r?\n|\r)+ */g, "\n")
    .replaceAll(/\/\/[^/\n\r]+$/gm, "")
    .trim();

  if (source[0] === "{" && source.at(-1) === "}") {
    console.warn("JSON mode invoked for this content, macros unavailable");
    const v = stringToObject(source);
    // console.log(v);
    return v;
  }

  const macros = [];
  let ended = 0;
  for (let i = 0; i < source.length; i++) {
    if (/\s/.test(source[i])) continue;
    else if (source[i] === "<") {
      i++;
      const end = findClosing(source, i, CharCode.OpenAngle, CharCode.CloseAngle);
      const def = source.substring(i, end);
      const ci = def.indexOf(":");
      if (ci !== -1) macros.push([def.substring(0, ci), def.substring(ci + 1)]);
      else throw new SyntaxError("Macro has no content.");
      i = end;
    } else {
      ended = i;
      break;
    }
  }

  let repld = `{${source.substring(ended)}}`;
  // console.log(repld)
  for (const [name, value] of macros) {
    repld = repld.replaceAll(`<${name}>`, value);
  }
  const v = stringToObject(repld);
  // console.log(v);
  return v;
}

/** @typedef {({type: Types})} Component */

const BigFuckingRegexes = {
  TypedObject: /^([a-zA-Z0-9_\-]+)(\.[a-zA-Z0-9_\-]+)?\s*\{[^}]*\}$/,
  RegistryReference: /^@([a-zA-Z0-9_\-]+)(\/[a-zA-Z0-9_\-]+)?(:[a-zA-Z0-9_\-]+)?$/,
  TypedReference:
    /^([a-zA-Z0-9_\-]+)(\.[a-zA-Z0-9_\-]+)?\s*@([a-zA-Z0-9_\-]+)(\/[a-zA-Z0-9_\-]+)?(:[a-zA-Z0-9_\-]+)?$/,
  Number: /^(-?([0-9]+)?\.[0-9]+|-?[0-9]+(\.[0-9]+)?)$/,
};

function parseArray(str) {
  const string = `${str}`.trim();

  const values = [];
  let lastIdx = 0;
  let sqbr = 0,
    rnbr = 0,
    crbr = 0;
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);

    if (char === CharCode.OpenBrace) crbr++;
    else if (char === CharCode.CloseBrace) crbr--;
    else if (char === CharCode.OpenBracket) sqbr++;
    else if (char === CharCode.CloseBracket) sqbr--;
    else if (char === CharCode.OpenParen) rnbr++;
    else if (char === CharCode.CloseParen) rnbr--;
    else if (
      sqbr === 0 &&
      rnbr === 0 &&
      crbr === 0 &&
      (char === CharCode.Comma || char === CharCode.Newline)
    ) {
      if (i !== lastIdx) values.push(string.substring(lastIdx, i));
      lastIdx = i + 1;
    }
  }
  values.push(string.substring(lastIdx));

  return values.map(stringToObject);
}

function parseObject(str) {
  const string = `${str}`.trim();

  const defs = [],
    entries = [];
  let lastIdx = 0;
  let sqbr = 0,
    rnbr = 0,
    crbr = 0;
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);

    if (char === CharCode.OpenBrace) crbr++;
    else if (char === CharCode.CloseBrace) crbr--;
    else if (char === CharCode.OpenBracket) sqbr++;
    else if (char === CharCode.CloseBracket) sqbr--;
    else if (char === CharCode.OpenParen) rnbr++;
    else if (char === CharCode.CloseParen) rnbr--;
    else if (
      sqbr === 0 &&
      rnbr === 0 &&
      crbr === 0 &&
      (char === CharCode.Comma || char === CharCode.Newline)
    ) {
      if (i !== lastIdx) defs.push(string.substring(lastIdx, i));
      lastIdx = i + 1;
    }
  }
  defs.push(string.substring(lastIdx));

  for (const entry of defs) {
    const ci = entry.indexOf(":");
    if (ci !== -1)
      entries.push([
        stringToPropertyName(entry.substring(0, ci)),
        stringToObject(entry.substring(ci + 1)),
      ]);
    else if (typeof entry === "string") entries.push([entry.trim(), true]);
    else throw new SyntaxError(`Unexpected '${entry}' where object entry was expected`);
  }
  return Object.fromEntries(entries);
}

function stringToPropertyName(str) {
  const string = `${str}`.trim(),
    lstr = string.toLowerCase();

  if (BigFuckingRegexes.Number.test(string)) return +string;
  else if (string[0] === '"' && string.at(-1) === '"') return string.slice(1, -1);
  else if (/[0-9a-zA-Z_\-]+/.test(string)) return string;

  throw new SyntaxError(`Bad property name: '${string}'`);
}

export class RegistryReference extends null {
  /**
   *
   * @param {string} ref Registry name to reference
   * @param {string} [type] Type of the object. Optional.
   * @returns
   */
  static create(ref, type) {
    if (type) {
      const r = new TypedReference();
      r.ref = Symbol.for(`${ref}`);
      r.type = `${type}`;
      return r;
    }

    const r = new this();
    r.ref = Symbol.for(`${ref}`);
    return r;
  }
  constructor() {
    return Object.create(new.target.prototype);
  }
  /** @type {symbol} */
  ref;
  [Symbol.toStringTag]() {
    return this.constructor.name;
  }
  /**
   *
   * @param {({[x:string]:any})} obj
   */
  static dereference(obj, base) {
    for (const key in obj) {
      const val = obj[key];
      if (val instanceof TypedReference) {
        const location = Symbol.keyFor(val.ref);
        if (!location) {
          console.warn(`Referenced value [${key}] leads to nowhere.`);
          delete obj[key];
        } else {
          const found = structuredClone(get(location, base));
          found.$type = val.type;
          obj[key] = found;
        }
      } else if (val instanceof this) {
        const location = Symbol.keyFor(val.ref);
        if (!location) {
          console.warn(`Referenced value [${key}] leads to nowhere.`);
          delete obj[key];
        } else obj[key] = get(location, base);
      } else if (typeof val === "object") {
        this.dereference(val, base);
      }
    }
  }
}
export class TypedReference extends RegistryReference {
  type = "";
}
function stringToObject(str) {
  const string = `${str}`.trim(),
    lstr = string.toLowerCase();

  if (lstr === "true") return true;
  else if (lstr === "false") return false;
  else if (lstr === "null") return null;
  else if (lstr === "undefined") return undefined;
  else if (lstr === "inf" || lstr === "infinity") return Infinity;
  else if (lstr === "-inf" || lstr === "-infinity" || lstr === "ninf") return -Infinity;
  else if (lstr === "nan") return NaN;
  else if (BigFuckingRegexes.Number.test(string)) return +string;
  else if (string[0] === '"' && string.at(-1) === '"') return string.slice(1, -1);
  else if (string[0] === "[" && string.at(-1) === "]") return parseArray(string.slice(1, -1));
  else if (string[0] === "{" && string.at(-1) === "}") return parseObject(string.slice(1, -1));
  else if (BigFuckingRegexes.TypedObject.test(string)) {
    const ostart = string.indexOf("{");
    const o = parseObject(string.slice(ostart + 1, -1));
    o.$type = string.substring(0, ostart).trim();
    return o;
  } else if (BigFuckingRegexes.RegistryReference.test(string))
    return RegistryReference.create(string.substring(1));
  else if (BigFuckingRegexes.TypedReference.test(string)) {
    const sep = string.indexOf("@");
    return RegistryReference.create(string.substring(sep + 1).trim(), string.substring(0, sep).trim());
  }

  return string;
  // throw new SyntaxError(`Unparseable primitive: '${string}'`);
}

const components = {
  /** @returns {Component} */
  array(...children) {
    return { children, length: children.length, type: Types.Array };
  },
  /** @returns {Component} */
  string(text) {
    return { text, length: text.length, type: Types.String };
  },
  /** @returns {Component} */
  kvp(key, value) {
    return { key, value, type: Types.KeyValuePair };
  },
  /** @returns {Component} */
  type(registry, key) {
    return { registry, key, type: Types.Type };
  },
};

/** @enum {number} */
const Types = {
  /** @readonly */
  Unknown: -1,
  /** @readonly */
  Number: 0,
  /** @readonly */
  String: 1,
  /** @readonly */
  EnumRef: 2,
  /** @readonly */
  Array: 3,
  /** @readonly */
  Object: 4,
  /** @readonly */
  KeyValuePair: 5,
  /** @readonly */
  Type: 6,
};

/** @enum {number} */
const CharCode = {
  /** @readonly */
  OpenBracket: "[".charCodeAt(0),
  /** @readonly */
  CloseBracket: "]".charCodeAt(0),
  /** @readonly */
  OpenParen: "(".charCodeAt(0),
  /** @readonly */
  CloseParen: ")".charCodeAt(0),
  /** @readonly */
  OpenBrace: "{".charCodeAt(0),
  /** @readonly */
  CloseBrace: "}".charCodeAt(0),
  /** @readonly */
  OpenAngle: "<".charCodeAt(0),
  /** @readonly */
  CloseAngle: ">".charCodeAt(0),
  /** @readonly */
  Quote: '"'.charCodeAt(0),
  /** @readonly */
  Comma: ",".charCodeAt(0),
  /** @readonly */
  Space: " ".charCodeAt(0),
  /** @readonly */
  Newline: "\n".charCodeAt(0),

  LowercaseA: "a".charCodeAt(0),
  UppercaseA: "A".charCodeAt(0),
  LowercaseZ: "z".charCodeAt(0),
  UppercaseZ: "Z".charCodeAt(0),
  Zero: "0".charCodeAt(0),
  Nine: "9".charCodeAt(0),
  /**
   * @param {number} char code to check
   * @param {string} str string to check against.
   */
  is(char, str) {
    return char === str.charCodeAt(0);
  },
  /**
   * @param {number} char code to convert
   */
  str(char) {
    return String.fromCharCode(char);
  },
  /**
   * @param {number} char code to convert
   */
  isAlphaNumeric(char) {
    return (
      (this.LowercaseA < char && char < this.LowercaseZ) ||
      (this.UppercaseA < char && char < this.UppercaseZ) ||
      (this.Zero < char && char < this.Nine)
    );
  },
};
/**
 *
 * @param {string} source WHat to look in.
 * @param {number} from Minimum index
 * @param {CharCode} open Opening character
 * @param {CharCode} close Closing character
 */
function findClosing(source, from, open, close) {
  let depth = 0;
  for (let idx = from; idx <= source.length; idx++) {
    const char = source.charCodeAt(idx);
    if (char === open) depth++;
    else if (char === close) {
      depth--;
      if (depth <= -1) return idx;
    }
  }
}
