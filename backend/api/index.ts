// api/index.ts
import { NestFactory } from '@nestjs/core';

let cachedServer: any;

async function getServer() {
    if (!cachedServer) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { AppModule } = require('../dist/app.module');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { setupApp } = require('../dist/setup-app');
        const app = await NestFactory.create(AppModule);
        setupApp(app);
        await app.init();
        cachedServer = app.getHttpAdapter().getInstance();
    }
    return cachedServer;
}

export default async function handler(req: any, res: any) {
    const server = await getServer();
    return server(req, res);
}

