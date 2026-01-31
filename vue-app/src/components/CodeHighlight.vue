<script setup>
import { computed, ref } from 'vue'
import hljs from 'highlight.js/lib/core'
import objc from 'highlight.js/lib/languages/objectivec'
import swift from 'highlight.js/lib/languages/swift'
import java from 'highlight.js/lib/languages/java'
import kotlin from 'highlight.js/lib/languages/kotlin'
import python from 'highlight.js/lib/languages/python'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import csharp from 'highlight.js/lib/languages/csharp'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import dart from 'highlight.js/lib/languages/dart'

hljs.registerLanguage('objectivec', objc)
hljs.registerLanguage('swift', swift)
hljs.registerLanguage('java', java)
hljs.registerLanguage('kotlin', kotlin)
hljs.registerLanguage('python', python)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('php', php)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('dart', dart)

const langMap = {
  'Objective-C': 'objectivec', 'Swift': 'swift', 'Java': 'java', 'Kotlin': 'kotlin',
  'Python': 'python', 'JavaScript': 'javascript', 'TypeScript': 'typescript',
  'Go': 'go', 'Rust': 'rust', 'C#': 'csharp', 'PHP': 'php', 'Ruby': 'ruby', 'Dart': 'dart',
}

const props = defineProps({
  code: { type: String, default: '' },
  language: { type: String, default: 'Objective-C' },
  minHeight: { type: String, default: '500px' },
})

const highlighted = computed(() => {
  if (!props.code) return ''
  const lang = langMap[props.language] || 'plaintext'
  try {
    return hljs.highlight(props.code, { language: lang }).value
  } catch {
    return props.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
})

const lines = computed(() => {
  if (!props.code) return [1]
  return props.code.split('\n').map((_, i) => i + 1)
})
</script>

<template>
  <div class="flex overflow-auto bg-[var(--bg-0)] rounded" :style="{ minHeight, maxHeight: '700px' }">
    <!-- Line numbers -->
    <div class="shrink-0 py-3 px-2 text-right select-none bg-[var(--bg-1)] border-r border-[var(--border)]">
      <div v-for="n in lines" :key="n" class="mono text-[12px] leading-[1.5] text-[var(--text-3)] h-[18px]">{{ n }}</div>
    </div>
    <!-- Code -->
    <pre class="flex-1 p-3 m-0 mono text-[13px] leading-[1.5] overflow-x-auto"><code v-html="highlighted"></code></pre>
  </div>
</template>

<style>
/* highlight.js dark theme inline */
.hljs { color: #c9d1d9; }
.hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: #ff7b72; }
.hljs-type, .hljs-class .hljs-title { color: #ffa657; }
.hljs-string, .hljs-attr { color: #a5d6ff; }
.hljs-number, .hljs-literal { color: #79c0ff; }
.hljs-comment { color: #8b949e; font-style: italic; }
.hljs-function .hljs-title, .hljs-title.function_ { color: #d2a8ff; }
.hljs-variable, .hljs-template-variable { color: #ffa657; }
.hljs-property { color: #7ee787; }
.hljs-params { color: #c9d1d9; }
.hljs-meta { color: #79c0ff; }
.hljs-symbol { color: #7ee787; }
.hljs-punctuation { color: #8b949e; }
.hljs-selector-class { color: #7ee787; }
.hljs-title.class_ { color: #ffa657; }
</style>
