<script>
export default {
  name: 'JsonTree',
  props: {
    data: { required: true },
    keyName: { type: String, default: '' },
    root: { type: Boolean, default: false },
    isLast: { type: Boolean, default: true },
  },
  data() {
    return { collapsed: false }
  },
  computed: {
    isObject() { return this.data !== null && typeof this.data === 'object' && !Array.isArray(this.data) },
    isArray() { return Array.isArray(this.data) },
    isComplex() { return this.isObject || this.isArray },
    entries() {
      if (this.isArray) return this.data.map((v, i) => ({ key: String(i), value: v }))
      if (this.isObject) return Object.entries(this.data).map(([k, v]) => ({ key: k, value: v }))
      return []
    },
    childCount() { return this.entries.length },
    typeLabel() { return this.isArray ? 'Array' : 'Object' },
    bracket() { return this.isArray ? ['[', ']'] : ['{', '}'] },
    comma() { return this.isLast ? '' : ',' },
  },
}
</script>

<template>
  <div :class="root ? '' : 'pl-5'">
    <template v-if="isComplex">
      <!-- Collapsible header -->
      <div
        class="flex items-start gap-1 cursor-pointer select-none hover:bg-white/5 rounded px-0.5 -ml-0.5 leading-relaxed"
        @click="collapsed = !collapsed"
      >
        <span class="w-3.5 text-center text-[11px] text-[var(--text-3)] shrink-0 mt-[2px]">{{ collapsed ? '▶' : '▼' }}</span>
        <span v-if="keyName" class="text-purple-300">"{{ keyName }}"</span>
        <span v-if="keyName" class="text-[var(--text-3)]">:&nbsp;</span>
        <span class="text-[var(--text-3)]">{{ bracket[0] }}</span>
        <span class="text-[var(--text-3)] text-[11px] ml-1 bg-[var(--bg-2)] px-1.5 py-0.5 rounded inline-flex items-center gap-1 shrink-0">
          <span class="text-[var(--text-2)]">{{ typeLabel }}</span>
          <span class="text-[var(--accent)]">{{ childCount }}</span>
        </span>
        <template v-if="collapsed">
          <span class="text-[var(--text-3)]">{{ bracket[1] }}{{ comma }}</span>
        </template>
      </div>
      <!-- Children -->
      <template v-if="!collapsed">
        <JsonTree
          v-for="(entry, i) in entries"
          :key="entry.key"
          :data="entry.value"
          :keyName="isArray ? String(i) : entry.key"
          :isLast="i === entries.length - 1"
        />
        <div class="pl-0"><span class="text-[var(--text-3)]">{{ bracket[1] }}{{ comma }}</span></div>
      </template>
    </template>

    <!-- Leaf value -->
    <template v-else>
      <div class="flex items-start gap-1 px-0.5 leading-relaxed">
        <span class="w-3.5 shrink-0"></span>
        <span v-if="keyName" class="text-purple-300">"{{ keyName }}"</span>
        <span v-if="keyName" class="text-[var(--text-3)]">:&nbsp;</span>
        <span v-if="data === null" class="text-red-300">null</span>
        <span v-else-if="typeof data === 'string'" class="text-green-300 break-all">"{{ data }}"</span>
        <span v-else-if="typeof data === 'number'" class="text-blue-300">{{ data }}</span>
        <span v-else-if="typeof data === 'boolean'" class="text-orange-300">{{ data }}</span>
        <span v-else class="text-[var(--text)]">{{ data }}</span>
        <span class="text-[var(--text-3)]">{{ comma }}</span>
      </div>
    </template>
  </div>
</template>
