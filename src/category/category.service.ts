import { Injectable } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';
import CreateCategoryDto from './dto/create-category.dto';
import SizeCategoryDto from './dto/size-category.dto';
import Document from 'src/entity/document.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private catRepo: Repository<Category>,
    @InjectRepository(DocOption)
    private docOpRepo: Repository<DocOption>,
    @InjectRepository(Document)
    private docRepo: Repository<Document>,
    private configService: ConfigService,
  ) {
    this.goodsCategoryId = Number(
      this.configService.get<string>('GOODS_CATEGORY_ID'),
    );
  }
  private readonly goodsCategoryId: number;

  async searchCategory(expired: string) {
    let categories: Category[] = [];

    if (expired === 'all') {
      categories = await this.catRepo.find({
        where: {
          id: Not(this.goodsCategoryId), // Exclude the category with ID 5
        },
        relations: { docOption: true },
      });
    } else {
      categories = await this.catRepo.find({
        where: {
          id: Not(this.goodsCategoryId), // Exclude the category with ID 5
          expired: expired === 'true' ? true : false,
        },
        relations: { docOption: true },
      });
    }
    if (expired !== 'true') {
      const goods = await this.catRepo.findOne({
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
      expired: category.expired === true ? true : false,
    }));
  }

  async createCategory(body: CreateCategoryDto) {
    // create a new category object from the DTO
    const category = new Category();
    category.title = body.title;
    category.expired = false;
    category.multipleVote = body.multipleVote;
    category.anonymousVote = body.anonymousVote;

    // save the category to the database
    const savedCategory = await this.catRepo.save(category);

    // create a new doc option object from the DTO
    const docOption = new DocOption();
    docOption.goal = body.goal;
    docOption.voteExpire = body.voteExpire;
    docOption.docExpire = body.docExpire;
    docOption.category = savedCategory;

    // save the doc option to the database
    await this.docOpRepo.save(docOption);

    // return the saved category object
    return JSON.stringify(savedCategory); // return JSON for test for now
  }

  async sizeCategory(query: SizeCategoryDto, user: any) {
    let length;

    if (query.myPost === 'true') {
      length = await this.docRepo.count({
        relations: { author: true },
        where: { author: { id: user.userId } },
      });
    } else if (query.myVote === 'true') {
      length = await this.docRepo.count({
        relations: { votes: true },
        where: { votes: { id: user.userId } },
      });
    } else {
      length = await this.docRepo.count({
        relations: { category: true },
        where: { category: { id: query.categoryId } },
      });
    }
    return {
      categorySize: Math.ceil(length / 5) - 1, // round up by 5
    };
  }
}
