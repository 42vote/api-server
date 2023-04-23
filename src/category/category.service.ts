import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';
import CreateCategoryDto from './dto/create-category.dot';
import SearchCategoryDto from './dto/search-category.dto';
// import { AppDataSource } from 'src/database';
import * as dotenv from 'dotenv';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoryService {
  // private CatRepo: Repository<Category>;
  // private DocOpRepo: Repository<DocOption>;
  constructor(
    @InjectRepository(Category)
    private CatRepo: Repository<Category>,
    @InjectRepository(DocOption)
    private DocOpRepo: Repository<DocOption>
  ) {
    // @InjectRepository(Category)
    // private CatRepo: Repository<Category>
    // this.CatRepo = AppDataSource.getRepository(Category);
    // this.DocOpRepo = AppDataSource.getRepository(DocOption);

    // dotenv.config();
  }
  async searchCat(body: SearchCategoryDto) {
    const { expired } = body;



    let query = this.CatRepo.createQueryBuilder('category');

    if (expired !== 'all') {
      const expiredBool = expired === 'true' ? true : false;
      query = query.where('category.expired = :expired', {
        expired: expiredBool,
      });
    }

    const categories = await query
      .select(['category.id', 'category.title', 'category.expired'])
      .getRawMany();

    return categories.map((category) => ({
      id: category.category_id,
      title: category.category_title,
      expired: category.category_expired === 1 ? true : false,
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
    const savedCategory = await this.CatRepo.save(category);

    // create a new doc option object from the DTO
    const docOption = new DocOption();
    docOption.goal = body.goal;
    docOption.voteExpire = body.voteExpire;
    docOption.docExpire = body.docExpire;
    docOption.category = savedCategory;

    // save the doc option to the database
    await this.DocOpRepo.save(docOption);

    // return the saved category object
    return JSON.stringify(savedCategory); // return JSON for test for now
  }
}
