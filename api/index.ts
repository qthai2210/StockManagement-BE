import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

let app: any;

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

export default async (req: any, res: any) => {
  const server = await bootstrap();
  return server(req, res);
};
