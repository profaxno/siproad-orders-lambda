import { PfxHttpMethodEnum, PfxHttpService } from 'profaxnojs/axios';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { OrdersResponseDto } from './dto/orders-response-dto';
import { OrdersCompanyDto } from './dto/orders-company.dto';
import { OrdersEnum } from './enum/orders.enum';

@Injectable()
export class OrdersCompanyService {
  private readonly logger = new Logger(OrdersCompanyService.name);

  private siproadOrdersHost: string = null;
  private siproadOrdersApiKey: string = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly pfxHttpService: PfxHttpService
  ) { 
    this.siproadOrdersHost = this.configService.get('siproadOrdersHost');
    this.siproadOrdersApiKey = this.configService.get('siproadOrdersApiKey');
  }

  updateCompany(dto: OrdersCompanyDto): Promise<OrdersResponseDto>{
    const start = performance.now();

    // * generate request values
    const method  = PfxHttpMethodEnum.PATCH;
    const path    = this.siproadOrdersHost.concat(OrdersEnum.PATH_COMPANY_UPDATE);
    const headers = { "x-api-key": this.siproadOrdersApiKey };
    const body    = dto;

    // * send request
    return this.pfxHttpService.request<OrdersResponseDto>(method, path, headers, body)
    .then(response => {

      if ( !(
        response.internalCode == HttpStatus.OK || 
        response.internalCode == HttpStatus.BAD_REQUEST || 
        response.internalCode == HttpStatus.NOT_FOUND) )
        throw new Error(`updateCompany: Error, response=${JSON.stringify(response)}`);

      const end = performance.now();
      this.logger.log(`updateCompany: OK, runtime=${(end - start) / 1000} seconds`);
      return response;
    })
    .catch(error => {
      this.logger.error(`updateCompany: ${error}`);
      throw error;
    })
  }

  deleteCompany(id: string): Promise<OrdersResponseDto>{
    const start = performance.now();

    // * generate request values
    const method  = PfxHttpMethodEnum.DELETE;
    const path    = this.siproadOrdersHost.concat(OrdersEnum.PATH_COMPANY_DELETE).concat(`/${id}`);;
    const headers = { "x-api-key": this.siproadOrdersApiKey };
    const body    = {};

    // * send request
    return this.pfxHttpService.request<OrdersResponseDto>(method, path, headers, body)
    .then(response => {

      if ( !(
        response.internalCode == HttpStatus.OK || 
        response.internalCode == HttpStatus.CREATED || 
        response.internalCode == HttpStatus.BAD_REQUEST || 
        response.internalCode == HttpStatus.NOT_FOUND) )
        throw new Error(`deleteCompany: Error, response=${JSON.stringify(response)}`);

      const end = performance.now();
      this.logger.log(`deleteCompany: OK, runtime=${(end - start) / 1000} seconds`);
      return response;
    })
    .catch(error => {
      this.logger.error(`deleteCompany: ${error}`);
      throw error;
    })
  }

}
