import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from 'src/entity/user.entity';
import Vote from 'src/entity/vote.entity';
import Document from 'src/entity/document.entity';
import Category from 'src/entity/category.entity';
import SearchStatVoteDto from './dto/search-stat-vote.dto';

@Injectable()
export class StatService {
  constructor(@InjectRepository(Vote) private voteRepo: Repository<Vote>) {}

  #getSearchQuery(search: SearchStatVoteDto) {
    const query = this.voteRepo
      .createQueryBuilder('vote')
      .innerJoin('vote.user', 'user')
      .innerJoin('vote.document', 'document')
      .innerJoin('document.category', 'category')
      .innerJoin('document.author', 'author')
      .where('1=1');
    if (search.categoryId != null)
      query.andWhere('category.id = :categoryId', search);
    return query;
  }

  async getVoteRich(search: SearchStatVoteDto): Promise<any[][]> {
    const query = this.#getSearchQuery(search);
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
}
