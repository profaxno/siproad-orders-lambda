import { PfxHttpModule } from 'profaxnojs/axios';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersCompanyService } from './orders-company.service';
import { OrdersProductService } from './orders-product.service';

@Module({
  imports: [ConfigModule, PfxHttpModule],
  providers: [OrdersCompanyService, OrdersProductService],
  exports: [OrdersCompanyService, OrdersProductService]
})
export class OrdersModule {}
