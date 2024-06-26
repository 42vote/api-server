import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LessThan, MoreThan, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';
import CreateCategoryDto from './dto/create-category.dto';
import SizeCategoryDto from './dto/size-category.dto';
import Document from 'src/entity/document.entity';
import { ConfigService } from '@nestjs/config';
import Vote from 'src/entity/vote.entity';
import UpdateCategoryDto from './dto/update-category.dto';
import SearchCategoryDto from './dto/search-category.dto';
import { UserService } from 'src/user/user.service';
import * as moment from 'moment-timezone';

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
    private userService: UserService,
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
      relations: { docOption: true, postWhitelist: true },
      order: { sort: 'ASC' },
    });
    if (searchCategoryDTO.expired === 'true') {
      categories = categories.filter((category) => {
        return (
          category.docOption[0].docExpire < new Date() ||
          category.docOption[0].docStart > new Date()
        );
      });
    } else if (searchCategoryDTO.expired === 'false') {
      categories = categories.filter((category) => {
        return (
          category.docOption[0].docExpire >= new Date() &&
          category.docOption[0].docStart <= new Date()
        );
      });
    }

    if (searchCategoryDTO.isPosting === 'true') {
      categories = categories.filter((category) => {
        return (
          category.docOption[0].voteExpire >= new Date() &&
          category.docOption[0].docStart <= new Date() &&
          (category.whitelistOnly === false ||
            this.#isInWhitelist(category, user.intraId))
        );
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
            : category.docOption[0].docExpire < new Date() ||
              category.docOption[0].docStart > new Date(),
        sort: category.sort,
      }))
      .sort((x, y) => x.sort - y.sort);
  }

  #isInWhitelist(category: Category, intraId: string) {
    const list = category.postWhitelist.map((user) => user.intraId.toString());
    return list.includes(intraId);
  }

  async createCategory(body: CreateCategoryDto) {
    // create a new category object from the DTO
    const category = new Category();
    category.title = body.title;
    category.multipleVote = body.multipleVote;
    category.anonymousVote = body.anonymousVote;
    category.whitelistOnly = body.whitelistOnly;
    category.postWhitelist = await Promise.all(
      body.whitelist.map((intraId) => this.userService.getUser(intraId)),
    );

    // save the category to the database
    const savedCategory = await this.categoryRepo.save(category);

    // create a new doc option object from the DTO
    const docOption = new DocOption();
    docOption.goal = body.goal;
    docOption.voteStart = new Date(body.voteStart);
    docOption.voteExpire = new Date(body.voteExpire);
    docOption.docStart = new Date(body.docStart);
    docOption.docExpire = new Date(body.docExpire);
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
          option: {
            docExpire: MoreThan(new Date()),
            docStart: LessThan(new Date()),
          },
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
          document: {
            option: {
              docExpire: MoreThan(new Date()),
              docStart: LessThan(new Date()),
            },
          },
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
          option: {
            docExpire: MoreThan(new Date()),
            docStart: LessThan(new Date()),
          },
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
      const goodsCategory = await this.categoryRepo.findOne({
        where: { id: categoryId },
      });
      return {
        id: goodsCategory.id,
        title: goodsCategory.title,
        multipleVote: goodsCategory.multipleVote,
        anonymousVote: goodsCategory.anonymousVote,
        whitelistOnly: goodsCategory.whitelistOnly,
        whitelist: [],
        createAt: goodsCategory.createAt,
        updatedAt: goodsCategory.updatedAt,
      };
    }
    const category = await this.categoryRepo.findOne({
      relations: { docOption: true, postWhitelist: true },
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
      whitelist: category.postWhitelist.map((user) => user.intraId.toString()),
      createAt: category.createAt,
      updatedAt: category.updatedAt,
      goal: category.docOption[0].goal,
      voteStart: moment(category.docOption[0].voteStart)
        .tz('Asia/Seoul')
        .format(),
      voteExpire: moment(category.docOption[0].voteExpire)
        .tz('Asia/Seoul')
        .format(),
      docStart: moment(category.docOption[0].docStart)
        .tz('Asia/Seoul')
        .format(),
      docExpire: moment(category.docOption[0].docExpire)
        .tz('Asia/Seoul')
        .format(),
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
    if (updateCategoryDTO.whitelist != null) {
      category.postWhitelist = await Promise.all(
        updateCategoryDTO.whitelist.map((intraId) =>
          this.userService.getUser(intraId),
        ),
      );
    }
    await this.categoryRepo.save(category);
    if (
      updateCategoryDTO.docStart ||
      updateCategoryDTO.docExpire ||
      updateCategoryDTO.voteStart ||
      updateCategoryDTO.voteExpire ||
      updateCategoryDTO.goal
    ) {
      if (updateCategoryDTO.docStart) {
        documentOption.docStart = new Date(updateCategoryDTO.docStart);
      }
      if (updateCategoryDTO.docExpire) {
        documentOption.docExpire = new Date(updateCategoryDTO.docExpire);
      }
      if (updateCategoryDTO.voteStart) {
        documentOption.voteStart = new Date(updateCategoryDTO.voteStart);
      }
      if (updateCategoryDTO.voteExpire) {
        documentOption.voteExpire = new Date(updateCategoryDTO.voteExpire);
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
      voteStart: documentOption.voteStart,
      voteExpire: documentOption.voteExpire,
      docStart: documentOption.docStart,
      docExpire: documentOption.docExpire,
    };
  }

  async expireCategory(categoryId: number) {
    if (categoryId === this.goodsCategoryId) {
      throw new BadRequestException('cannot delete default category');
    }
    const docOptions = await this.documentOptionRepo.find({
      relations: { category: true },
      where: { category: { id: categoryId } },
    });

    const expireTime = new Date();
    return this.documentOptionRepo.update(docOptions[0].id, {
      voteStart: expireTime,
      voteExpire: expireTime,
      docStart: expireTime,
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
      voteStart: expireTime,
      voteExpire: expireTime,
      docStart: expireTime,
      docExpire: expireTime,
    });

    return this.categoryRepo.update(categoryId, {
      hide: true,
    });
  }
}
