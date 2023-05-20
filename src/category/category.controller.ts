import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import CreateCategoryDto from './dto/create-category.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import SizeCategoryDto from './dto/size-category.dto';

@Controller('category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(readonly catService: CategoryService) {}

  @Get()
  searchCategory(@Query('expired') expired: string = 'all') {
    return this.catService.searchCat(expired);
  }

  @Post()
  creatCategory(@Body() body: CreateCategoryDto) {
    return this.catService.createCat(body);
  }

  @Get('size')
  sizeCategory(@Query() query: SizeCategoryDto, @Req() req: Request) {
    return this.catService.sizeCat(query, req['user']);
  }
}
