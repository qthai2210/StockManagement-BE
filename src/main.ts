import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for deployed environments
  app.enableCors({
    origin: true, // Allow all origins in development, configure specific origins for production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger configuration - simplified for Vercel deployment
  const shouldEnableSwagger = true; // Always enable for now to test

  if (shouldEnableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Stock App API')
      .setDescription('Stock application API documentation')
      .setVersion('1.0')
      .addTag('stocks')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Simplified setup for Vercel compatibility
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'Stock App API Docs',
    });

    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Swagger UI should be available at: /api/docs`);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // Bind to all interfaces for deployed environments
}

bootstrap();
