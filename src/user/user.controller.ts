import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@Controller('user')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ResponseMessage('User created successfully.')
  @ApiCreatedResponse({ description: 'The user was created.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ResponseMessage('Users retrieved successfully.')
  @ApiOkResponse({ description: 'Returns users.' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ResponseMessage('User retrieved successfully.')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Returns the matching user.' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ResponseMessage('User updated successfully.')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Returns the updated user.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ResponseMessage('User deleted successfully.')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'The user was deleted.' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
