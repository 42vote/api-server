import {
  BadRequestException,
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
import SearchCategoryDto from './dto/search-category.dto';

@Controller('category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(readonly categoryService: CategoryService) {}

  @Get()
  searchCategory(@Query() searchCategoryDTO: SearchCategoryDto) {
    return this.categoryService.searchCategory(searchCategoryDTO.expired);
  }

  @Post()
  creatCategory(@Body() createCategoryDTO: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDTO);
  }

  @Get('size')
  sizeCategory(@Query() query: SizeCategoryDto, @Req() req: Request) {
    return this.categoryService.sizeCategory(query, req['user'].userId);
  }

  @Get(':categoryId')
  detailCategory(@Param('categoryId') categoryId: number) {
    if (isNaN(categoryId)) {
      console.log(categoryId);

      throw new BadRequestException('invalid category id');
    }
    return this.categoryService.detailCategory(categoryId);
  }
}
