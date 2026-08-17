export const profile = {
  name: '梅友飞',
  role: '全栈开发工程师',
  gender: '男',
  birth: '2002-11-02',
  email: 'meiyoufei233@gmail.com',
  phone: '187 3758 2236',
  education: '本科 · 平顶山学院',
  experience: '3 年',
  location: '中国',
  avatar: '/images/avatar.gif',
  lastUpdated: '2026年3月',
  intro: [
    'Hi，我是梅友飞。',
    '前端为主，也能把后端和部署搞定。3 年项目经验。',
    '做过 App、小程序、后台和大屏，最近在尝试 AI 相关业务。'
  ]
};

export function calcAge(iso = profile.birth) {
  const birth = new Date(iso);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}
