import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true });
  const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('MARKETPLACE_APP API').setVersion('1.0').build());
  SwaggerModule.setup('docs', app, document);
  await app.listen(Number(process.env.API_PORT ?? 4000));
}
void bootstrap();
