import { ProcessSummaryDto } from 'profaxnojs/util';

import { Injectable, Logger } from '@nestjs/common';

import { MessageDto } from './dto/data-replication.dto';
import { ProcessEnum, SourceEnum } from './enum';
import { Record, Event, Body } from './interface';

import { OrdersCompanyDto, OrdersProductDto } from 'src/orders/dto';
import { OrdersResponseDto } from 'src/orders/dto/orders-response-dto';
import { OrdersCompanyService } from 'src/orders/orders-company.service';
import { OrdersProductService } from 'src/orders/orders-product.service';

@Injectable()
export class OrdersLambdaService {

  private readonly logger = new Logger(OrdersLambdaService.name);

  constructor(
    private readonly ordersCompanyService: OrdersCompanyService,
    private readonly ordersProductService: OrdersProductService
  ) {}

  async processEvent(event: Event): Promise<any> {
    const start = performance.now();
    
    const recordsSize = event.Records ? event.Records.length : 0;
     
    //let successfulMessages: string[] = [];
    let failedMessages: { itemIdentifier: string }[] = [];
    let processSummaryDto = new ProcessSummaryDto(event.Records.length);

    if(recordsSize == 0) {
      this.logger.log(`processEvent: not executed (list empty)`);
      return { batchItemFailures: failedMessages };
    }

    this.logger.log(`processEvent: starting process... recordsSize=${recordsSize}`);

    let i = 0;
    for (const record of event.Records) {
      this.logger.warn(`[${i}] processEvent: processing message, messageId=${record.messageId}`);

      await this.processMessage(record)
      .then( (responseDto: OrdersResponseDto) => {
        processSummaryDto.rowsOK++;
        processSummaryDto.detailsRowsOK.push(`[${i}] messageId=${record.messageId}, response=${responseDto.message}`);
        this.logger.log(`[${i}] processEvent: message processed, messageId=${record.messageId}`);
      })
      .catch( (error) => {
        processSummaryDto.rowsKO++;
        processSummaryDto.detailsRowsKO.push(`[${i}] messageId=${record.messageId}, error=${error.message}`);
        this.logger.error(`[${i}] processEvent: error processing message, messageId=${record.messageId}, error`, error.message);
        failedMessages.push({ itemIdentifier: record.messageId });
      })
      .finally( () => {
        i++;
      })

    }

    const end = performance.now();
    this.logger.log(`processEvent: executed, runtime=${(end - start) / 1000} seconds, summary=${JSON.stringify(processSummaryDto)}`);
    
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({ message: 'Event processed successfully' }),
    // };

    return { batchItemFailures: failedMessages };
  }

  private processMessage(record: Record): Promise<OrdersResponseDto> {
    try {
      const body: Body = JSON.parse(record.body);
      const messageDto: MessageDto = JSON.parse(body.Message);

      // * replicate companies to orders
      if(messageDto.process == ProcessEnum.COMPANY_UPDATE) {
        const dto: OrdersCompanyDto = JSON.parse(messageDto.jsonData);

        return this.ordersCompanyService.updateCompany(dto)
        .then( (responseDto: OrdersResponseDto) => {
          return responseDto;
        })
      }

      if(messageDto.process == ProcessEnum.COMPANY_DELETE) {
        const dto: OrdersCompanyDto = JSON.parse(messageDto.jsonData);

        return this.ordersCompanyService.deleteCompany(dto.id)
        .then( (responseDto: OrdersResponseDto) => {
          return responseDto;
        })
      }
      
      // * replicate products to orders
      if(messageDto.process == ProcessEnum.PRODUCT_UPDATE) {
        const dto: OrdersProductDto = JSON.parse(messageDto.jsonData);

        return this.ordersProductService.updateProduct(dto)
        .then( (responseDto: OrdersResponseDto) => {
          return responseDto;
        })
      }

      if(messageDto.process == ProcessEnum.PRODUCT_DELETE) {
        const dto: OrdersProductDto = JSON.parse(messageDto.jsonData);

        return this.ordersProductService.deleteProduct(dto.id)
        .then( (responseDto: OrdersResponseDto) => {
          return responseDto;
        })
      }
    
      throw new Error(`process not implemented, source=${messageDto.source}, process=${messageDto.process}`);
      
    } catch (error) {
      throw error;
    }
  }

}
