import { test, expect } from '@playwright/test';

test('Abrir Gringa e tirar screenshot', async ({ page }) => {
    // Abre o site
    await page.goto('https://gringa.com.br', { waitUntil: 'domcontentloaded' });

    // Verifica se o título da página contém "Gringa"
    await expect(page).toHaveTitle(/Gringa/i);

    // Tira uma screenshot da página inicial
    await page.screenshot({ path: 'home.png', fullPage: true });
});
