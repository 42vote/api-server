import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoryService } from './category.service';
import SearchCategoryDto from './dto/search-category.dto';
import CreateCategoryDto from './dto/create-category.dot';

@Controller('category')
export class CategoryController {
  constructor(readonly catService: CategoryService) {}

  @Get()
  searchCategory(@Body() body: SearchCategoryDto) {
    return this.catService.searchCat(body);
  }

  @Post()
  creatCategory(@Body() body: CreateCategoryDto) {
    return this.catService.createCat(body);
  }
}
