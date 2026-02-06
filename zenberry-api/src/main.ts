import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await Promise.race([
    NestFactory.create<NestExpressApplication>(AppModule),
    new Promise<NestExpressApplication>((_, reject) => setTimeout(() => reject(new Error('App creation timeout')), 30000))
  ]);
  app.useWebSocketAdapter(new IoAdapter(app));
  // Configure CORS with environment-based origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers,X-Shopify-Auth-Token',
    credentials: true,
  });
  // Configure middlewares
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  const config = new DocumentBuilder()
    .setTitle('Fonte Imagem API - Dooor')
    .setDescription('AI-powered backend API for Fonte Imagem')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
}
bootstrap();