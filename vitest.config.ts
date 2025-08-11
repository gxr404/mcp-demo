import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // testTimeout: 60 * 1000, // 无效
    // root根配置只会影响全局选项，例如 reporters 和 coverage
    // https://vitest.dev/guide/projects.html#defining-projects
    projects: ['packages/*'],
  },
})
