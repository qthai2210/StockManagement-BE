const fs = require('fs');
const path = require('path');

// Create api directory
if (!fs.existsSync('api')) {
  fs.mkdirSync('api', { recursive: true });
}

// Create the serverless function
const serverlessHandler = `const { NestFactory } = require('@nestjs/core');
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
};`;

// Write the serverless function (overwrite existing)
fs.writeFileSync('api/index.js', serverlessHandler);

// Create public directory and copy dist files
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// Copy dist files to public
const copyDir = (src, dest) => {
  if (fs.existsSync(src)) {
    fs.mkdirSync(dest, { recursive: true });
    const files = fs.readdirSync(src);
    files.forEach((file) => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }
};

copyDir('dist', 'public');
console.log('Vercel build preparation completed');
