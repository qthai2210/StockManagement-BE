import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3000;

  if (process.env.NODE_ENV === 'production') {
    // For Vercel serverless
    await app.init();
    return app.getHttpAdapter().getInstance();
  } else {
    // For local development
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  }
}

// Export for Vercel
export default async (req: any, res: any) => {
  const server = await bootstrap();
  return server(req, res);
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}
