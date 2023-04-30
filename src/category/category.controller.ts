import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import CreateCategoryDto from './dto/create-category.dot';
import { AuthGuard } from 'src/auth/auth.guard';

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
}
