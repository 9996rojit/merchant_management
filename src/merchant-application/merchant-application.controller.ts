import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { ApplicationDecision } from '@app/lib';
import { ApplicationStatus, UserRole } from '@app/lib';
import { RolesGuard } from '../common/guard/roles.guard';
import { Roles } from '../common/decorators/role.decorator';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { SalesOwnerGuard } from '../common/guard/sales-owner.guard';
import { MerchantApplicationService } from './merchant-application.service';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';
import { CreateMerchantApplicationDto } from './dto/create-merchant-application.dto';
import { UpdateMerchantApplicationDto } from './dto/update-merchant-application.dto';
import { FindMerchantApplicationsDto } from './dto/find-merchant-applications.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@Controller('merchant-application')
@UseGuards(JwtAuthGuard)
@ApiTags('merchant applications')
@ApiBearerAuth()
export class MerchantApplicationsController {
  constructor(private readonly merchantApplicationsService: MerchantApplicationService) { }

  @Post()
  @ApiOperation({ summary: 'Submit a merchant application' })
  @ResponseMessage('Merchant application submitted successfully.')
  @ApiCreatedResponse({ description: 'Application submitted; risk review is queued.' })
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateMerchantApplicationDto, @Req() req: AuthenticatedRequest) {
    return this.merchantApplicationsService.create(dto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List merchant applications' })
  @ResponseMessage('Merchant applications retrieved successfully.')
  @ApiOkResponse({ description: 'Returns a page of applications visible to the current user.' })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: FindMerchantApplicationsDto,
  ) {
    return this.merchantApplicationsService.findAll(query, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a merchant application by ID' })
  @ResponseMessage('Merchant application retrieved successfully.')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Returns the requested application.' })
  @UseGuards(SalesOwnerGuard)
  findOne(@Param('id') id: string) {
    return this.merchantApplicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a merchant application' })
  @ResponseMessage('Merchant application updated successfully.')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Returns the updated application.' })
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @UseGuards(RolesGuard, SalesOwnerGuard)
  update(@Param('id') id: string, @Body() dto: UpdateMerchantApplicationDto, @Req() req: AuthenticatedRequest) {
    return this.merchantApplicationsService.update(id, dto, req.user.sub);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign the current reviewer to an application' })
  @ResponseMessage('Reviewer assigned successfully.')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Returns the application after assignment.' })
  @Roles(UserRole.ADMIN, UserRole.REVIEWER)
  @UseGuards(RolesGuard)
  assignReviewer(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.merchantApplicationsService.assignReviewer(id, req.user.sub);
  }

  @Patch(':id/decision')
  @ApiOperation({ summary: 'Record a decision for a merchant application' })
  @ResponseMessage('Application decision recorded successfully.')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['decision'],
      properties: {
        decision: {
          type: 'string',
          enum: [
            ApplicationStatus.APPROVED,
            ApplicationStatus.REJECTED,
            ApplicationStatus.INFO_REQUIRED,
          ],
        },
      },
    },
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Returns the application with its decision.' })
  @Roles(UserRole.ADMIN, UserRole.REVIEWER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  makeDecision(
    @Param('id') id: string,
    @Body('decision') decision: ApplicationDecision,
    @Req() req: AuthenticatedRequest
  ) {
    return this.merchantApplicationsService.makeDecision(id, decision, req.user.sub);
  }
}