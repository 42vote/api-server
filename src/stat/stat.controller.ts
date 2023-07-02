import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { StatService } from './stat.service';
import { AuthAdminGuard } from 'src/auth/auth-admin.guard';
import * as xlsx from 'xlsx';
import { Response } from 'express';

@Controller('stat')
@UseGuards(AuthAdminGuard)
export class StatController {
  constructor(readonly statService: StatService) {}

  @Get('excel/vote')
  async getVoteStat(
    @Res() res: Response,
    @Query('categoryId') categoryId: number,
  ) {
    if (Number.isNaN(categoryId)) throw new BadRequestException();
    const data = await this.statService.getVoteRich({ categoryId });
    const book = xlsx.utils.book_new();
    const sheet = xlsx.utils.aoa_to_sheet(data);
    xlsx.utils.book_append_sheet(book, sheet, 'sheet');
    const csv = xlsx.write(book, {
      type: 'string',
      bookType: 'csv',
    });
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=data.csv');
    res.end("\uFEFF" + csv);
  }
}
