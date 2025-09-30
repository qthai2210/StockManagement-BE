const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');

let app;

async function createApp() {
  try {
    // Import AppModule dynamically to avoid module loading issues
    const { AppModule } = require('../dist/app.module');

    const nestApp = await NestFactory.create(AppModule, {
      logger: false, // Disable logging in serverless
    });

    nestApp.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    nestApp.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await nestApp.init();
    return nestApp.getHttpAdapter().getInstance();
  } catch (error) {
    console.error('Failed to create NestJS app:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  try {
    if (!app) {
      app = await createApp();
    }

    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to initialize application',
      timestamp: new Date().toISOString(),
    });
  }
};
