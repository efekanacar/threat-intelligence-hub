import { defineConfig, devices } from '@playwright/test';
export default defineConfig({ testDir: './e2e', fullyParallel: false, workers: 1, reporter: 'list', use: { baseURL: 'http://127.0.0.1:52769', trace: 'retain-on-failure' }, webServer: { command: 'npm run preview -- --port 52769 --strictPort', url: 'http://127.0.0.1:52769', reuseExistingServer: !process.env.CI }, projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } }] });


