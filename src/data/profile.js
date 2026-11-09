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
    '你好，我是梅友飞。',
    '主要做 Web 前端，后端开发与部署运维也可以独立负责，有 3 年项目经验。',
    '做过 Web 应用、App、小程序、管理后台和数据大屏，独立交付过多个完整项目。',
    '目前在做 AI 应用落地，包括智能客服与大模型问答。'
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
