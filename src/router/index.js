import { createRouter, createWebHistory } from 'vue-router';
import Terminal from '../components/Terminal.vue';
import About from '../components/About.vue';
import Skills from '../components/Skills.vue';
import Projects from '../components/Projects.vue';
import ProjectDetail from '../components/ProjectDetail.vue';
import Contact from '../components/Contact.vue';

function preferMobileHome() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 860px)').matches;
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => (preferMobileHome() ? '/about' : '/terminal')
    },
    {
      path: '/terminal',
      name: 'terminal',
      component: Terminal,
      meta: {
        title: '终端',
        shortLabel: 'Terminal',
        windowTitle: 'Terminal — mei@portfolio:~'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      meta: { title: '关于', shortLabel: 'About', windowTitle: 'about — 关于我' }
    },
    {
      path: '/skills',
      name: 'skills',
      component: Skills,
      meta: { title: '技能', shortLabel: 'Skills', windowTitle: 'skills — 专业技能' }
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects,
      meta: { title: '项目', shortLabel: 'Projects', windowTitle: 'projects — 项目作品' }
    },
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: ProjectDetail,
      meta: { title: '项目详情', shortLabel: 'Project', windowTitle: 'project — 项目详情' }
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact,
      meta: { title: '联系', shortLabel: 'Contact', windowTitle: 'contact — 联系方式' }
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

router.afterEach((to) => {
  const page = to.meta.title ? `${to.meta.title} · ` : '';
  document.title = `${page}梅友飞 - 全栈开发工程师`;
});

export default router;
