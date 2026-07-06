import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

type CorsOriginCallback = (err: Error | null, allow?: boolean) => void;

function normalizeOrigin(origin?: string): string | undefined {
  return origin?.replace(/\/+$/, '');
}

function splitOrigins(value?: string): string[] {
  return (value ?? '')
    .split(',')
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter((origin): origin is string => Boolean(origin));
}

function getAllowedOrigins(): string[] {
  const origins = [
    ...splitOrigins(process.env.FRONTEND_URL),
    ...splitOrigins(process.env.CORS_ORIGIN),
    'http://localhost:5173',
  ];

  return Array.from(new Set(origins));
}

function isAllowedVercelPreview(origin: string): boolean {
  return /^https:\/\/devcopet-[a-zA-Z0-9-]+.*\.vercel\.app$/.test(origin);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins = getAllowedOrigins();

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: CorsOriginCallback,
    ): void => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (
        normalizedOrigin &&
        (allowedOrigins.includes(normalizedOrigin) ||
          isAllowedVercelPreview(normalizedOrigin))
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  });

  app.enableShutdownHooks();

  await app.listen(port);
  Logger.log(`Devcopet backend running on port ${port}`, 'Bootstrap');
}
void bootstrap();
