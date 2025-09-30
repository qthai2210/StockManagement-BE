import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();

    await app.init();
  }
  return app;
}

export default async (req, res) => {
  const server = await bootstrap();
  return server.getHttpAdapter().getInstance()(req, res);
};
