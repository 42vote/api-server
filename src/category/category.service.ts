import { Injectable } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';
import CreateCategoryDto from './dto/create-category.dto';
import SearchCategoryDto from './dto/search-category.dto';
import SizeCategoryDto from './dto/size-category.dto';
import Vote from 'src/entity/vote.entity';
import User from 'src/entity/user.entity';
import Document from 'src/entity/document.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private catRepo: Repository<Category>,
    @InjectRepository(DocOption)
    private docOpRepo: Repository<DocOption>,
    @InjectRepository(Document)
    private docRepo: Repository<Document>,
  ) {}
  async searchCat(expired: string) {
    // let query = this.catRepo.createQueryBuilder('category');

    // if (expired !== 'all') {
    //   const expiredBool = expired === 'true' ? true : false;
    //   query = query.where('category.expired = :expired', {
    //     expired: expiredBool,
    //   });
    // }

    // const categories = await query
    //   .select([
    //     'category.id',
    //     'category.title',
    //     'category.expired',
    //     'caregory.docOption',
    //   ])
    //   .getRawMany();

    let categories: Category[] = [];

    if (expired === 'all') {
      categories = await this.catRepo.find({
        where: {
          id: Not(5), // Exclude the category with ID 5
        },
        relations: { docOption: true },
      });
    } else {
      categories = await this.catRepo.find({
        where: {
          id: Not(5), // Exclude the category with ID 5
          expired: expired === 'true' ? true : false
        },
        relations: { docOption: true },
      });
    }
    if (expired !== 'true'){
      const goods = await this.catRepo.findOne({ where: { id: 5 } });
        if (goods) {
          categories.push(goods);
        }
    }

    return categories.map((category) => ({
      id: category.id,
      title: category.title,
      goalSettable: category.id === 5 ? true : false,
      goal: category.id === 5 ? 0 : category.docOption[0].goal,
      expired: category.expired === true ? true : false,
    }));
  }

  async createCat(body: CreateCategoryDto) {
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

  async sizeCat(query: SizeCategoryDto, user: any) {
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
    console.log(length);
    return {
      categorySize: Math.ceil(length / 5) - 1, // round up by 5
    };
  }
}
