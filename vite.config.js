import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * GitHub Pages 对未知路径返回 404.html。
 * 把 SPA 的 index 复制成 404，避免刷新后空白。
 */
function spaFallbackForGitHubPages() {
  return {
    name: 'spa-fallback-github-pages',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const index = resolve(dist, 'index.html')
      if (existsSync(index)) {
        copyFileSync(index, resolve(dist, '404.html'))
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), spaFallbackForGitHubPages()],
  // 用户主页 / 自定义域名用根路径；若是 project site（xxx.github.io/仓库名/）
  // 请改成 base: '/仓库名/'
  base: '/'
})
