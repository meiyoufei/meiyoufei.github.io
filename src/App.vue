<template>
  <div class="app">
    <BackgroundCanvas :theme="theme" />
    <div class="grain" aria-hidden="true"></div>

    <div class="shell">
      <header class="profile">
        <img class="avatar" :src="profile.avatar" :alt="profile.name" width="88" height="88" />
        <div class="profile-body">
          <h1 class="name">{{ profile.name }}</h1>
          <p class="role">{{ profile.role }}</p>
          <ul class="meta">
            <li v-for="item in metaItems" :key="item.text">
              <span class="meta-icon" :style="maskStyle(item.icon)"></span>
              <a v-if="item.href" :href="item.href">{{ item.text }}</a>
              <template v-else>{{ item.text }}</template>
            </li>
          </ul>
        </div>
      </header>

      <main class="main">
        <section id="about" class="block">
          <h2>个人介绍</h2>
          <div class="prose">
            <p v-for="(line, index) in profile.intro" :key="index">{{ line }}</p>
          </div>
        </section>

        <section id="skills" class="block">
          <h2>技能</h2>
          <ul class="skill-list">
            <li v-for="item in techStack" :key="item.name">
              <!-- 多色图标直接显示原图，单色图标走遮罩以便跟随主题上色 -->
              <img v-if="!item.color" class="skill-icon" :src="item.src" alt="" aria-hidden="true" />
              <span v-else class="skill-icon" :style="[maskStyle(item.src), { '--icon': iconColor(item) }]"></span>
              {{ item.name }}
            </li>
          </ul>
        </section>

        <section id="projects" class="block">
          <h2>项目</h2>
          <ul class="project-list">
            <li v-for="project in allProjects" :key="project.id">
              <strong>{{ project.title }}</strong>
              <span>{{ project.summary }}</span>
            </li>
          </ul>
        </section>
      </main>

      <footer class="foot">
        <span>更新于 {{ profile.lastUpdated }}</span>
        <span class="foot-dot" aria-hidden="true"></span>
        <span>{{ profile.name }}</span>
      </footer>
    </div>

    <nav class="rail" aria-label="页面导航">
      <button
        v-for="item in sections"
        :key="item.id"
        type="button"
        class="rail-link"
        :class="{ active: activeSection === item.id }"
        @click="goTo(item.id)"
      >
        {{ item.label }}
      </button>
    </nav>

    <button
      type="button"
      class="theme-toggle"
      :aria-label="theme === 'dark' ? '切换到亮色' : '切换到暗色'"
      @click="toggleTheme"
    >
      <svg v-if="theme === 'dark'" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1ZM12 4a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm8 9h1a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2ZM3 13H2a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2Zm14.66 5.66.7.7a1 1 0 0 1-1.41 1.42l-.7-.71a1 1 0 0 1 1.41-1.41ZM6.34 5.34l-.7-.7A1 1 0 0 1 7.05 3.2l.7.7a1 1 0 1 1-1.41 1.42Zm12.02-1.42.7-.7a1 1 0 1 1 1.42 1.41l-.71.7a1 1 0 0 1-1.41-1.41ZM5.34 17.66l-.7.7a1 1 0 1 1-1.42-1.41l.71-.7a1 1 0 0 1 1.41 1.41Z" />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M21 14.3A8.4 8.4 0 0 1 9.7 3 8.5 8.5 0 1 0 21 14.3Z" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { calcAge, profile } from './data/profile.js';
import { techStack } from './data/skills.js';
import { allProjects } from './data/projects.js';
import { useTheme } from './composables/useTheme.js';
import BackgroundCanvas from './components/BackgroundCanvas.vue';

const { theme, toggleTheme } = useTheme();
const activeSection = ref('about');
const age = computed(() => calcAge());

const sections = [
  { id: 'about', label: '介绍' },
  { id: 'skills', label: '技能' },
  { id: 'projects', label: '项目' }
];

const metaItems = computed(() => [
  { icon: '/icons/ui-user.svg', text: `${profile.gender} · ${age.value} 岁` },
  { icon: '/icons/ui-school.svg', text: '本科' },
  { icon: '/icons/ui-work.svg', text: `${profile.experience}经验` },
  { icon: '/icons/ui-mail.svg', text: profile.email, href: `mailto:${profile.email}` }
]);

function maskStyle(src) {
  return { WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` };
}

function iconColor(item) {
  if (theme.value === 'dark' && item.darkColor) return item.darkColor;
  return item.color;
}

function goTo(id) {
  activeSection.value = id;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateActive() {
  const probe = 140;
  let current = sections[0].id;
  for (const item of sections) {
    const el = document.getElementById(item.id);
    if (el && el.getBoundingClientRect().top <= probe) current = item.id;
  }
  activeSection.value = current;
}

onMounted(() => {
  updateActive();
  window.addEventListener('scroll', updateActive, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateActive);
});
</script>

<style scoped>
.app {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
}

.grain {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: var(--grain);
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>");
}

.shell {
  position: relative;
  z-index: 2;
  width: min(720px, calc(100% - 48px));
  margin: 0 auto;
  padding: 96px 0 104px;
}

.profile,
.block,
.foot {
  animation: rise 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

.block:nth-of-type(1) {
  animation-delay: 0.07s;
}

.block:nth-of-type(2) {
  animation-delay: 0.14s;
}

.block:nth-of-type(3) {
  animation-delay: 0.21s;
}

.foot {
  animation-delay: 0.28s;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}

.profile {
  display: flex;
  align-items: center;
  gap: 26px;
  margin-bottom: 72px;
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--chip);
  box-shadow: 0 0 0 5px var(--ring), 0 12px 32px rgba(13, 43, 64, 0.12);
}

.profile-body {
  min-width: 0;
  flex: 1;
}

.name {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.2;
}

.role {
  margin-top: 2px;
  color: var(--muted);
  font-size: 0.95rem;
}

.meta {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 7px 30px;
  list-style: none;
  margin-top: 18px;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 0.84rem;
}

.meta li {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.meta-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  background: currentColor;
  opacity: 0.7;
}

.meta a {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid transparent;
}

.meta a:hover {
  color: var(--accent);
  border-bottom-color: currentColor;
}

.main {
  min-width: 0;
}

.block {
  scroll-margin-top: 40px;
  padding-bottom: 64px;
}

h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.24em;
}

h2::before {
  content: '';
  width: 16px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent);
}

.prose {
  max-width: 34em;
}

.prose p {
  font-size: 1.06rem;
  line-height: 1.95;
}

.prose p + p {
  margin-top: 14px;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
}

.skill-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 13px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--chip);
  backdrop-filter: blur(6px);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 0.84rem;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.skill-list li:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.skill-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  background: var(--icon);
}

img.skill-icon {
  background: none;
  object-fit: contain;
}

.meta-icon,
.skill-icon {
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

.project-list {
  list-style: none;
  margin-left: -12px;
}

.project-list li {
  display: grid;
  grid-template-columns: minmax(0, 12rem) minmax(0, 1fr);
  gap: 4px 22px;
  align-items: baseline;
  padding: 11px 12px;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.project-list li:hover {
  background: var(--chip);
}

.project-list strong {
  font-size: 0.98rem;
  font-weight: 650;
}

.project-list span {
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.7;
}

.foot {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 0.78rem;
}

.foot-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.rail {
  position: fixed;
  top: 50%;
  left: calc(50% + 360px + 56px);
  z-index: 30;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.rail-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 0.8rem;
  letter-spacing: 0.16em;
  cursor: pointer;
  transition: color 0.25s ease;
}

.rail-link::before {
  content: '';
  width: 14px;
  height: 1.5px;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.45;
  transition: width 0.25s ease, opacity 0.25s ease, background 0.25s ease;
}

.rail-link:hover {
  color: var(--ink);
}

.rail-link.active {
  color: var(--ink);
}

.rail-link.active::before {
  width: 30px;
  opacity: 1;
  background: var(--accent);
}

.theme-toggle {
  position: fixed;
  top: 22px;
  right: 22px;
  z-index: 30;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--chip);
  backdrop-filter: blur(8px);
  color: var(--ink);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.theme-toggle:hover {
  transform: translateY(-1px);
}

.theme-toggle svg {
  width: 16px;
  height: 16px;
}

@media (max-width: 1180px) {
  .shell {
    width: min(720px, calc(100% - 40px));
    padding: 64px 0 108px;
  }

  .rail {
    left: auto;
    right: 20px;
    top: auto;
    bottom: 20px;
    transform: none;
    flex-direction: row;
    align-items: center;
    gap: 18px;
    padding: 9px 16px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--chip);
    backdrop-filter: blur(10px);
  }

  .rail-link {
    letter-spacing: 0.1em;
  }

  .rail-link::before {
    display: none;
  }

  .rail-link.active {
    color: var(--accent);
    font-weight: 650;
  }
}

@media (max-width: 560px) {
  .profile {
    gap: 18px;
    margin-bottom: 52px;
  }

  .avatar {
    width: 72px;
    height: 72px;
  }

  .name {
    font-size: 1.35rem;
  }

  .meta {
    grid-template-columns: 1fr;
    gap: 7px;
  }

  .block {
    padding-bottom: 48px;
  }

  .project-list li {
    grid-template-columns: minmax(0, 1fr);
    gap: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .profile,
  .block,
  .foot {
    animation: none;
  }
}
</style>
