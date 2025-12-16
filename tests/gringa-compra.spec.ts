import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Simular compra de uma bolsa na Gringa', async ({ page }) => {
    const report: any = {
        etapas: {},
        status: 'OK',
        screenshot: '',
        tituloFinal: ''
    };

    try {
        // 1) Abre a página principal e mede tempo
        const startHome = Date.now();
        await page.goto('https://gringa.com.br', { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForSelector('header', { timeout: 15000 });
        report.etapas.home = Date.now() - startHome;

        // 2) Vai para a página do produto e mede tempo
        const startProduto = Date.now();
        await page.goto('https://gringa.com.br/products/cervo-antik-tote-prada-00126816-bopr', { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForSelector('button.bg-power', { timeout: 15000 });
        report.etapas.produto = Date.now() - startProduto;

        // 3) Vai direto para o checkout e mede tempo
        const startCheckout = Date.now();
        await page.goto(
            'https://gringa.com.br/checkouts/cn/hWN44qFosew0KECI28gTh3ys/pt-br/information?_r=AQABZF1e0odeERLYYhzvV-kishWh62sxU57lkhOzmTVKGhk',
            { waitUntil: 'domcontentloaded', timeout: 60000 }
        );
        await page.waitForSelector('input[name="email"]', { timeout: 15000 });
        report.etapas.checkout = Date.now() - startCheckout;

        // 4) Validação leve: campo de email existe
        const emailField = page.locator('input[name="email"]');
        await expect(emailField).toBeVisible();

        // 5) Evidência final
        const screenshotPath = 'checkout.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        report.screenshot = screenshotPath;

        // 6) Título da página final
        const title = await page.title();
        report.tituloFinal = title;

    } catch (err: any) {
        report.status = 'FALHA';
        report.erro = err.message;
    }

    // 7) Gera relatório JSON
    fs.writeFileSync('report.json', JSON.stringify(report, null, 2));
    console.log('Relatório gerado:', report);
});
