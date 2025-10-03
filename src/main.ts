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

  // Swagger configuration - enable in all environments or specific ones
  const shouldEnableSwagger =
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_SWAGGER === 'true';

  if (shouldEnableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Stock App API')
      .setDescription('Stock application API documentation')
      .setVersion('1.0')
      .addTag('stocks')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'Stock App API Docs',
      customfavIcon: '/favicon.ico',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      ],
    });

    console.log(
      `Swagger UI is available at: http://localhost:${process.env.PORT || 3000}/api/docs`,
    );
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // Bind to all interfaces for deployed environments
}

bootstrap();
