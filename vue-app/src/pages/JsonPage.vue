<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import CopyBtn from '../components/CopyBtn.vue'
import JsonTree from '../components/JsonTree.vue'
import CodeEditor from '../components/CodeEditor.vue'
import { useHistory } from '../composables/useHistory.js'

const { save, getLast } = useHistory('json')

const modes = ['格式化', '压缩', '校验', '转义', '去转义']
const selected = ref('格式化')
const input = ref('')
const formatted = ref('')
const error = ref('')
const treeData = ref(null)
const isValid = ref(null) // null=未检测, true=成功, false=失败

// 代码转换
const codeLangs = [
  'Objective-C', 'Swift', 'Java', 'Kotlin', 'Python', 'JavaScript',
  'TypeScript', 'Go', 'Rust', 'C#', 'PHP', 'Ruby', 'Dart'
]
const codeLang = ref('Objective-C')
const codeOutput = ref('')

onMounted(() => {
  const last = getLast()
  if (last) {
    input.value = last
    nextTick(() => run())
  }
})

// 点击 pill 直接执行
watch(selected, () => { if (input.value.trim()) run() })

function run() {
  error.value = ''
  treeData.value = null
  isValid.value = null
  formatted.value = ''

  if (!input.value.trim()) return

  try {
    switch (selected.value) {
      case '格式化': {
        const parsed = JSON.parse(input.value)
        formatted.value = JSON.stringify(parsed, null, 2)
        treeData.value = parsed
        input.value = formatted.value
        isValid.value = true
        break
      }
      case '压缩': {
        const parsed = JSON.parse(input.value)
        formatted.value = JSON.stringify(parsed)
        input.value = formatted.value
        isValid.value = true
        break
      }
      case '校验': {
        JSON.parse(input.value)
        isValid.value = true
        break
      }
      case '转义': {
        const compressed = JSON.stringify(JSON.parse(input.value))
        formatted.value = JSON.stringify(compressed)
        input.value = formatted.value
        isValid.value = true
        break
      }
      case '去转义': {
        formatted.value = JSON.parse(input.value)
        input.value = typeof formatted.value === 'string' ? formatted.value : JSON.stringify(formatted.value, null, 2)
        isValid.value = true
        break
      }
    }
    save(input.value)
    generateCode()
  } catch (e) {
    error.value = e.message
    isValid.value = false
    codeOutput.value = ''
  }
}

// 代码转换
watch(codeLang, generateCode)

function generateCode() {
  if (isValid.value !== true) { codeOutput.value = ''; return }
  try {
    const parsed = JSON.parse(input.value)
    codeOutput.value = jsonToCode(parsed, codeLang.value)
  } catch {
    codeOutput.value = ''
  }
}

function jsonToCode(obj, lang) {
  switch (lang) {
    case 'Objective-C': return jsonToObjC(obj)
    case 'Swift': return jsonToSwift(obj)
    case 'Java': return jsonToJava(obj)
    case 'Kotlin': return jsonToKotlin(obj)
    case 'Python': return jsonToPython(obj)
    case 'JavaScript': return jsonToJS(obj)
    case 'TypeScript': return jsonToTS(obj)
    case 'Go': return jsonToGo(obj)
    case 'Rust': return jsonToRust(obj)
    case 'C#': return jsonToCSharp(obj)
    case 'PHP': return jsonToPHP(obj)
    case 'Ruby': return jsonToRuby(obj)
    case 'Dart': return jsonToDart(obj)
    default: return JSON.stringify(obj, null, 2)
  }
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1) }
function snakeCase(s) { return s.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '') }
function camelCase(s) { return s.replace(/[_-](\w)/g, (_, c) => c.toUpperCase()) }

// Objective-C
function jsonToObjC(obj, name = 'Root') {
  const lines = []
  if (Array.isArray(obj)) {
    lines.push(`NSArray *${camelCase(name)} = @[`)
    obj.forEach((v, i) => {
      const comma = i < obj.length - 1 ? ',' : ''
      if (typeof v === 'string') lines.push(`    @"${v}"${comma}`)
      else if (typeof v === 'number') lines.push(`    @${v}${comma}`)
      else if (typeof v === 'boolean') lines.push(`    @${v ? 'YES' : 'NO'}${comma}`)
      else if (v === null) lines.push(`    [NSNull null]${comma}`)
      else lines.push(`    /* nested object */${comma}`)
    })
    lines.push('];')
  } else if (typeof obj === 'object' && obj !== null) {
    lines.push(`// ${name}.h`)
    lines.push(`@interface ${capitalize(name)} : NSObject`)
    for (const [k, v] of Object.entries(obj)) {
      const type = v === null ? 'id' : Array.isArray(v) ? 'NSArray *' : typeof v === 'string' ? 'NSString *' : typeof v === 'number' ? (Number.isInteger(v) ? 'NSInteger' : 'CGFloat') : typeof v === 'boolean' ? 'BOOL' : `${capitalize(k)} *`
      const mod = typeof v === 'string' || Array.isArray(v) || (typeof v === 'object' && v !== null) ? 'copy' : 'assign'
      if (type === 'NSInteger' || type === 'CGFloat' || type === 'BOOL') {
        lines.push(`@property (nonatomic, assign) ${type} ${camelCase(k)};`)
      } else {
        lines.push(`@property (nonatomic, ${mod}) ${type}${camelCase(k)};`)
      }
    }
    lines.push('@end')
    lines.push('')
    lines.push(`// Dictionary literal`)
    lines.push(`NSDictionary *dict = @{`)
    const entries = Object.entries(obj)
    entries.forEach(([k, v], i) => {
      const comma = i < entries.length - 1 ? ',' : ''
      const val = v === null ? '[NSNull null]' : typeof v === 'string' ? `@"${v}"` : typeof v === 'number' ? `@${v}` : typeof v === 'boolean' ? `@${v ? 'YES' : 'NO'}` : '/* ... */'
      lines.push(`    @"${k}": ${val}${comma}`)
    })
    lines.push('};')
  }
  return lines.join('\n')
}

// Swift
function jsonToSwift(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const lines = [`struct ${capitalize(name)}: Codable {`]
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'Any?' : Array.isArray(v) ? `[${guessSwiftType(v)}]` : typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'Int' : 'Double') : typeof v === 'boolean' ? 'Bool' : capitalize(k)
    lines.push(`    var ${camelCase(k)}: ${type}`)
  }
  lines.push('}')
  return lines.join('\n')
}
function guessSwiftType(arr) {
  if (!arr.length) return 'Any'
  const v = arr[0]
  return typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'Int' : 'Double') : typeof v === 'boolean' ? 'Bool' : 'Any'
}

// Java
function jsonToJava(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const lines = [`public class ${capitalize(name)} {`]
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'Object' : Array.isArray(v) ? `List<${guessJavaType(v)}>` : typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'double') : typeof v === 'boolean' ? 'boolean' : capitalize(k)
    lines.push(`    private ${type} ${camelCase(k)};`)
  }
  lines.push('}')
  return lines.join('\n')
}
function guessJavaType(arr) {
  if (!arr.length) return 'Object'
  const v = arr[0]
  return typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'Integer' : 'Double') : 'Object'
}

// Kotlin
function jsonToKotlin(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const fields = Object.entries(obj).map(([k, v]) => {
    const type = v === null ? 'Any?' : Array.isArray(v) ? `List<${guessSwiftType(v)}>` : typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'Int' : 'Double') : typeof v === 'boolean' ? 'Boolean' : capitalize(k)
    return `    val ${camelCase(k)}: ${type}`
  })
  return `data class ${capitalize(name)}(\n${fields.join(',\n')}\n)`
}

// Python
function jsonToPython(obj) {
  return JSON.stringify(obj, null, 4)
    .replace(/null/g, 'None').replace(/true/g, 'True').replace(/false/g, 'False')
}

// JavaScript
function jsonToJS(obj) {
  return `const data = ${JSON.stringify(obj, null, 2)};`
}

// TypeScript
function jsonToTS(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return `const data: any = ${JSON.stringify(obj)};`
  const lines = [`interface ${capitalize(name)} {`]
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'any' : Array.isArray(v) ? `${guessTSType(v)}[]` : typeof v === 'string' ? 'string' : typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'boolean' : capitalize(k)
    lines.push(`  ${k}: ${type};`)
  }
  lines.push('}')
  return lines.join('\n')
}
function guessTSType(arr) {
  if (!arr.length) return 'any'
  const v = arr[0]
  return typeof v === 'string' ? 'string' : typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'boolean' : 'any'
}

// Go
function jsonToGo(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const lines = [`type ${capitalize(name)} struct {`]
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'interface{}' : Array.isArray(v) ? `[]${guessGoType(v)}` : typeof v === 'string' ? 'string' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'float64') : typeof v === 'boolean' ? 'bool' : capitalize(k)
    lines.push(`\t${capitalize(k)} ${type} \`json:"${k}"\``)
  }
  lines.push('}')
  return lines.join('\n')
}
function guessGoType(arr) {
  if (!arr.length) return 'interface{}'
  const v = arr[0]
  return typeof v === 'string' ? 'string' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'float64') : 'interface{}'
}

// Rust
function jsonToRust(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const lines = ['#[derive(Serialize, Deserialize, Debug)]', `pub struct ${capitalize(name)} {`]
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'Option<serde_json::Value>' : Array.isArray(v) ? `Vec<${guessRustType(v)}>` : typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'i64' : 'f64') : typeof v === 'boolean' ? 'bool' : capitalize(k)
    lines.push(`    pub ${snakeCase(k)}: ${type},`)
  }
  lines.push('}')
  return lines.join('\n')
}
function guessRustType(arr) {
  if (!arr.length) return 'serde_json::Value'
  const v = arr[0]
  return typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'i64' : 'f64') : 'serde_json::Value'
}

// C#
function jsonToCSharp(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const lines = [`public class ${capitalize(name)} {`]
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'object' : Array.isArray(v) ? `List<${guessCSharpType(v)}>` : typeof v === 'string' ? 'string' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'double') : typeof v === 'boolean' ? 'bool' : capitalize(k)
    lines.push(`    public ${type} ${capitalize(k)} { get; set; }`)
  }
  lines.push('}')
  return lines.join('\n')
}
function guessCSharpType(arr) {
  if (!arr.length) return 'object'
  const v = arr[0]
  return typeof v === 'string' ? 'string' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'double') : 'object'
}

// PHP
function jsonToPHP(obj) {
  function convert(v, indent = 0) {
    const pad = '    '.repeat(indent)
    if (v === null) return 'null'
    if (typeof v === 'boolean') return v ? 'true' : 'false'
    if (typeof v === 'number') return String(v)
    if (typeof v === 'string') return `'${v.replace(/'/g, "\\'")}'`
    if (Array.isArray(v)) {
      if (!v.length) return '[]'
      const items = v.map(i => `${pad}    ${convert(i, indent + 1)}`).join(',\n')
      return `[\n${items}\n${pad}]`
    }
    const items = Object.entries(v).map(([k, val]) => `${pad}    '${k}' => ${convert(val, indent + 1)}`).join(',\n')
    return `[\n${items}\n${pad}]`
  }
  return `$data = ${convert(obj)};`
}

// Ruby
function jsonToRuby(obj) {
  return JSON.stringify(obj, null, 2)
    .replace(/null/g, 'nil').replace(/true/g, 'true').replace(/false/g, 'false')
    .replace(/"(\w+)":/g, '$1:')
}

// Dart
function jsonToDart(obj, name = 'Root') {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const lines = [`class ${capitalize(name)} {`]
  for (const [k, v] of Object.entries(obj)) {
    const type = v === null ? 'dynamic' : Array.isArray(v) ? `List<${guessDartType(v)}>` : typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'double') : typeof v === 'boolean' ? 'bool' : capitalize(k)
    lines.push(`  ${type}? ${camelCase(k)};`)
  }
  lines.push(`\n  ${capitalize(name)}.fromJson(Map<String, dynamic> json) {`)
  for (const k of Object.keys(obj)) {
    lines.push(`    ${camelCase(k)} = json['${k}'];`)
  }
  lines.push('  }')
  lines.push('}')
  return lines.join('\n')
}
function guessDartType(arr) {
  if (!arr.length) return 'dynamic'
  const v = arr[0]
  return typeof v === 'string' ? 'String' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'double') : 'dynamic'
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="mono text-xl font-semibold flex items-center gap-2.5">
        <span class="w-8 h-8 flex items-center justify-center bg-[var(--accent-dim)] rounded border border-[var(--accent)]/20 text-[var(--accent)]">{ }</span>
        JSON 工具
      </h2>
      <p class="text-[var(--text-3)] text-[12px] mt-1 ml-[42px]">点击操作按钮即时执行，右侧转换为目标代码</p>
    </div>

    <!-- Mode pills as action buttons -->
    <div class="flex flex-wrap gap-1.5 mb-4">
      <button
        v-for="m in modes"
        :key="m"
        :class="[
          'px-3 py-1 text-[12px] mono rounded border transition-all duration-150 cursor-pointer',
          selected === m
            ? 'bg-[var(--accent)] border-[var(--accent)] text-black font-semibold'
            : 'bg-transparent border-[var(--border)] text-[var(--text-2)] hover:border-[var(--text-3)] hover:text-[var(--text)]'
        ]"
        @click="selected = m; run()"
      >{{ m }}</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
      <!-- Left: Content area -->
      <div class="flex flex-col gap-1">
        <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium flex items-center gap-2">
          内容
          <CopyBtn :value="input" />
        </label>
        <div
          :class="[
            'flex flex-col rounded overflow-hidden transition-colors duration-200',
            isValid === true ? 'border-2 border-emerald-500/60' : isValid === false ? 'border-2 border-red-500/60' : 'border border-[var(--border)]'
          ]"
        >
          <!-- Tree view when formatted -->
          <div v-if="treeData && selected === '格式化'" class="bg-[var(--bg)] p-4 min-h-[500px] max-h-[700px] overflow-auto mono text-[13px] leading-[1.8] flex-1">
            <JsonTree :data="treeData" :root="true" />
          </div>
          <!-- Code editor otherwise -->
          <CodeEditor v-else v-model="input" placeholder='输入或粘贴 JSON...' minHeight="500px" />

          <!-- Error bar at bottom -->
          <div v-if="isValid === false" class="px-3 py-2 bg-red-500/10 border-t border-red-500/30 text-red-400 text-[12px] mono">
            ❌ {{ error }}
          </div>
          <!-- Success bar -->
          <div v-else-if="isValid === true && selected === '校验'" class="px-3 py-2 bg-emerald-500/10 border-t border-emerald-500/30 text-emerald-400 text-[12px] mono">
            ✅ JSON 格式校验通过
          </div>
        </div>
      </div>

      <!-- Right: Code conversion -->
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <label class="text-[11px] text-[var(--text-3)] uppercase tracking-wide font-medium">转为代码</label>
          <select v-model="codeLang" class="!w-auto !text-[11px] !py-1 !px-2 !font-sans">
            <option v-for="lang in codeLangs" :key="lang">{{ lang }}</option>
          </select>
          <CopyBtn :value="codeOutput" />
        </div>
        <div class="border border-[var(--border)] rounded bg-[var(--bg)] flex-1 overflow-hidden">
          <CodeEditor :modelValue="codeOutput" :readonly="true" placeholder="输入有效 JSON 后自动生成代码..." minHeight="500px" textClass="!text-sky-300" />
        </div>
      </div>
    </div>
  </div>
</template>
