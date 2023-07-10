import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { StatService } from './stat.service';
import { AuthAdminGuard } from 'src/auth/auth-admin.guard';
import { Response } from 'express';

@Controller('stat')
@UseGuards(AuthAdminGuard)
export class StatController {
  constructor(readonly statService: StatService) {}

  @Get('excel/category/:categoryId')
  async getVoteStat(
    @Res() res: Response,
    @Param('categoryId') categoryId: number,
  ) {
    if (Number.isNaN(categoryId)) throw new BadRequestException();
    res.header('Content-Type', 'text/excel');
    res.header('Content-Disposition', 'attachment; filename=data.xlsx');
    const votes = await this.statService.getVoteRich({ categoryId });
    const documents = await this.statService.getDocumentRich({ categoryId });
    this.statService
      .createExcelStream([
        { name: 'document', data: documents },
        { name: 'vote', data: votes },
      ])
      .pipe(res);
  }
}
