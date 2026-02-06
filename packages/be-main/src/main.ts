import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: [
      /^http:\/\/localhost(:\d+)?$/,
      /^http:\/\/127\.0\.0\.1(:\d+)?$/,
      /^http:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?$/, // 允许 IP 访问（生产部署）
    ],
  })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())

  const config = new DocumentBuilder()
    .setTitle('Bug 平台 API')
    .setDescription('Bug 平台后端接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document)
  const basePort = Number(process.env.PORT) || 3000;
  const maxAttempts = 10;

  for (let i = 0; i < maxAttempts; i++) {
    const port = basePort + i;
    try {
      await app.listen(port);
      console.log(`Application is running on: http://localhost:${port}`);
      console.log(`Swagger UI: http://localhost:${port}/api-docs`);
      return;
    } catch (err: unknown) {
      const isAddrInUse =
        err instanceof Error &&
        'code' in err &&
        (err as NodeJS.ErrnoException).code === 'EADDRINUSE';
      if (isAddrInUse && i < maxAttempts - 1) {
        console.warn(`Port ${port} is in use, trying ${port + 1}...`);
      } else {
        throw err;
      }
    }
  }
}
bootstrap();
