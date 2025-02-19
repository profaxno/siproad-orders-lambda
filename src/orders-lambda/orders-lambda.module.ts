import { Module } from '@nestjs/common';

import { OrdersLambdaService } from './orders-lambda.service';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [],
  providers: [OrdersLambdaService],
})
export class OrdersLambdaModule {}
