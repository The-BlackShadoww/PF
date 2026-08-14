import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { AccountService } from './account.service';
import { SetupAccountDto } from './dto/setup-account.dto';
import { UpsertSectorDto } from './dto/upsert-sector.dto';

@ApiTags('Account')
@ApiBearerAuth('access-token')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('summary') @ApiOperation({ summary: 'Get the all-time account balance and sector allocations' }) @ApiResponse({ status: 200 })
  getSummary(@CurrentUser() user: AuthenticatedUser) { return this.accountService.getAccountSummary(user.id); }

  @Put('setup') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Create or update account configuration' }) @ApiBody({ type: SetupAccountDto })
  async setup(@CurrentUser() user: AuthenticatedUser, @Body() dto: SetupAccountDto) {
    const config = await this.accountService.setupAccount(user.id, dto);
    await this.accountService.seedDefaultSectors(user.id);
    return config;
  }

  @Get('sectors') getSectors(@CurrentUser() user: AuthenticatedUser) { return this.accountService.getSectors(user.id); }
  @Post('sectors') @HttpCode(HttpStatus.CREATED) @ApiBody({ type: UpsertSectorDto })
  createSector(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertSectorDto) { return this.accountService.createSector(user.id, dto); }
  @Patch('sectors/:id') @ApiParam({ name: 'id', description: 'Sector UUID' }) @ApiBody({ type: UpsertSectorDto })
  updateSector(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertSectorDto) { return this.accountService.updateSector(user.id, id, dto); }
  @Delete('sectors/:id') @ApiParam({ name: 'id', description: 'Sector UUID' })
  deleteSector(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) { return this.accountService.deleteSector(user.id, id); }
}
