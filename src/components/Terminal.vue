<template>
  <section ref="pane" class="terminal-pane" @click="focusInput">
    <div class="lines">
      <div v-for="(line, index) in lines" :key="index" class="line" :class="line.type">
        <template v-if="line.type === 'input'">
          <span class="prompt">{{ prompt }}</span>
          <span>{{ line.text }}</span>
        </template>
        <pre v-else>{{ line.text }}</pre>
      </div>
    </div>

    <label class="command-line">
      <span class="prompt">{{ prompt }}</span>
      <input
        ref="input"
        v-model="command"
        type="text"
        spellcheck="false"
        autocomplete="off"
        autocapitalize="off"
        aria-label="终端命令输入"
        @keydown="onKeydown"
      />
    </label>
  </section>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { featuredProjects } from '../data/projects.js';
import { skillCategories } from '../data/skills.js';
import {
  resetTerminalSession,
  terminalHistory,
  terminalLines,
  terminalScrollTop
} from '../utils/terminalSession.js';

const router = useRouter();
const pane = ref(null);
const input = ref(null);
const command = ref('');
const history = terminalHistory;
const historyIndex = ref(-1);
const draft = ref('');
const lines = terminalLines;

const prompt = 'mei@portfolio:~$';

const pages = {
  about: '/about',
  skills: '/skills',
  projects: '/projects',
  contact: '/contact',
  terminal: '/terminal',
  '1': '/about',
  '2': '/skills',
  '3': '/projects',
  '4': '/contact'
};

const files = {
  'about.md': [
    '梅友飞 · 全栈开发工程师',
    '前端为主，全栈落地。3 年项目经验。',
    '输入 open about 打开关于页面。'
  ],
  'skills.md': skillCategories.map(
    (category) => `${category.title}: ${category.skills.length} items`
  ),
  'projects.md': featuredProjects.map(
    (project, index) => `${String(index + 1).padStart(2, '0')}  ${project.title} — ${project.subtitle}`
  ),
  'contact.md': [
    'email: 18737582236@163.com',
    'phone / wechat: 187 3758 2236',
    'role: 前端 / 全栈开发工程师'
  ],
  'readme.txt': [
    'Mei Portfolio Shell',
    '这是一个前端模拟终端，不是真实系统 shell。',
    '输入 help 查看可用命令。'
  ]
};

const commandList = [
  'help',
  'clear',
  'ls',
  'pwd',
  'whoami',
  'date',
  'echo',
  'cat',
  'open',
  'cd',
  'history',
  'neofetch',
  'about',
  'skills',
  'projects',
  'contact'
];

function focusInput() {
  input.value?.focus({ preventScroll: true });
}

async function scrollToBottom() {
  await nextTick();
  if (pane.value) {
    pane.value.scrollTop = pane.value.scrollHeight;
  }
}

function pushLine(type, text = '') {
  lines.value.push({ type, text });
}

function print(text = '') {
  String(text)
    .split('\n')
    .forEach((row) => pushLine(row ? 'output' : 'blank', row || ' '));
}

function printError(text) {
  pushLine('error', text);
}

function printMuted(text) {
  pushLine('muted', text);
}

function openPage(target) {
  const path = pages[target];
  if (!path) {
    printError(`open: ${target}: no such page`);
    printMuted('try: about | skills | projects | contact | 1-4');
    return;
  }
  printMuted(`opening ${target}…`);
  router.push(path);
}

function runHelp() {
  print(
    [
      'Available commands:',
      '  help                 Show this help',
      '  ls                   List portfolio files',
      '  cat <file>           Read a file',
      '  open <page>          Open about/skills/projects/contact',
      '  cd <page>            Alias of open',
      '  whoami / pwd / date  System info',
      '  echo <text>          Print text',
      '  history              Show command history',
      '  neofetch             Show profile card',
      '  clear                Clear the screen',
      '',
      'Quick open:',
      '  1 / about            About',
      '  2 / skills           Skills',
      '  3 / projects         Projects',
      '  4 / contact          Contact'
    ].join('\n')
  );
}

function runLs() {
  print(Object.keys(files).join('  '));
}

function runCat(args) {
  const name = args[0];
  if (!name) {
    printError('cat: missing file operand');
    return;
  }
  const content = files[name] || files[`${name}.md`] || files[`${name}.txt`];
  if (!content) {
    printError(`cat: ${name}: No such file or directory`);
    return;
  }
  print(content.join('\n'));
}

function runNeofetch() {
  print(
    [
      'mei@portfolio',
      '-------------',
      'OS: Portfolio Linux (simulated)',
      'Host: vue-portfolio',
      'Shell: mei-sh 0.1',
      'Role: 全栈开发工程师',
      'Stack: Vue · TypeScript · Node · Python',
      'Status: Build. Ship. Iterate.',
      'Contact: 18737582236@163.com'
    ].join('\n')
  );
}

function execute(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;

  pushLine('input', trimmed);
  history.value.push(trimmed);
  historyIndex.value = -1;
  draft.value = '';

  const [name, ...args] = trimmed.split(/\s+/);
  const cmd = name.toLowerCase();

  switch (cmd) {
    case 'help':
    case '?':
      runHelp();
      break;
    case 'clear':
    case 'cls':
      resetTerminalSession();
      break;
    case 'ls':
      runLs();
      break;
    case 'pwd':
      print('/home/mei');
      break;
    case 'whoami':
      print('mei / 全栈开发工程师');
      break;
    case 'date':
      print(new Date().toString());
      break;
    case 'echo':
      print(args.join(' '));
      break;
    case 'cat':
      runCat(args);
      break;
    case 'open':
    case 'cd':
      openPage((args[0] || '').toLowerCase());
      break;
    case 'history':
      print(
        history.value.map((item, index) => `${String(index + 1).padStart(3, ' ')}  ${item}`).join('\n') ||
          ' '
      );
      break;
    case 'neofetch':
    case 'fetch':
      runNeofetch();
      break;
    case 'about':
    case 'skills':
    case 'projects':
    case 'contact':
    case '1':
    case '2':
    case '3':
    case '4':
      openPage(cmd);
      break;
    default:
      printError(`mei-sh: command not found: ${name}`);
      printMuted('Type `help` for available commands.');
  }

  scrollToBottom();
}

function completeCommand() {
  const value = command.value.trim();
  if (!value) return;

  const [head, ...rest] = value.split(/\s+/);

  if (rest.length === 0) {
    const matches = commandList.filter((item) => item.startsWith(head.toLowerCase()));
    if (matches.length === 1) {
      command.value = `${matches[0]} `;
    } else if (matches.length > 1) {
      pushLine('input', value);
      printMuted(matches.join('  '));
      scrollToBottom();
    }
    return;
  }

  if (['cat', 'open', 'cd'].includes(head.toLowerCase())) {
    const partial = rest[0] || '';
    const pool =
      head.toLowerCase() === 'cat'
        ? Object.keys(files)
        : ['about', 'skills', 'projects', 'contact'];
    const matches = pool.filter((item) => item.startsWith(partial));
    if (matches.length === 1) {
      command.value = `${head} ${matches[0]}${head.toLowerCase() === 'cat' ? '' : ' '}`;
    } else if (matches.length > 1) {
      pushLine('input', value);
      printMuted(matches.join('  '));
      scrollToBottom();
    }
  }
}

function onKeydown(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const value = command.value;
    command.value = '';
    execute(value);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (!history.value.length) return;
    if (historyIndex.value === -1) {
      draft.value = command.value;
      historyIndex.value = history.value.length - 1;
    } else if (historyIndex.value > 0) {
      historyIndex.value -= 1;
    }
    command.value = history.value[historyIndex.value];
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (historyIndex.value === -1) return;
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value += 1;
      command.value = history.value[historyIndex.value];
    } else {
      historyIndex.value = -1;
      command.value = draft.value;
    }
    return;
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    completeCommand();
    return;
  }

  if (event.key === 'c' && event.ctrlKey) {
    event.preventDefault();
    pushLine('input', `${command.value}^C`);
    command.value = '';
    historyIndex.value = -1;
    draft.value = '';
    scrollToBottom();
  }
}

onMounted(async () => {
  focusInput();
  await nextTick();
  if (pane.value) {
    pane.value.scrollTop = terminalScrollTop.value || pane.value.scrollHeight;
  }
});

onBeforeUnmount(() => {
  if (pane.value) {
    terminalScrollTop.value = pane.value.scrollTop;
  }
});
</script>

<style scoped>
.terminal-pane {
  height: 100%;
  min-height: 100%;
  padding: clamp(28px, 5vw, 48px);
  overflow-y: auto;
  color: #d9dfd7;
  background:
    radial-gradient(circle at 88% 10%, rgba(86, 151, 103, 0.13), transparent 30%),
    #242723;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 0.92rem;
  line-height: 1.65;
  cursor: text;
}

.lines {
  display: grid;
  gap: 2px;
}

.line pre {
  margin: 0;
  font: inherit;
  white-space: pre-wrap;
  word-break: break-word;
}

.line.input,
.command-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.prompt {
  flex-shrink: 0;
  color: #79c58b;
}

.line.system {
  color: #6f786d;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  margin-bottom: 10px;
}

.line.muted {
  color: #92998f;
}

.line.error {
  color: #e3a85f;
}

.command-line {
  margin-top: 2px;
}

input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  color: #f2f4ef;
  caret-color: #79c58b;
  background: transparent;
  font: inherit;
}

@media (max-width: 560px) {
  .terminal-pane {
    padding: 22px 16px 28px;
    font-size: 0.86rem;
  }

  .prompt {
    font-size: 0.8rem;
  }

  input {
    font-size: 16px; /* avoid iOS zoom on focus */
  }
}
</style>
