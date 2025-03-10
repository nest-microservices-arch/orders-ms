import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('orders-microservice');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: envs.NATS_SERVERS,
      },
    },
  );

  app.useGlobalPipes(  
    new ValidationPipe({ 
  whitelist: true, 
  forbidNonWhitelisted: true, 
    }) 
  );

  await app.listen();
  logger.log(`orders microservice is running on port ${envs.PORT}`);
}
bootstrap();
