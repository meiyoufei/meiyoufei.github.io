<template>
  <div class="desk">
    <div class="grain" aria-hidden="true"></div>

    <button type="button" class="theme-fab" :aria-label="theme === 'dark' ? '切换到亮色' : '切换到暗色'" @click="toggleTheme">
      {{ theme === 'dark' ? '亮色' : '暗色' }}
    </button>

    <div class="layout">
      <aside class="pad">
        <div class="clip" aria-hidden="true">
          <span class="clip-top"></span>
          <span class="clip-body"></span>
        </div>
        <p class="pad-kicker">目录</p>
        <nav class="pad-nav" aria-label="页面导航">
          <button
            v-for="item in sections"
            :key="item.id"
            type="button"
            class="pad-link"
            :class="{ active: activeSection === item.id }"
            @click="goTo(item.id)"
          >
            {{ item.label }}
          </button>
        </nav>
        <div class="pad-card">
          <p class="pad-card-title">{{ profile.role }}</p>
          <p class="pad-card-sub">{{ profile.experience }}经验 · {{ age }}岁</p>
          <p class="pad-card-sub">{{ profile.education }}</p>
          <a class="pad-mail" :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        </div>
        <p class="pad-foot">更新于 {{ profile.lastUpdated }}</p>
      </aside>

      <main class="sheet">
        <span class="tape tape-top" aria-hidden="true"></span>

        <header class="hero">
          <figure class="photo">
            <img :src="profile.avatar" :alt="profile.name" width="96" height="96" />
          </figure>
          <div class="hero-body">
            <h1 class="name">{{ profile.name }}</h1>
            <p class="role">{{ profile.role }} · {{ profile.gender }} · {{ age }}岁</p>
            <p class="meta">{{ profile.education }} · {{ profile.experience }}经验 · {{ profile.email }}</p>
          </div>
        </header>

        <section id="about" class="block">
          <h2>个人介绍</h2>
          <div class="prose">
            <p v-for="(line, index) in profile.intro" :key="index">{{ line }}</p>
          </div>
        </section>

        <section id="skills" class="block">
          <h2>技能 <span class="h2-en">{{ totalSkills }} 项</span></h2>
          <div class="skill-stack">
            <div v-for="group in skillGroups" :key="group.category" class="skill-group">
              <p class="skill-category">{{ group.category }}</p>
              <ul class="sticker-list">
                <li v-for="item in group.items" :key="item.name" class="sticker">
                  <img v-if="!item.color" class="sticker-icon" :src="item.src" alt="" aria-hidden="true" />
                  <span v-else class="sticker-mask" :style="[maskStyle(item.src), { background: iconColor(item) }]" aria-hidden="true"></span>
                  {{ item.name }}
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="projects" class="block">
          <h2>项目 <span class="h2-en">{{ allProjects.length }} 个</span></h2>
          <ul class="project-list">
            <li v-for="project in allProjects" :key="project.id" class="project-item">
              <div class="project-head">
                <strong>{{ project.title }}</strong>
                <span class="project-period">{{ project.period }}</span>
              </div>
              <p v-if="project.subtitle" class="project-sub">{{ project.subtitle }}</p>
              <p class="project-summary">{{ project.summary }}</p>
              <ul v-if="project.techStack?.length" class="tags">
                <li v-for="tech in project.techStack.slice(0, 5)" :key="tech">{{ tech }}</li>
              </ul>
            </li>
          </ul>
        </section>

        <footer class="sheet-foot">
          <span>{{ profile.name }} · {{ profile.lastUpdated }}</span>
        </footer>
      </main>
    </div>

    <nav class="mobile-rail" aria-label="页面导航">
      <button
        v-for="item in sections"
        :key="item.id"
        type="button"
        :class="{ active: activeSection === item.id }"
        @click="goTo(item.id)"
      >
        {{ item.label }}
      </button>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { calcAge, profile } from './data/profile.js';
import { skillGroups } from './data/skills.js';
import { allProjects } from './data/projects.js';
import { useTheme } from './composables/useTheme.js';

const { theme, toggleTheme } = useTheme();
const activeSection = ref('about');
const age = computed(() => calcAge());
const totalSkills = computed(() => skillGroups.reduce((n, g) => n + g.items.length, 0));

const sections = [
  { id: 'about', label: '介绍' },
  { id: 'skills', label: '技能' },
  { id: 'projects', label: '项目' }
];

function iconColor(item) {
  if (theme.value === 'dark' && item.darkColor) return item.darkColor;
  return item.color;
}

function maskStyle(src) {
  return { WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` };
}

function goTo(id) {
  activeSection.value = id;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

let scrollTicking = false;

function updateActive() {
  const probe = 160;
  let current = sections[0].id;
  for (const item of sections) {
    const el = document.getElementById(item.id);
    if (el && el.getBoundingClientRect().top <= probe) current = item.id;
  }
  if (current !== activeSection.value) activeSection.value = current;
  scrollTicking = false;
}

function onScroll() {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(updateActive);
}

onMounted(() => {
  updateActive();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<style scoped>
.desk {
  position: relative;
  min-height: 100vh;
  padding: 20px 20px 72px;
}

.grain {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.22;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.22'/></svg>");
}

[data-theme='dark'] .grain {
  opacity: 0.12;
}

.theme-fab {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 30;
  padding: 6px 14px;
  background: var(--slip);
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  font-size: 0.85rem;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.theme-fab:hover {
  background: var(--hi);
  color: #2a2420;
}

.layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
  max-width: 960px;
  margin: 0 auto;
}

.sheet {
  grid-column: 2;
  position: relative;
}

.pad {
  position: fixed;
  top: 20px;
  left: max(20px, calc(50% - 480px));
  width: 220px;
  background:
    repeating-linear-gradient(to bottom, transparent 0 27px, color-mix(in srgb, var(--rule-blue) 38%, transparent) 27px 28px),
    var(--card);
  border: 1.5px solid var(--ink);
  border-radius: 5px 15px 6px 17px;
  box-shadow: var(--shadow-card);
  padding: 40px 16px 16px;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.clip {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%) rotate(2deg);
}

.clip-body {
  display: block;
  width: 44px;
  height: 30px;
  background: #2f2b27;
  border: 2px solid #141210;
  border-radius: 6px 6px 10px 10px;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.25);
}

[data-theme='dark'] .clip-body {
  background: #141210;
}

.clip-top {
  display: block;
  width: 26px;
  height: 12px;
  margin: 0 auto -4px;
  background: #57534e;
  border: 2px solid #141210;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
}

.pad-kicker {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  color: var(--muted);
  margin-bottom: 8px;
}

.pad-nav {
  display: grid;
  gap: 4px;
}

.pad-link {
  padding: 8px 10px;
  background: transparent;
  border: 1.5px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  text-align: left;
}

.pad-link:hover {
  border-color: var(--pencil);
}

.pad-link.active {
  background: var(--hi);
  border-color: var(--ink);
  color: #2a2420;
}

.pad-card {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1.5px dashed var(--pencil);
}

.pad-card-title {
  font-weight: 700;
}

.pad-card-sub {
  font-size: 0.83rem;
  color: var(--muted);
  margin-top: 2px;
}

.pad-mail {
  display: inline-block;
  margin-top: 6px;
  font-size: 0.8rem;
  color: var(--link);
  word-break: break-all;
}

.pad-foot {
  margin-top: 12px;
  font-family: var(--font-sans);
  font-size: 0.72rem;
  color: var(--muted);
}

.sheet {
  position: relative;
  background: var(--paper);
  border: 1.5px solid var(--ink);
  border-radius: 12px;
  box-shadow: var(--shadow-paper);
  padding: 40px 36px 28px;
}

.tape {
  position: absolute;
  width: 110px;
  height: 26px;
  background: var(--tape);
  border-left: 2px dashed rgba(42, 36, 32, 0.15);
  border-right: 2px dashed rgba(42, 36, 32, 0.15);
}

.tape-top {
  top: -14px;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
}

.hero {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 8px;
}

.photo {
  position: relative;
  flex-shrink: 0;
  background: var(--photo);
  border: 1.5px solid var(--ink);
  border-radius: 8px 3px 9px 4px;
  padding: 6px;
  transform: rotate(-2.5deg);
  transition: transform 0.3s ease;
}

.photo:hover {
  transform: rotate(-2.5deg) translateY(-2px);
}

.photo img {
  display: block;
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 6px;
}

.name {
  font-size: 1.9rem;
  line-height: 1.2;
  letter-spacing: 0.04em;
}

.role {
  margin-top: 4px;
  color: var(--ink-soft);
}

.meta {
  margin-top: 8px;
  font-size: 0.86rem;
  color: var(--muted);
  font-family: var(--font-sans);
}

.block {
  scroll-margin-top: 90px;
  padding: 26px 0 6px;
}

.block h2 {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 1.25rem;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--ink);
}

.h2-en {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 400;
  color: var(--muted);
}

.prose p {
  font-size: 1.02rem;
  line-height: 1.9;
}

.prose p + p {
  margin-top: 10px;
}

.skill-stack {
  display: grid;
  gap: 18px;
  background-image: radial-gradient(var(--dot) 1.2px, transparent 1.2px);
  background-size: 18px 18px;
}

.skill-category {
  font-weight: 700;
  margin-bottom: 10px;
}

.sticker-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style: none;
}

.sticker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  background: color-mix(in srgb, var(--ink) 13%, transparent);
  border: 0;
  border-radius: 999px;
  font-size: 0.95rem;
  color: var(--ink);
}

.sticker-icon {
  width: 17px;
  height: 17px;
  object-fit: contain;
}

.sticker-mask {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

.project-list {
  display: grid;
  gap: 12px;
  list-style: none;
}

.project-item {
  background: var(--slip);
  border: 1.5px solid var(--ink);
  border-radius: 14px 5px 15px 6px;
  padding: 16px 18px;
}

.project-item:hover {
  background: var(--card);
}

.project-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.project-period {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  color: var(--muted);
  white-space: nowrap;
}

.project-sub {
  font-size: 0.85rem;
  color: var(--muted);
  margin-top: 2px;
}

.project-summary {
  font-size: 0.92rem;
  line-height: 1.7;
  margin-top: 8px;
  color: var(--ink-soft);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  margin-top: 10px;
}

.tags li {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  padding: 2px 9px;
  border: 1px solid var(--pencil);
  border-radius: 999px;
  color: var(--muted);
  background: transparent;
}

.sheet-foot {
  margin-top: 28px;
  padding-top: 14px;
  text-align: center;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  color: var(--muted);
  border-top: 1.5px dashed var(--pencil);
}

.mobile-rail {
  display: none;
}

@media (max-width: 860px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .pad {
    position: static;
    left: auto;
    width: auto;
    max-height: none;
  }

  .sheet {
    grid-column: auto;
    padding: 32px 20px 24px;
  }

  .photo img {
    width: 72px;
    height: 72px;
  }

  .name {
    font-size: 1.5rem;
  }

  .mobile-rail {
    position: fixed;
    left: 50%;
    bottom: 14px;
    z-index: 30;
    transform: translateX(-50%) translateZ(0);
    backface-visibility: hidden;
    display: flex;
    gap: 4px;
    padding: 6px;
    background: var(--slip);
    border: 1.5px solid var(--ink);
    border-radius: 999px;
    box-shadow: var(--shadow-card);
  }

  .mobile-rail button {
    border: 0;
    background: transparent;
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .mobile-rail button.active {
    background: var(--hi);
    color: #2a2420;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
