import { AuditService } from './audit.service';
import { Controller, Post, Body } from '@nestjs/common';
import { CreateAuditDto } from './dto/create-audit.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@Controller('audit')
@ApiTags('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) { }

  @Post()
  @ApiOperation({ summary: 'Create an audit log entry' })
  @ResponseMessage('Audit log created successfully.')
  @ApiCreatedResponse({ description: 'The audit log entry was created.' })
  create(@Body() createAuditDto: CreateAuditDto) {
    return this.auditService.create(createAuditDto);
  }
}
