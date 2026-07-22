import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, exceptionFactory: (errors) => new BadRequestException({ message: 'Validation failed', errors: errors.map((error) => ({ field: error.property, messages: Object.values(error.constraints ?? {}) })) }) }));
  app.enableCors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true });
  const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('ARMZON API').setDescription('ARMZON authentication, users and catalog API').setVersion('1.0').addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }).build());
  SwaggerModule.setup('docs', app, document);
  await app.listen(Number(process.env.API_PORT ?? 4000));
}
void bootstrap();
