const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');

let app;

module.exports = async (req, res) => {
  if (!app) {
    app = await NestFactory.create(AppModule);
    await app.init();
  }

  return app.getHttpAdapter().getInstance()(req, res);
};
