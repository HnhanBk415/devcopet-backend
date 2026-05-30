import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe — strips unknown fields and validates all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strips properties not in DTO
      forbidNonWhitelisted: false,
      transform: true,       // auto-transforms primitive types
    }),
  );

  // CORS — allow the React frontend to call the backend
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Devcopet backend running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
