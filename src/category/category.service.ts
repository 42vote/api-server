import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LessThan, MoreThan, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { InjectRepository, getDataSourcePrefix } from '@nestjs/typeorm';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';
import CreateCategoryDto from './dto/create-category.dto';
import SizeCategoryDto from './dto/size-category.dto';
import Document from 'src/entity/document.entity';
import { ConfigService } from '@nestjs/config';
import Vote from 'src/entity/vote.entity';
import UpdateCategoryDto from './dto/update-category.dto';
import SearchCategoryDto from './dto/search-category.dto';

@Injectable()
export class CategoryService {
  // default category id
  private readonly goodsCategoryId: number;

  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(DocOption)
    private documentOptionRepo: Repository<DocOption>,
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    @InjectRepository(Vote)
    private voteRepo: Repository<Vote>,
    private configService: ConfigService,
  ) {
    const goodsCategoryId = Number(
      this.configService.get<string>('GOODS_CATEGORY_ID'),
    );
    if (isNaN(goodsCategoryId)) {
      throw new InternalServerErrorException(
        'GOODS_CATEGORY_ID is not set or invalid.',
      );
    }
    this.goodsCategoryId = goodsCategoryId;
  }

  async searchCategory(searchCategoryDTO: SearchCategoryDto, user: any) {
    let categories = await this.categoryRepo.find({
      where: {
        id: Not(this.goodsCategoryId),
        hide: false,
      },
      relations: { docOption: true },
      order: { sort: 'ASC' },
    });
    if (searchCategoryDTO.expired === 'true') {
      categories = categories.filter((category) => {
        return category.docOption[0].docExpire < new Date();
      });
    } else if (searchCategoryDTO.expired === 'false') {
      categories = categories.filter((category) => {
        return category.docOption[0].docExpire >= new Date();
      });
    }
    if (searchCategoryDTO.isPosting === 'true') {
      categories = categories.filter((category) => {
        return (!category.whitelistOnly || category.whitelist.includes(user.intraId));
      });
    }

    if (searchCategoryDTO.expired !== 'true') {
      const goods = await this.categoryRepo.findOne({
        where: { id: this.goodsCategoryId },
      });
      if (goods) {
        categories.push(goods);
      }
    }
    return categories
      .map((category) => ({
        id: category.id,
        title: category.title,
        goalSettable: category.id === this.goodsCategoryId ? true : false,
        goal:
          category.id === this.goodsCategoryId ? 0 : category.docOption[0].goal,
        expired:
          category.id === this.goodsCategoryId
            ? false
            : category.docOption[0].docExpire < new Date(),
        sort: category.sort,
      }))
      .sort((x, y) => x.sort - y.sort);
  }

  async createCategory(body: CreateCategoryDto) {
    // create a new category object from the DTO
    const category = new Category();
    category.title = body.title;
    category.multipleVote = body.multipleVote;
    category.anonymousVote = body.anonymousVote;
    category.whitelistOnly = body.whitelistOnly;
    category.whitelist = body.whitelist;

    // save the category to the database
    const savedCategory = await this.categoryRepo.save(category);

    // create a new doc option object from the DTO
    const docOption = new DocOption();
    docOption.goal = body.goal;
    docOption.voteExpire = new Date(
      body.voteExpire.toLocaleString('ko-KR', { timeZone: 'UTC' }),
    );
    docOption.docExpire = new Date(
      body.docExpire.toLocaleString('ko-KR', { timeZone: 'UTC' }),
    );
    docOption.category = savedCategory;

    // save the doc option to the database
    await this.documentOptionRepo.save(docOption);

    // return the saved category object
    return JSON.stringify(savedCategory); // return JSON for test for now
  }

  async sizeCategory(query: SizeCategoryDto, userId: number) {
    let totalLength;
    let activeLength;

    if (query.myPost === 'true') {
      totalLength = await this.documentRepo.count({
        relations: { author: true },
        where: { author: { id: userId } },
      });
      activeLength = await this.documentRepo.count({
        relations: {
          author: true,
          option: true,
        },
        where: {
          author: { id: userId },
          option: { docExpire: MoreThan(new Date()) },
        },
      });
    } else if (query.myVote === 'true') {
      totalLength = await this.voteRepo.count({
        relations: { user: true },
        where: { user: { id: userId } },
      });
      activeLength = await this.voteRepo.count({
        relations: { document: { option: true } },
        where: {
          user: { id: userId },
          document: { option: { docExpire: MoreThan(new Date()) } },
        },
      });
    } else {
      totalLength = await this.documentRepo.count({
        relations: { category: true, option: true },
        where: { category: { id: query.categoryId } },
      });
      activeLength = await this.documentRepo.count({
        relations: { author: true, option: true },
        where: {
          category: { id: query.categoryId },
          option: { docExpire: MoreThan(new Date()) },
        },
      });
    }
    return {
      categorySize: Math.ceil(totalLength / 5) - 1, // round up by 5
      activeSize: Math.ceil(activeLength / 5) - 1,
    };
  }

  async detailCategory(categoryId: number) {
    if (categoryId === this.goodsCategoryId) {
      return await this.categoryRepo.findOne({
        where: { id: categoryId },
      });
    }
    const category = await this.categoryRepo.findOne({
      relations: { docOption: true},
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    return {
      id: category.id,
      title: category.title,
      multipleVote: category.multipleVote,
      anonymousVote: category.anonymousVote,
      whitelistOnly: category.whitelistOnly,
      whitelist: category.whitelist,
      createAt: category.createAt,
      updatedAt: category.updatedAt,
      goal: category.docOption[0].goal,
      voteExpire: category.docOption[0].voteExpire,
      docExpire: category.docOption[0].docExpire,
    };
  }

  async updateCategory(
    categoryId: number,
    updateCategoryDTO: UpdateCategoryDto,
  ) {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: { docOption: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
    if (!category.docOption) {
      throw new NotFoundException(
        `Category with ID ${categoryId} has no document option`,
      );
    }
    const documentOption = category.docOption[0];

    if (updateCategoryDTO.title) {
      category.title = updateCategoryDTO.title;
    }
    if (updateCategoryDTO.sort != null) {
      category.sort = updateCategoryDTO.sort;
    }
    if (updateCategoryDTO.whitelistOnly != null) {
      category.whitelistOnly = updateCategoryDTO.whitelistOnly;
    }
    console.log(updateCategoryDTO.whitelist);
    if (updateCategoryDTO.whitelist != null) {
      category.whitelist = updateCategoryDTO.whitelist;
    }
    await this.categoryRepo.save(category);
    if (
      updateCategoryDTO.docExpire ||
      updateCategoryDTO.voteExpire ||
      updateCategoryDTO.goal
    ) {
      if (updateCategoryDTO.docExpire) {
        documentOption.docExpire = new Date(
          updateCategoryDTO.docExpire.toLocaleString('ko-KR', {
            timeZone: 'UTC',
          }),
        );
      }
      if (updateCategoryDTO.voteExpire) {
        documentOption.voteExpire = new Date(
          updateCategoryDTO.voteExpire.toLocaleString('ko-KR', {
            timeZone: 'UTC',
          }),
        );
      }
      if (updateCategoryDTO.goal) {
        documentOption.goal = updateCategoryDTO.goal;
      }
      await this.documentOptionRepo.save(documentOption);
    }

    return {
      id: category.id,
      title: category.title,
      multipleVote: category.multipleVote,
      anonymousVote: category.anonymousVote,
      createAt: category.createAt,
      updatedAt: category.updatedAt,
      goal: documentOption.goal,
      voteExpire: documentOption.voteExpire,
      docExpire: documentOption.docExpire,
    };
  }

  async deleteCategory(categoryId: number) {
    if (categoryId === this.goodsCategoryId) {
      throw new BadRequestException('cannot delete default category');
    }
    const docOptions = await this.documentOptionRepo.find({
      relations: { category: true },
      where: { category: { id: categoryId } },
    });

    const expireTime = new Date();

    return this.documentOptionRepo.update(docOptions[0].id, {
      voteExpire: expireTime,
      docExpire: expireTime,
    });

    // return await this.categoryRepo.delete(categoryId)
  }

  async hideCategory(categoryId: number) {
    if (categoryId === this.goodsCategoryId) {
      throw new BadRequestException('cannot hide default category');
    }
    const docOptions = await this.documentOptionRepo.findOne({
      relations: { category: true },
      where: { category: { id: categoryId } },
    });

    const expireTime = new Date();

    await this.documentOptionRepo.update(docOptions.id, {
      voteExpire: expireTime,
      docExpire: expireTime,
    });

    return this.categoryRepo.update(categoryId, {
      hide: true,
    });
  }
}
