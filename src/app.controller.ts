import { AppService } from './app.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from './common/decorators/response-message.decorator';

@Controller()
@ApiTags('application')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Check that the API is running' })
  @ApiOkResponse({ description: 'Returns the API greeting.' })
  @ResponseMessage('API is running.')
  getHello(): string {
    return this.appService.getHello();
  }
}
