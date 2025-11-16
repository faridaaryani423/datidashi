import 'dotenv/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import validationOptions from './utils/validation-options';
import { AllConfigType } from './config/config.type';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [
        'http://localhost:4000',
        'http://localhost:3000',
        /\.vercel\.app$/,
        /\.railway\.app$/,
        ...(process.env.FRONTEND_DOMAIN ? [process.env.FRONTEND_DOMAIN] : []),
      ],
      credentials: true,
    },
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);
  const expressApp = app.getHttpAdapter().getInstance();

  // Increase body size limit for base64 images (10MB)
  expressApp.use(express.json({ limit: '10mb' }));
  expressApp.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );

  // Serve static files - COMMENTED FOR SEPARATED ARCHITECTURE (Vercel + Render)
  // Uncomment these lines for local testing only
  // expressApp.use(
  //   '/themes',
  //   express.static(join(__dirname, '..', 'public', 'themes')),
  // );
  // expressApp.use('/js', express.static(join(__dirname, '..', 'public', 'js')));
  // expressApp.use('/html', express.static(join(__dirname, '..', 'public', 'html')));

  // Redirect routes - COMMENTED FOR SEPARATED ARCHITECTURE
  // expressApp.get('/', (req: any, res: any) => {
  //   res.redirect('/html/index.html');
  // });

  // expressApp.get('/login', (req: any, res: any) => {
  //   res.redirect('/html/login.html');
  // });

  // expressApp.get('/admin', (req: any, res: any) => {
  //   res.redirect('/html/admin.html');
  // });
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(
    // ResolvePromisesInterceptor is used to resolve promises in responses because class-transformer can't do it
    // https://github.com/typestack/class-transformer/issues/549
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalParameters({
      in: 'header',
      required: false,
      name: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',
      schema: {
        example: 'en',
      },
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  // Health check endpoint for Railway
  expressApp.get('/health', (req: any, res: any) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = configService.getOrThrow('app.port', { infer: true });
  // Listen on 0.0.0.0 for Railway (required for container networking)
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
void bootstrap();
