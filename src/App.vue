<template>
  <router-view />
  <FloatingAIAssistant />
</template>

<script setup>
import FloatingAIAssistant from './components/FloatingAIAssistant.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --font-display: 'Orbitron', 'Noto Sans SC', sans-serif;
  --font-body: 'Noto Sans SC', 'Microsoft YaHei', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  --color-bg-deep: #05081a;
  --color-bg-card: rgba(10, 16, 40, 0.75);
  --color-cyan: #00d4ff;
  --color-magenta: #ff3da6;
  --color-green: #00ffa3;
  --color-amber: #ffb547;
  --color-text: #e6f1ff;
  --color-text-dim: rgba(230, 241, 255, 0.55);
}

html, body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

#app {
  width: 100%;
  min-height: 100vh;
}

body {
  font-family: var(--font-body);
  background: var(--color-bg-deep);
  color: var(--color-text);
  overflow-y: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 212, 255, 0.05);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(0, 212, 255, 0.4), rgba(255, 61, 166, 0.3));
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(0, 212, 255, 0.6), rgba(255, 61, 166, 0.5));
}

::selection {
  background: rgba(0, 212, 255, 0.3);
  color: #fff;
}
</style>