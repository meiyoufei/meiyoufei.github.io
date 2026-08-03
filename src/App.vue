<template>
  <div class="layout">
    <header class="top-panel">
      <div class="panel-group panel-left">
        <button
          type="button"
          class="menu-toggle"
          :aria-expanded="menuOpen"
          aria-label="打开菜单"
          @click="menuOpen = !menuOpen"
        >
          <span></span>
          <span></span>
        </button>
        <span class="activities">活动</span>
        <div class="task-list" aria-label="已打开窗口">
          <button
            v-for="task in openTasks"
            :key="task.id"
            type="button"
            class="task-button"
            :class="{ active: isTaskActive(task) }"
            :title="task.windowTitle"
            @click="activateTask(task)"
          >
            <span class="task-dot"></span>
            {{ task.shortLabel }}
          </button>
        </div>
      </div>
      <strong class="panel-time">{{ panelTime }}</strong>
      <div class="panel-group system-status" aria-label="系统状态">
        <span>◉</span>
        <span>⌁</span>
        <span>▰</span>
      </div>
    </header>

    <aside class="aside" :class="{ open: menuOpen }">
      <div class="aside-inner">
        <header class="profile">
          <img class="avatar" src="/images/avatar.gif" alt="梅友飞" width="60" height="60" />
          <div class="profile-text">
            <h1 class="name">梅友飞</h1>
            <p class="role">全栈开发工程师</p>
          </div>
        </header>

        <p class="tagline">前端为主，全栈落地。</p>

        <nav class="nav" aria-label="主导航">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="item.to"
            class="nav-btn"
            :class="{ active: isActive(item) }"
            @click="openFromNavigation"
          >
            <span class="nav-line" aria-hidden="true"></span>
            <span class="nav-label">{{ item.label }}</span>
            <span class="nav-en" aria-hidden="true">{{ item.en }}</span>
          </RouterLink>
        </nav>

        <footer class="aside-foot">
          <a href="mailto:18737582236@163.com" class="foot-link">
            18737582236@163.com
          </a>
          <span class="foot-copyright">© {{ year }} · Build. Ship. Iterate.</span>
        </footer>
      </div>
    </aside>

    <div v-if="menuOpen" class="scrim" @click="menuOpen = false"></div>

    <main class="main">
      <button
        v-if="!isWindowOpen"
        type="button"
        class="desktop-launcher"
        aria-label="重新打开 Portfolio 窗口"
        @click="restoreWindow"
      >
        <span class="launcher-icon">⌘</span>
        <span>Portfolio</span>
      </button>

      <p v-if="isMinimized" class="desktop-hint">窗口已最小化，可从顶部任务栏恢复。</p>

      <section
        v-show="isWindowVisible"
        class="app-window"
        :class="{ 'is-terminal': isTerminal, maximized: isMaximized }"
      >
        <header class="window-bar">
          <strong class="window-title">{{ windowTitle }}</strong>
          <div class="window-controls">
            <button
              type="button"
              class="window-control minimize"
              aria-label="最小化窗口"
              title="最小化"
              @click="minimizeWindow"
            >
              <span class="control-icon">−</span>
            </button>
            <button
              type="button"
              class="window-control maximize"
              :aria-label="isMaximized ? '还原窗口' : '全屏窗口'"
              :title="isMaximized ? '还原' : '全屏'"
              @click="toggleMaximize"
            >
              <span class="control-icon">{{ isMaximized ? '❐' : '□' }}</span>
            </button>
            <button
              type="button"
              class="window-control close"
              :aria-label="isTerminal ? '关闭终端窗口' : '关闭当前窗口并返回终端'"
              title="关闭"
              @click="closeWindow"
            >
              <span class="control-icon">×</span>
            </button>
          </div>
        </header>

        <div ref="windowContent" class="window-content">
          <RouterView v-slot="{ Component, route: viewRoute }">
            <transition name="pane" mode="out-in">
              <component :is="Component" :key="viewRoute.fullPath" />
            </transition>
          </RouterView>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createCursorTrail } from './utils/bubbleCursor.js';

// 鼠标特效切换：'bubble' 气泡 | 'image' 图片轨迹
const CURSOR_TRAIL_MODE = 'bubble';

const navItems = [
  { name: 'about', to: '/about', label: '关于', en: 'About' },
  { name: 'skills', to: '/skills', label: '技能', en: 'Skills' },
  { name: 'projects', to: '/projects', label: '项目', en: 'Work' },
  { name: 'contact', to: '/contact', label: '联系', en: 'Contact' },
  { name: 'terminal', to: '/terminal', label: '终端', en: 'Shell' }
];

const route = useRoute();
const router = useRouter();
const menuOpen = ref(false);
const windowContent = ref(null);
const isWindowOpen = ref(true);
const isMinimized = ref(false);
const isMaximized = ref(false);
const panelTime = ref('');
const openTasks = ref([]);
const year = new Date().getFullYear();
let cursorTrail = null;
let clockTimer = null;
const isTerminal = computed(() => route.name === 'terminal');
const isWindowVisible = computed(() => isWindowOpen.value && !isMinimized.value);
const windowTitle = computed(() => route.meta.windowTitle || 'portfolio — 个人主页');

function taskIdFromRoute(target = route) {
  if (target.name === 'project-detail') {
    return `project:${target.params.id}`;
  }
  return String(target.name || target.path);
}

function createTaskFromRoute(target = route) {
  return {
    id: taskIdFromRoute(target),
    name: target.name,
    path: target.fullPath,
    shortLabel: target.meta.shortLabel || target.meta.title || 'Window',
    windowTitle: target.meta.windowTitle || target.meta.title || 'portfolio'
  };
}

function ensureTask(target = route) {
  if (!target.name || target.name === undefined) return;
  const next = createTaskFromRoute(target);
  const index = openTasks.value.findIndex((task) => task.id === next.id);
  if (index === -1) {
    openTasks.value.push(next);
  } else {
    openTasks.value[index] = next;
  }
}

function isTaskActive(task) {
  return isWindowVisible.value && task.id === taskIdFromRoute(route);
}

function isActive(item) {
  if (item.name === 'projects') {
    return route.path.startsWith('/projects');
  }
  return route.path === item.to;
}

function openFromNavigation() {
  menuOpen.value = false;
  isWindowOpen.value = true;
  isMinimized.value = false;
}

function minimizeWindow() {
  isMinimized.value = true;
  isMaximized.value = false;
}

function restoreWindow() {
  isWindowOpen.value = true;
  isMinimized.value = false;
  ensureTask(route);
}

function activateTask(task) {
  const isCurrent = task.id === taskIdFromRoute(route);

  if (!isWindowOpen.value || isMinimized.value) {
    restoreWindow();
    if (!isCurrent) {
      router.push(task.path);
    }
    return;
  }

  if (isCurrent) {
    minimizeWindow();
    return;
  }

  router.push(task.path);
}

function toggleMaximize() {
  isMaximized.value = !isMaximized.value;
}

function closeWindow() {
  isMaximized.value = false;
  const currentId = taskIdFromRoute(route);
  const remaining = openTasks.value.filter((task) => task.id !== currentId);
  openTasks.value = remaining;

  if (isTerminal.value) {
    if (remaining.length) {
      router.push(remaining[remaining.length - 1].path);
      return;
    }
    isWindowOpen.value = false;
    isMinimized.value = false;
    return;
  }

  const terminalTask = remaining.find((task) => task.name === 'terminal');
  const fallback = window.matchMedia('(max-width: 860px)').matches ? '/about' : '/terminal';
  router.push(terminalTask?.path || remaining[remaining.length - 1]?.path || fallback);
}

function updatePanelTime() {
  panelTime.value = new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date());
}

watch(
  () => route.fullPath,
  async () => {
    if (isWindowOpen.value) {
      ensureTask(route);
      isMinimized.value = false;
    }
    await nextTick();
    windowContent.value?.scrollTo({ top: 0, behavior: 'auto' });
  },
  { immediate: true }
);

onMounted(() => {
  updatePanelTime();
  clockTimer = window.setInterval(updatePanelTime, 30000);

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const narrowScreen = window.matchMedia('(max-width: 860px)').matches;
  if (coarsePointer || narrowScreen) return;

  cursorTrail = createCursorTrail(
    CURSOR_TRAIL_MODE === 'image'
      ? {
          mode: 'image',
          imageSrc: '/images/tongluoshao.svg',
          size: 28,
          minDistance: 28,
          maxParticles: 16,
          spawnChance: 0.65
        }
      : {
          mode: 'bubble',
          minDistance: 6,
          maxParticles: 28,
          spawnChance: 0.75
        }
  );
});

onUnmounted(() => {
  window.clearInterval(clockTimer);
  cursorTrail?.destroy();
});
</script>

<style scoped>
.layout {
  --workspace-gap: clamp(20px, 4vh, 42px);
  --panel-height: 34px;
  display: grid;
  grid-template-columns: minmax(260px, 300px) 1fr;
  grid-template-rows: var(--panel-height) minmax(0, 1fr);
  width: 100%;
  height: 100vh;
  height: 100dvh;
  max-width: 100vw;
  overflow: hidden;
  background:
    radial-gradient(circle at 85% 12%, rgba(255, 255, 255, 0.82), transparent 30%),
    var(--bg);
}

.top-panel {
  grid-column: 1 / -1;
  grid-row: 1;
  position: relative;
  z-index: 100;
  box-sizing: border-box;
  height: var(--panel-height);
  min-width: 0;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #f4f4f1;
  background: #242522;
  font-family: 'LXGW WenKai', 'Microsoft YaHei', sans-serif;
  font-size: 0.78rem;
  user-select: none;
  overflow: hidden;
}

.panel-group {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-left {
  flex: 1;
  min-width: 0;
  padding-right: 16px;
}

.activities {
  flex-shrink: 0;
  padding: 2px 9px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
}

.task-list {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.task-list::-webkit-scrollbar {
  display: none;
}

.task-button {
  flex-shrink: 0;
  max-width: 148px;
  padding: 2px 8px;
  overflow: hidden;
  border: 0;
  border-radius: 4px;
  color: #c7cbc4;
  background: transparent;
  font: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.task-button:hover,
.task-button.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.task-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 5px;
  border-radius: 50%;
  background: #74c486;
  vertical-align: middle;
}

.task-button:not(.active) .task-dot {
  background: #777b75;
}

.panel-time {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.system-status {
  font-family: monospace;
}

.aside {
  grid-column: 1;
  grid-row: 2;
  position: relative;
  height: auto;
  min-height: 0;
  margin: var(--workspace-gap) 0 var(--workspace-gap) clamp(18px, 3vw, 38px);
  overflow: hidden;
  border: 1px solid rgba(22, 22, 22, 0.16);
  border-radius: 10px;
  background: var(--bg);
  box-shadow: 0 18px 50px rgba(31, 32, 29, 0.13);
  z-index: 20;
}

.aside-inner {
  height: 100%;
  padding: clamp(32px, 5vh, 48px) 30px 26px;
  display: flex;
  flex-direction: column;
}

/* ---- profile ---- */
.profile {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 26px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--panel);
  box-shadow: 0 0 0 1px var(--line), 0 6px 16px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.name {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1.2;
}

.role {
  color: var(--muted);
  font-size: 0.95rem;
  margin-top: 2px;
}

.tagline {
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.85;
  padding-bottom: 30px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--line);
}

/* ---- nav ---- */
.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  padding-top: 10px;
}

.nav-btn {
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 13px 4px;
  color: var(--muted);
  text-align: left;
  text-decoration: none;
  transition: color 0.25s ease;
}

.nav-line {
  width: 22px;
  height: 1.5px;
  background: currentColor;
  opacity: 0.45;
  flex-shrink: 0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
}

.nav-label {
  font-size: 1.15rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  transition: letter-spacing 0.3s ease;
}

.nav-en {
  margin-left: auto;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.nav-btn:hover {
  color: var(--ink);
}

.nav-btn:hover .nav-line {
  width: 34px;
  opacity: 0.8;
}

.nav-btn:hover .nav-en {
  opacity: 0.4;
  transform: translateX(0);
}

.nav-btn.active {
  color: var(--ink);
}

.nav-btn.active .nav-line {
  width: 48px;
  opacity: 1;
  height: 2px;
  background: var(--accent);
}

.nav-btn.active .nav-label {
  letter-spacing: 0.2em;
  font-weight: 700;
}

.nav-btn.active .nav-en {
  opacity: 0.7;
  transform: translateX(0);
  color: var(--accent);
}

/* ---- footer ---- */
.aside-foot {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.foot-link {
  color: var(--ink);
  font-size: 0.85rem;
  text-decoration: none;
  letter-spacing: 0.02em;
  transition: color 0.2s ease;
  width: fit-content;
  border-bottom: 1px solid transparent;
}

.foot-link:hover {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.foot-copyright {
  color: var(--muted);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  opacity: 0.75;
}

/* ---- main ---- */
.main {
  grid-column: 2;
  grid-row: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  padding: var(--workspace-gap) clamp(18px, 3vw, 38px) var(--workspace-gap) 18px;
}

.desktop-launcher {
  position: absolute;
  top: var(--workspace-gap);
  left: 34px;
  display: grid;
  justify-items: center;
  gap: 7px;
  padding: 10px;
  border: 0;
  border-radius: 7px;
  color: var(--ink);
  background: transparent;
  font-family: inherit;
  cursor: pointer;
}

.desktop-launcher:hover {
  background: rgba(255, 255, 255, 0.5);
}

.launcher-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: #fff;
  background: #356a54;
  font: 700 1.4rem monospace;
  box-shadow: 0 8px 20px rgba(31, 32, 29, 0.16);
}

.desktop-hint {
  position: absolute;
  left: 50%;
  top: 50%;
  margin: 0;
  color: var(--muted);
  font-size: 0.85rem;
  transform: translate(-50%, -50%);
}

.app-window {
  flex: 1 1 auto;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(22, 22, 22, 0.2);
  border-radius: 10px;
  background: var(--panel);
  box-shadow: 0 24px 64px rgba(31, 32, 29, 0.18);
  transition: border-radius 0.18s ease, box-shadow 0.18s ease;
}

.app-window.maximized {
  position: fixed;
  inset: 34px 0 0;
  z-index: 80;
  width: auto;
  height: auto;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.window-bar {
  position: relative;
  flex-shrink: 0;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-bottom: 1px solid #ceccc5;
  background: #e7e5df;
  user-select: none;
  min-width: 0;
}

.window-title {
  max-width: calc(100% - 100px);
  min-width: 0;
  overflow: hidden;
  font-size: 0.82rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.window-controls {
  position: absolute;
  right: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.window-control {
  width: 13px;
  height: 13px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: rgba(30, 30, 28, 0.78);
  font-family: Arial, sans-serif;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.window-control.minimize {
  background: #e7b94c;
}

.window-control.maximize {
  background: #62ad69;
}

.window-control.close {
  background: #d9655d;
}

.window-control:hover {
  transform: scale(1.15);
}

.window-control.close:hover {
  box-shadow: 0 0 0 3px rgba(217, 101, 93, 0.18);
}

.control-icon {
  opacity: 0;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  transform: translateY(-0.3px);
  transition: opacity 0.12s ease;
}

.window-controls:hover .control-icon,
.window-control:focus-visible .control-icon {
  opacity: 1;
}

.window-content {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  padding: clamp(34px, 6vh, 64px) clamp(24px, 5vw, 64px);
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--panel);
}

.window-content :deep(.pane) {
  width: 100%;
  max-width: 100%;
  margin-inline: auto;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.is-terminal .window-content {
  padding: 0;
  background: #242723;
}

.pane-enter-active,
.pane-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.pane-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.pane-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.menu-toggle,
.scrim {
  display: none;
}

@media (max-height: 650px) and (min-width: 861px) {
  .aside-inner {
    padding-top: 24px;
    padding-bottom: 18px;
  }

  .profile {
    margin-bottom: 16px;
  }

  .avatar {
    width: 52px;
    height: 52px;
  }

  .tagline {
    padding-bottom: 16px;
    margin-bottom: 2px;
  }

  .nav {
    padding-top: 4px;
  }

  .nav-btn {
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .aside-foot {
    padding-top: 12px;
    gap: 4px;
  }
}

@media (max-width: 860px) {
  .layout {
    --panel-height: calc(34px + env(safe-area-inset-top, 0px));
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: var(--panel-height) minmax(0, 1fr);
    width: 100%;
    max-width: 100%;
  }

  .top-panel {
    height: var(--panel-height);
    padding-top: env(safe-area-inset-top, 0px);
    padding-left: max(10px, env(safe-area-inset-left, 0px));
    padding-right: max(10px, env(safe-area-inset-right, 0px));
  }

  .activities,
  .system-status,
  .panel-time {
    display: none;
  }

  .panel-left {
    flex: 1;
    min-width: 0;
    gap: 8px;
    padding-right: 0;
  }

  .menu-toggle {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.1);
    cursor: pointer;
    padding: 0 7px;
  }

  .menu-toggle span {
    display: block;
    height: 1.5px;
    background: #f4f4f1;
    border-radius: 2px;
  }

  .task-list {
    gap: 4px;
  }

  .task-button {
    max-width: 88px;
    padding: 3px 7px;
    font-size: 0.72rem;
  }

  .aside {
    position: fixed;
    left: max(8px, env(safe-area-inset-left, 0px));
    top: calc(var(--panel-height) + 8px);
    bottom: max(8px, env(safe-area-inset-bottom, 0px));
    height: auto;
    margin: 0;
    width: min(300px, calc(100% - 48px));
    max-width: calc(100vw - 48px);
    transform: translateX(calc(-105% - 8px));
    transition: transform 0.28s ease;
    z-index: 90;
  }

  .aside.open {
    transform: translateX(0);
    box-shadow: 16px 0 48px rgba(0, 0, 0, 0.18);
  }

  .aside-inner {
    padding: 28px 22px 20px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .foot-link {
    max-width: 100%;
    overflow-wrap: anywhere;
  }

  .scrim {
    display: block;
    position: fixed;
    top: var(--panel-height);
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(22, 22, 22, 0.34);
    z-index: 85;
  }

  .main {
    grid-column: 1;
    grid-row: 2;
    width: 100%;
    min-width: 0;
    min-height: 0;
    max-width: 100%;
    padding: 8px;
    padding-bottom: max(8px, env(safe-area-inset-bottom, 0px));
  }

  .app-window {
    width: 100%;
    max-width: 100%;
    border-radius: 8px;
  }

  .app-window.maximized {
    inset: var(--panel-height) 0 0;
  }

  .window-bar {
    height: 40px;
    padding: 0 10px;
  }

  .window-title {
    max-width: calc(100% - 72px);
    font-size: 0.75rem;
  }

  .window-controls {
    right: 10px;
    gap: 10px;
  }

  .window-control {
    width: 16px;
    height: 16px;
  }

  .control-icon,
  .window-controls:hover .control-icon {
    opacity: 1;
    font-size: 11px;
  }

  .window-control.maximize {
    display: none;
  }

  .window-content {
    padding: 24px 16px 28px;
  }

  .is-terminal .window-content {
    padding: 0;
  }

  .desktop-launcher {
    left: 18px;
    top: 18px;
  }

  .desktop-hint {
    width: min(80vw, 280px);
    text-align: center;
    line-height: 1.6;
  }
}

@media (max-width: 480px) {
  .task-button {
    max-width: 72px;
  }

  .nav-en {
    display: none;
  }

  .name {
    font-size: 1.35rem;
  }
}
</style>
