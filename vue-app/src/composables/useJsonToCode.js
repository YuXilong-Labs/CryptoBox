function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1) }
function snakeCase(s) { return s.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '') }

function toCamel(s, camelCase) {
  if (!camelCase) return s
  return s.replace(/[_-](\w)/g, (_, c) => c.toUpperCase())
}

function propName(s, camelCase) {
  const name = toCamel(s, camelCase)
  return name.charAt(0).toLowerCase() + name.slice(1)
}

function className(s) {
  return capitalize(s.replace(/[_-](\w)/g, (_, c) => c.toUpperCase()))
}

// ═══ Objective-C (YYModel) ═══
export function jsonToObjC(obj, name = 'Root', useCamel = true) {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const cls = className(name)
  const entries = Object.entries(obj)

  // .h file
  const h = []
  h.push(`#import <Foundation/Foundation.h>`)
  h.push(`#import <YYModel/YYModel.h>`)
  h.push('')

  // Forward declarations for nested types
  for (const [k, v] of entries) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      h.push(`@class ${cls}${className(k)};`)
    }
  }
  if (entries.some(([_, v]) => v && typeof v === 'object' && !Array.isArray(v))) h.push('')

  h.push(`@interface ${cls} : NSObject <YYModel>`)
  h.push('')

  for (const [k, v] of entries) {
    const pn = propName(k, useCamel)
    if (v === null) {
      h.push(`@property (nonatomic, strong) id ${pn};`)
    } else if (Array.isArray(v)) {
      if (v.length && typeof v[0] === 'object' && v[0] !== null && !Array.isArray(v[0])) {
        h.push(`@property (nonatomic, copy) NSArray<${cls}${className(k)}Item *> *${pn};`)
      } else {
        h.push(`@property (nonatomic, copy) NSArray *${pn};`)
      }
    } else if (typeof v === 'object') {
      h.push(`@property (nonatomic, strong) ${cls}${className(k)} *${pn};`)
    } else if (typeof v === 'string') {
      h.push(`@property (nonatomic, copy) NSString *${pn};`)
    } else if (typeof v === 'number') {
      if (Number.isInteger(v)) {
        h.push(`@property (nonatomic, assign) NSInteger ${pn};`)
      } else {
        h.push(`@property (nonatomic, assign) CGFloat ${pn};`)
      }
    } else if (typeof v === 'boolean') {
      h.push(`@property (nonatomic, assign) BOOL ${pn};`)
    }
  }

  h.push('')
  h.push(`@end`)

  // Nested class interfaces
  for (const [k, v] of entries) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      h.push('')
      h.push(...jsonToObjC(v, `${cls}${className(k)}`, useCamel).split('\n').filter(l => !l.startsWith('#import')))
    }
    if (Array.isArray(v) && v.length && typeof v[0] === 'object' && v[0] !== null && !Array.isArray(v[0])) {
      h.push('')
      h.push(...jsonToObjC(v[0], `${cls}${className(k)}Item`, useCamel).split('\n').filter(l => !l.startsWith('#import')))
    }
  }

  // .m file
  const m = []
  m.push('')
  m.push(`// ════════════════════════════════════`)
  m.push(`// ${cls}.m`)
  m.push(`// ════════════════════════════════════`)
  m.push('')
  m.push(`#import "${cls}.h"`)
  m.push('')
  m.push(`@implementation ${cls}`)
  m.push('')

  // modelCustomPropertyMapper if camelCase differs from JSON key
  const mappers = []
  for (const [k] of entries) {
    const pn = propName(k, useCamel)
    if (pn !== k) {
      mappers.push(`    @"${pn}": @"${k}",`)
    }
  }
  if (mappers.length) {
    m.push(`+ (NSDictionary *)modelCustomPropertyMapper {`)
    m.push(`    return @{`)
    mappers.forEach(l => m.push(l))
    m.push(`    };`)
    m.push(`}`)
    m.push('')
  }

  // modelContainerPropertyGenericClass for arrays of objects
  const generics = []
  for (const [k, v] of entries) {
    if (Array.isArray(v) && v.length && typeof v[0] === 'object' && v[0] !== null && !Array.isArray(v[0])) {
      const pn = propName(k, useCamel)
      generics.push(`    @"${pn}": [${cls}${className(k)}Item class],`)
    }
  }
  if (generics.length) {
    m.push(`+ (NSDictionary *)modelContainerPropertyGenericClass {`)
    m.push(`    return @{`)
    generics.forEach(l => m.push(l))
    m.push(`    };`)
    m.push(`}`)
    m.push('')
  }

  m.push(`@end`)

  // Nested class implementations
  for (const [k, v] of entries) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const sub = className(k)
      m.push('')
      m.push(`@implementation ${cls}${sub}`)
      const subMappers = []
      for (const [sk] of Object.entries(v)) {
        const spn = propName(sk, useCamel)
        if (spn !== sk) subMappers.push(`    @"${spn}": @"${sk}",`)
      }
      if (subMappers.length) {
        m.push(`+ (NSDictionary *)modelCustomPropertyMapper {`)
        m.push(`    return @{`)
        subMappers.forEach(l => m.push(l))
        m.push(`    };`)
        m.push(`}`)
      }
      m.push(`@end`)
    }
  }

  return [...h, ...m].join('\n')
}

// ═══ Swift ═══
export function jsonToSwift(obj, name = 'Root', useCamel = true) {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const cls = className(name)
  const lines = [`struct ${cls}: Codable {`]
  const codingKeys = []
  for (const [k, v] of Object.entries(obj)) {
    const pn = propName(k, useCamel)
    const type = v === null ? 'Any?' : Array.isArray(v) ? `[${guessSwiftType(v)}]` : typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'Int' : 'Double') : typeof v === 'boolean' ? 'Bool' : className(k)
    lines.push(`    var ${pn}: ${type}?`)
    if (pn !== k) codingKeys.push({ pn, k })
  }
  if (codingKeys.length) {
    lines.push('')
    lines.push('    enum CodingKeys: String, CodingKey {')
    for (const [k] of Object.entries(obj)) {
      const pn = propName(k, useCamel)
      if (pn !== k) lines.push(`        case ${pn} = "${k}"`)
      else lines.push(`        case ${pn}`)
    }
    lines.push('    }')
  }
  lines.push('}')
  // Nested structs
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      lines.push('')
      lines.push(jsonToSwift(v, className(k), useCamel))
    }
    if (Array.isArray(v) && v.length && typeof v[0] === 'object' && v[0] !== null) {
      lines.push('')
      lines.push(jsonToSwift(v[0], className(k) + 'Item', useCamel))
    }
  }
  return lines.join('\n')
}
function guessSwiftType(arr) {
  if (!arr.length) return 'Any'
  const v = arr[0]
  if (typeof v === 'object' && v !== null) return className('Item')
  return typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'Int' : 'Double') : typeof v === 'boolean' ? 'Bool' : 'Any'
}

// ═══ Java ═══
export function jsonToJava(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const cls = className(name)
  const lines = [`public class ${cls} {`]
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'Object' : Array.isArray(v) ? `List<${guessJavaType(v)}>` : typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'double') : typeof v === 'boolean' ? 'boolean' : className(k)
    lines.push(`    private ${type} ${k};`)
  }
  lines.push('')
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'Object' : Array.isArray(v) ? `List<${guessJavaType(v)}>` : typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'double') : typeof v === 'boolean' ? 'boolean' : className(k)
    const cap = capitalize(k)
    lines.push(`    public ${type} get${cap}() { return ${k}; }`)
    lines.push(`    public void set${cap}(${type} ${k}) { this.${k} = ${k}; }`)
  }
  lines.push('}')
  return lines.join('\n')
}
function guessJavaType(arr) { if (!arr.length) return 'Object'; const v = arr[0]; return typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'Integer' : 'Double') : 'Object' }

// ═══ Kotlin ═══
export function jsonToKotlin(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const fields = Object.entries(obj).map(([k, v]) => {
    const type = v === null ? 'Any?' : Array.isArray(v) ? `List<${guessSwiftType(v)}>` : typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'Int' : 'Double') : typeof v === 'boolean' ? 'Boolean' : className(k)
    return `    val ${k}: ${type}? = null`
  })
  return `data class ${className(name)}(\n${fields.join(',\n')}\n)`
}

// ═══ Python ═══
export function jsonToPython(obj) {
  return JSON.stringify(obj, null, 4).replace(/null/g, 'None').replace(/true/g, 'True').replace(/false/g, 'False')
}

// ═══ JavaScript ═══
export function jsonToJS(obj) { return `const data = ${JSON.stringify(obj, null, 2)};` }

// ═══ TypeScript ═══
export function jsonToTS(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return `const data: any = ${JSON.stringify(obj)};`
  const lines = [`interface ${className(name)} {`]
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'any' : Array.isArray(v) ? `${guessTSType(v)}[]` : typeof v === 'string' ? 'string' : typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'boolean' : className(k)
    lines.push(`  ${k}: ${type};`)
  }
  lines.push('}')
  return lines.join('\n')
}
function guessTSType(arr) { if (!arr.length) return 'any'; const v = arr[0]; return typeof v === 'string' ? 'string' : typeof v === 'number' ? 'number' : 'any' }

// ═══ Go ═══
export function jsonToGo(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const lines = [`type ${className(name)} struct {`]
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'interface{}' : Array.isArray(v) ? `[]${guessGoType(v)}` : typeof v === 'string' ? 'string' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'float64') : typeof v === 'boolean' ? 'bool' : className(k)
    lines.push(`\t${capitalize(k)} ${type} \`json:"${k}"\``)
  }
  lines.push('}')
  return lines.join('\n')
}
function guessGoType(arr) { if (!arr.length) return 'interface{}'; const v = arr[0]; return typeof v === 'string' ? 'string' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'float64') : 'interface{}' }

// ═══ Rust ═══
export function jsonToRust(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const lines = ['#[derive(Serialize, Deserialize, Debug)]', `pub struct ${className(name)} {`]
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'Option<serde_json::Value>' : Array.isArray(v) ? `Vec<${guessRustType(v)}>` : typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'i64' : 'f64') : typeof v === 'boolean' ? 'bool' : className(k)
    lines.push(`    pub ${snakeCase(k)}: ${type},`)
  }
  lines.push('}')
  return lines.join('\n')
}
function guessRustType(arr) { if (!arr.length) return 'serde_json::Value'; const v = arr[0]; return typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'i64' : 'f64') : 'serde_json::Value' }

// ═══ C# ═══
export function jsonToCSharp(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const lines = [`public class ${className(name)} {`]
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'object' : Array.isArray(v) ? `List<${guessCSharpType(v)}>` : typeof v === 'string' ? 'string' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'double') : typeof v === 'boolean' ? 'bool' : className(k)
    lines.push(`    public ${type} ${capitalize(k)} { get; set; }`)
  }
  lines.push('}')
  return lines.join('\n')
}
function guessCSharpType(arr) { if (!arr.length) return 'object'; const v = arr[0]; return typeof v === 'string' ? 'string' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'double') : 'object' }

// ═══ PHP ═══
export function jsonToPHP(obj) {
  function convert(v, indent = 0) {
    const pad = '    '.repeat(indent)
    if (v === null) return 'null'
    if (typeof v === 'boolean') return v ? 'true' : 'false'
    if (typeof v === 'number') return String(v)
    if (typeof v === 'string') return `'${v.replace(/'/g, "\\'")}'`
    if (Array.isArray(v)) { const items = v.map(i => `${pad}    ${convert(i, indent + 1)}`).join(',\n'); return `[\n${items}\n${pad}]` }
    const items = Object.entries(v).map(([k, val]) => `${pad}    '${k}' => ${convert(val, indent + 1)}`).join(',\n')
    return `[\n${items}\n${pad}]`
  }
  return `$data = ${convert(obj)};`
}

// ═══ Ruby ═══
export function jsonToRuby(obj) { return JSON.stringify(obj, null, 2).replace(/null/g, 'nil').replace(/"(\w+)":/g, '$1:') }

// ═══ Dart ═══
export function jsonToDart(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const cls = className(name)
  const lines = [`class ${cls} {`]
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'dynamic' : Array.isArray(v) ? `List<${guessDartType(v)}>` : typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'double') : typeof v === 'boolean' ? 'bool' : className(k)
    lines.push(`  ${type}? ${k};`)
  }
  lines.push(`\n  ${cls}.fromJson(Map<String, dynamic> json) {`)
  for (const k of Object.keys(obj)) { lines.push(`    ${k} = json['${k}'];`) }
  lines.push('  }')
  lines.push('}')
  return lines.join('\n')
}
function guessDartType(arr) { if (!arr.length) return 'dynamic'; const v = arr[0]; return typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'double') : 'dynamic' }

// ═══ Dispatcher ═══
export function jsonToCode(obj, lang, useCamel = true) {
  const map = {
    'Objective-C': (o) => jsonToObjC(o, 'Root', useCamel),
    'Swift': (o) => jsonToSwift(o, 'Root', useCamel),
    'Java': jsonToJava, 'Kotlin': jsonToKotlin, 'Python': jsonToPython,
    'JavaScript': jsonToJS, 'TypeScript': jsonToTS, 'Go': jsonToGo,
    'Rust': jsonToRust, 'C#': jsonToCSharp, 'PHP': jsonToPHP, 'Ruby': jsonToRuby, 'Dart': jsonToDart,
  }
  return (map[lang] || jsonToJS)(obj)
}

// File extension map
export const fileExtMap = {
  'Objective-C': '.m', 'Swift': '.swift', 'Java': '.java', 'Kotlin': '.kt',
  'Python': '.py', 'JavaScript': '.js', 'TypeScript': '.ts', 'Go': '.go',
  'Rust': '.rs', 'C#': '.cs', 'PHP': '.php', 'Ruby': '.rb', 'Dart': '.dart',
}
