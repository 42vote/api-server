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
import { Request } from 'express';
import { CategoryService } from './category.service';
import CreateCategoryDto from './dto/create-category.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import SizeCategoryDto from './dto/size-category.dto';
import SearchCategoryDto from './dto/search-category.dto';
import UpdateCategoryDto from './dto/update-category.dto';
import { AuthAdminGuard } from 'src/auth/auth-admin.guard';

@Controller('category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(readonly categoryService: CategoryService) {}

  @Get()
  searchCategory(
    @Query() searchCategoryDTO: SearchCategoryDto,
    @Req() req: Request,
  ) {
    return this.categoryService.searchCategory(searchCategoryDTO, req['user']);
  }

  @Post()
  @UseGuards(AuthAdminGuard)
  creatCategory(@Body() createCategoryDTO: CreateCategoryDto) {
    if (createCategoryDTO.voteStart > createCategoryDTO.voteExpire) {
      throw new BadRequestException(
        'voteStart cannot be bigger then voteExpire',
      );
    }
    if (createCategoryDTO.docStart > createCategoryDTO.docExpire) {
      throw new BadRequestException('docStart cannot be bigger then docExpire');
    }
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
  @UseGuards(AuthAdminGuard)
  updateCategory(
    @Param('categoryId') categoryId: number,
    @Body() updateCategoryDTO: UpdateCategoryDto,
  ) {
    if (isNaN(categoryId)) {
      console.log(categoryId);

      throw new BadRequestException('invalid category id');
    }
    if (updateCategoryDTO.voteStart > updateCategoryDTO.voteExpire) {
      throw new BadRequestException(
        'voteStart cannot be bigger then voteExpire',
      );
    }
    if (updateCategoryDTO.docStart > updateCategoryDTO.docExpire) {
      throw new BadRequestException('docStart cannot be bigger then docExpire');
    }
    return this.categoryService.updateCategory(categoryId, updateCategoryDTO);
  }

  @Patch('expire/:categoryId')
  @UseGuards(AuthAdminGuard)
  expireCategory(@Param('categoryId') categoryId: number) {
    if (isNaN(categoryId)) {
      throw new BadRequestException('invalid category id');
    }
    return this.categoryService.expireCategory(categoryId);
  }

  @Delete(':categoryId')
  @UseGuards(AuthAdminGuard)
  hideCategory(@Param('categoryId') categoryId: number) {
    if (isNaN(categoryId)) {
      throw new BadRequestException('invalid category id');
    }
    return this.categoryService.hideCategory(categoryId);
  }
}
