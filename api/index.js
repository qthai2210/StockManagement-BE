const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { AppModule } = require('../dist/app.module');

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());
    app.enableCors({
      origin: true,
      credentials: true,
    });

    await app.init();
  }
  return app.getHttpAdapter().getInstance();
}

module.exports = async (req, res) => {
  const server = await bootstrap();
  return server(req, res);
};
