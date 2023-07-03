import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import UpdateCategoryDto from './dto/update-category.dto';

@Controller('category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(readonly categoryService: CategoryService) {}

  @Get()
  searchCategory(@Query() searchCategoryDTO: SearchCategoryDto, @Req() req: Request) {
    return this.categoryService.searchCategory(searchCategoryDTO, req['user']);
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

  @Patch(':categoryId')
  updateCategory(@Param('categoryId') categoryId: number, @Body() updateCategoryDTO: UpdateCategoryDto) {
    if (isNaN(categoryId)) {
      console.log(categoryId);

      throw new BadRequestException('invalid category id');
    }
    return this.categoryService.updateCategory(categoryId, updateCategoryDTO);
  }

  @Delete(':categoryId')
  deleteCategory(@Param('categoryId') categoryId: number) {
    if (isNaN(categoryId)) {
      throw new BadRequestException('invalid category id');
    }
    return this.categoryService.deleteCategory(categoryId);
  }

  @Delete('hide/:categoryId')
   hideCategory(@Param('categoryId') categoryId: number) {
    if (isNaN(categoryId)) {
      throw new BadRequestException('invalid category id');
    }
    return this.categoryService.hideCategory(categoryId);
  }
}
