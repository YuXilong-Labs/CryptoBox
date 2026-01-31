<script setup>
import { ref } from 'vue'

const props = defineProps({
  inputLabel: { type: String, default: '输入 · 明文' },
  outputLabel: { type: String, default: '输出 · 密文' },
  inputValue: { type: String, default: '' },
  outputValue: { type: String, default: '' },
  outputMeta: { type: String, default: '' },
  inputPlaceholder: { type: String, default: '输入明文…' },
  outputPlaceholder: { type: String, default: '点击操作按钮执行，结果将显示在这里' },
  inputTabs: { type: Array, default: () => ['UTF-8', 'Hex', 'Base64'] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:inputValue', 'paste', 'clear', 'copy', 'save', 'swap'])
const activeTab = ref('UTF-8')
const copyOk = ref(false)
const pasteOk = ref(false)

async function handlePaste() {
  try {
    const text = await navigator.clipboard.readText()
    emit('update:inputValue', text)
    pasteOk.value = true
    setTimeout(() => pasteOk.value = false, 1500)
  } catch {
    emit('paste')
  }
}

function doCopy(val) {
  if (!val) return
  navigator.clipboard?.writeText(val).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = val
    ta.style.cssText = 'position:fixed;left:-9999px;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy') } catch {}
    document.body.removeChild(ta)
  })
}

function copyOutput() {
  doCopy(props.outputValue)
  copyOk.value = true
  setTimeout(() => copyOk.value = false, 1500)
  emit('copy')
}
</script>

<template>
  <div class="io-layout fade d2">
    <!-- Input -->
    <div class="io-box">
      <div class="io-top">
        <div class="io-title"><div class="io-dot"></div>{{ inputLabel }}</div>
        <div class="io-btns">
          <button class="io-btn" @click="handlePaste">{{ pasteOk ? '✓ 已粘贴' : '粘贴' }}</button>
          <button class="io-btn" @click="$emit('clear')">清空</button>
        </div>
      </div>
      <textarea
        class="io-area"
        :value="inputValue"
        @input="$emit('update:inputValue', $event.target.value)"
        :placeholder="inputPlaceholder"
      />
      <div class="io-footer">
        <button
          v-for="tab in inputTabs" :key="tab"
          :class="['io-ftab', activeTab === tab && 'active']"
          @click="activeTab = tab"
        >{{ tab }}</button>
      </div>
    </div>

    <!-- Center -->
    <div class="io-center">
      <div class="center-config">
        <slot name="config" />
      </div>
      <div class="center-actions">
        <slot name="actions" />
        <button class="ca-swap" title="交换输入输出" @click="$emit('swap')">⇄</button>
      </div>
    </div>

    <!-- Output -->
    <div class="io-box">
      <div class="io-top">
        <div class="io-title"><div class="io-dot out"></div>{{ outputLabel }}</div>
        <div class="io-btns">
          <button class="io-btn" @click="copyOutput">{{ copyOk ? '✓ 已复制' : '复制' }}</button>
          <button class="io-btn" @click="$emit('save')">保存</button>
        </div>
      </div>
      <textarea class="io-area output" readonly :placeholder="outputPlaceholder" :value="outputValue" />
      <div v-if="outputMeta" class="io-meta">{{ outputMeta }}</div>
    </div>
  </div>
</template>

<style>
/* IO 三栏布局 */
.io-layout { display: grid; grid-template-columns: 1fr 180px 1fr; gap: 0; align-items: stretch; }
.io-layout .io-box { min-height: calc(100vh - 260px); display: flex; flex-direction: column; }

.io-box {
  border-radius: var(--radius-lg); border: 1px solid var(--border);
  background: var(--bg-1); overflow: hidden;
  transition: border var(--transition);
  display: flex; flex-direction: column;
}
.io-box:focus-within { border-color: var(--border-focus); }

.io-top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-bottom: 1px solid var(--border);
}
.io-title {
  font-size: 12px; font-weight: 600; color: var(--text-2);
  text-transform: uppercase; letter-spacing: 0.5px;
  display: flex; align-items: center; gap: 6px;
}
.io-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); }
.io-dot.out { background: var(--green); }

.io-btns { display: flex; gap: 2px; }
.io-btn {
  padding: 4px 10px; border-radius: 4px; border: none;
  background: none; color: var(--text-3); font-size: 12px;
  cursor: pointer; transition: all 0.1s;
}
.io-btn:hover { color: var(--text-1); background: var(--surface-hover); }

.io-area {
  width: 100%; padding: 14px; flex: 1; min-height: 0;
  background: transparent; border: none; resize: none;
  color: var(--text-1); font-family: var(--mono); font-size: 13.5px;
  line-height: 1.65; outline: none;
}
.io-area::placeholder { color: var(--text-3); }
.io-area.output { color: var(--green); }

.io-footer { padding: 8px 14px; border-top: 1px solid var(--border); display: flex; gap: 0; }
.io-ftab {
  padding: 3px 8px; border-radius: 4px; border: none;
  background: none; color: var(--text-3); font-size: 11px;
  font-family: var(--mono); cursor: pointer; transition: all 0.1s;
}
.io-ftab:hover { color: var(--text-2); }
.io-ftab.active { color: var(--accent); background: var(--accent-soft); }

.io-meta {
  padding: 8px 14px; border-top: 1px solid var(--border);
  font-size: 11px; color: var(--text-3); font-family: var(--mono);
}

/* Center column */
.io-center { display: flex; flex-direction: column; padding: 0 12px; justify-content: space-between; }
.center-config { display: flex; flex-direction: column; gap: 10px; padding-top: 12px; }
.center-actions { display: flex; flex-direction: column; gap: 6px; padding-bottom: 12px; }

.cc-group { display: flex; flex-direction: column; gap: 3px; }
.cc-label { font-size: 10px; color: var(--text-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; }
.cc-select {
  width: 100%; padding: 6px 8px; border-radius: 5px;
  border: 1px solid var(--border); background: var(--bg-1);
  color: var(--text-1); font-size: 12px; font-family: var(--mono);
  outline: none; appearance: none; cursor: pointer; transition: border var(--transition);
}
.cc-select:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-glow); }

.ca-btn {
  width: 100%; padding: 8px 0; border-radius: 7px;
  border: 1px solid var(--border); background: var(--bg-1);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--text-2); font-size: 13px; font-weight: 600; font-family: var(--font);
  transition: all var(--transition);
}
.ca-btn:hover { border-color: var(--border-hover); color: var(--text-0); background: var(--bg-2); }
.ca-btn:active { transform: scale(0.97); }
.ca-btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.ca-btn.primary:hover { filter: brightness(1.1); }
.ca-btn .spinner {
  display: none; width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.6s linear infinite;
}
.ca-btn.loading .spinner { display: block; }
.ca-btn.loading .btn-text { display: none; }

.ca-swap {
  width: 100%; padding: 6px 0; border-radius: 6px;
  border: 1px solid var(--border); background: none;
  cursor: pointer; color: var(--text-3); font-size: 16px;
  transition: all var(--transition); text-align: center;
}
.ca-swap:hover { color: var(--text-1); border-color: var(--border-hover); background: var(--surface-hover); }
.ca-swap:active { transform: scale(0.95); }

/* Key/IV bar */
.key-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.key-group { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 200px; }
.cfg-label { font-size: 12px; color: var(--text-3); font-weight: 500; white-space: nowrap; }
.key-input-wrap { position: relative; flex: 1; }
.key-input {
  width: 100%; padding: 7px 32px 7px 10px; border-radius: 5px;
  border: 1px solid var(--border); background: var(--bg-1); color: var(--text-1);
  font-size: 12px; font-family: var(--mono); outline: none; transition: border var(--transition);
}
.key-input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-glow); }
.key-copy-btn {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: var(--text-3);
  font-size: 11px; padding: 2px; transition: color 0.1s;
}
.key-copy-btn:hover { color: var(--accent); }
.qbtn {
  padding: 5px 10px; border-radius: 5px; font-size: 11px;
  border: 1px solid var(--border); background: none; color: var(--text-2);
  cursor: pointer; font-family: var(--mono); transition: all var(--transition); white-space: nowrap;
}
.qbtn:hover { border-color: var(--border-hover); color: var(--text-1); background: var(--surface-hover); }
.qbtn:active { transform: scale(0.97); }

/* Tool page header */
.tool-header { margin-bottom: 20px; }
.tool-header h1 {
  font-size: 22px; font-weight: 600; color: var(--text-0);
  letter-spacing: -0.3px; margin-bottom: 2px;
}
.tool-header p { font-size: 13px; color: var(--text-2); }

/* Mobile */
@media (max-width: 768px) {
  .io-layout { grid-template-columns: 1fr; }
  .io-layout .io-box { min-height: 250px; }
  .io-center { flex-direction: row; flex-wrap: wrap; padding: 12px 0; gap: 8px; }
  .center-config, .center-actions { flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .key-bar { flex-direction: column; }
}
</style>
