import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LessThan, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';
import CreateCategoryDto from './dto/create-category.dto';
import SizeCategoryDto from './dto/size-category.dto';
import Document from 'src/entity/document.entity';
import { ConfigService } from '@nestjs/config';
import Vote from 'src/entity/vote.entity';

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

  async searchCategory(expired: string) {
    const categories = await this.categoryRepo.find({
      where: {
        id: Not(this.goodsCategoryId),
      },
      relations: { docOption: true },
    });
    if (expired === 'true') {
      categories.filter((category) => {
        return category.docOption[0].docExpire < new Date();
      });
    } else if (expired === 'false') {
      categories.filter((category) => {
        return category.docOption[0].docExpire >= new Date();
      });
    }

    if (expired !== 'true') {
      const goods = await this.categoryRepo.findOne({
        where: { id: this.goodsCategoryId },
      });
      if (goods) {
        categories.unshift(goods);
      }
    }
    return categories.map((category) => ({
      id: category.id,
      title: category.title,
      goalSettable: category.id === this.goodsCategoryId ? true : false,
      goal:
        category.id === this.goodsCategoryId ? 0 : category.docOption[0].goal,
      expired:
        category.id === this.goodsCategoryId
          ? false
          : category.docOption[0].docExpire < new Date()
          ? true
          : false,
    }));
  }

  async createCategory(body: CreateCategoryDto) {
    // create a new category object from the DTO
    const category = new Category();
    category.title = body.title;
    category.multipleVote = body.multipleVote;
    category.anonymousVote = body.anonymousVote;

    // save the category to the database
    const savedCategory = await this.categoryRepo.save(category);

    // create a new doc option object from the DTO
    const docOption = new DocOption();
    docOption.goal = body.goal;
    docOption.voteExpire = body.voteExpire;
    docOption.docExpire = body.docExpire;
    docOption.category = savedCategory;

    // save the doc option to the database
    await this.documentOptionRepo.save(docOption);

    // return the saved category object
    return JSON.stringify(savedCategory); // return JSON for test for now
  }

  async sizeCategory(query: SizeCategoryDto, userId: number) {
    let length;

    if (query.myPost === 'true') {
      length = await this.documentRepo.count({
        relations: { author: true },
        where: { author: { id: userId } },
      });
    } else if (query.myVote === 'true') {
      length = await this.voteRepo.count({
        relations: { user: true },
        where: { user: { id: userId } },
      });
    } else {
      length = await this.documentRepo.count({
        relations: { category: true },
        where: { category: { id: query.categoryId } },
      });
    }
    return {
      categorySize: Math.ceil(length / 5) - 1, // round up by 5
    };
  }
}
