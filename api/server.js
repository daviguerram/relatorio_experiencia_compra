import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

// Caminho do seu projeto Playwright
const PROJECT_DIR = 'C:\\Users\\davig\\boomer-playwright';

// Rota de saúde (teste rápido)
app.get('/health', (req, res) => res.json({ ok: true }));

// Rota que dispara o Playwright
app.post('/run-test', (req, res) => {
    const cmd = 'npx playwright test tests/gringa-compra.spec.ts';
    const options = { cwd: PROJECT_DIR };

    exec(cmd, options, (error, stdout, stderr) => {
        const reportPath = path.join(PROJECT_DIR, 'report.json');
        const screenshotPath = path.join(PROJECT_DIR, 'checkout.png');

        const result = { stdout, stderr };

        try {
            if (fs.existsSync(reportPath)) {
                const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
                result.report = report;
            }
            if (fs.existsSync(screenshotPath)) {
                const img = fs.readFileSync(screenshotPath);
                result.screenshotBase64 = img.toString('base64');
            }
        } catch (e) {
            result.parseError = e.message;
        }

        if (error) {
            return res.status(500).json({
                status: 'FALHA',
                message: error.message,
                ...result
            });
        }

        return res.json({
            status: 'OK',
            ...result
        });
    });
});

// Inicializa servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Playwright rodando em http://localhost:${PORT}`);
});
function deleteIfOlderThan(filePath, hours = 24) {
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const ageMs = Date.now() - stats.mtimeMs;
        if (ageMs > hours * 60 * 60 * 1000) {
            fs.unlinkSync(filePath);
            console.log(`Arquivo ${filePath} excluído por estar mais velho que ${hours}h`);
        }
    }
}

// Antes de rodar o teste:
deleteIfOlderThan(path.join(PROJECT_DIR, 'report.json'));
deleteIfOlderThan(path.join(PROJECT_DIR, 'checkout.png'));
