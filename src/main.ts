import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SWAGGER_ACCESS_TOKEN } from './common/constants/auth.constants';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { createValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const origins = (
    config.get<string>('CORS_ORIGINS') ??
    config.get<string>('CORS_ORIGIN') ??
    ''
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true,
  });

  if (config.get('SWAGGER_ENABLED', 'true') !== 'false') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(config.get('APP_NAME', 'Karunia Center API'))
      .setDescription('Karunia Center REST API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token from POST /api/v1/auth/login',
        },
        SWAGGER_ACCESS_TOKEN,
      )
      .addTag('Auth')
      .addTag('Users')
      .addTag('Students')
      .addTag('Activities')
      .addTag('Activity Types')
      .addTag('Activity Templates')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(config.get('SWAGGER_PATH', 'docs'), app, document);
  }

  await app.listen(config.get('PORT', 3000));
}
void bootstrap();
