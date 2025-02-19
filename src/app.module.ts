import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { config } from './config/app.config';
import { OrdersLambdaModule } from './orders-lambda/orders-lambda.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [config]
    }),
    OrdersLambdaModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
