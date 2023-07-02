import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from 'src/entity/user.entity';
import Vote from 'src/entity/vote.entity';
import Document from 'src/entity/document.entity';
import Category from 'src/entity/category.entity';
import SearchStatCategoryDto from './dto/search-stat-category.dto';
import { Readable } from "stream";
import * as xlsx from 'xlsx';

@Injectable()
export class StatService {
  constructor(
    @InjectRepository(Vote) private voteRepo: Repository<Vote>,
    @InjectRepository(Document) private documentRepo: Repository<Document>
  ) {}

  createExcelStream(sheetDatas: Array<{name: string, data: any[][]}>) {
    const book = xlsx.utils.book_new();
    for (const idx in sheetDatas) {
      const sheetData = sheetDatas[idx];
      const sheet = xlsx.utils.aoa_to_sheet(sheetData.data);
      xlsx.utils.book_append_sheet(book, sheet, sheetData.name);
    }
    const buffer = xlsx.write(book, {
      type: 'buffer',
    });
    return this.#bufferToStream(buffer);
  }

  #bufferToStream(buffer: any) { 
    var stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  async getVoteRich(search: SearchStatCategoryDto): Promise<any[][]> {
    const query = this.voteRepo
    .createQueryBuilder('vote')
    .innerJoin('vote.user', 'user')
    .innerJoin('vote.document', 'document')
    .innerJoin('document.category', 'category')
    .innerJoin('document.author', 'author')
    .where('1=1');
    if (search.categoryId != null)
      query.andWhere('category.id = :categoryId', search);
    query.orderBy('document.title', 'ASC');
    query.setFindOptions({ relations: ['user', 'document'] });
    query.select([
      'vote.id',
      'category.title',
      'document.title',
      'author.intraId',
      'user.intraId',
    ]);
    const res = await query.getMany();
    return [
      ['Category', 'Document', 'Author', 'Voter'],
      ...res.map((x) => [
        x.document.category.title,
        x.document.title,
        x.document.author.intraId,
        x.user.intraId,
      ]),
    ];
  }

  async getDocumentRich(search: SearchStatCategoryDto) {
    const query = this.documentRepo
      .createQueryBuilder('document')
      .innerJoin('document.author', 'author')
      .innerJoin('document.category', 'category')
      .innerJoin('document.option', 'option')
      .leftJoin('document.votes', 'voter')
      .groupBy('document.id')
      .where('1=1');
    if (search.categoryId != null)
      query.andWhere('category.id = :categoryId', search);
    query.orderBy('document.title', 'ASC');
    query.setFindOptions({ relations: ['author', 'category'] });
    query.select([
      'document.id',
      'document.title',
      'option.goal',
      'category.title',
      'author.intraId',
      'count(voter.userId) as voteCnt',
    ]);
    const res = await query.getRawMany();
    return [
      ['Category', 'Document', 'Author', 'goal', 'Votes'],
      ...res.map((x) => [
        x['category_title'],
        x['document_title'],
        x['author_intraId'],
        x['option_goal'],
        +x['voteCnt'],
      ]),
    ];
  }
}
