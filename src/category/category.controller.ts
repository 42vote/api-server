import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import SearchCategoryDto from './dto/search-category.dto';
import CreateCategoryDto from './dto/create-category.dot';

@Controller('category')
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
