import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Vote from 'src/entity/vote.entity';
import Document from 'src/entity/document.entity';
import User from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import SearchVoteDto from './dto/search-vote.dto';

@Injectable()
export class VoteService {
  constructor(@InjectRepository(Vote) private voteRepo: Repository<Vote>) {}

  async deleteVote(vote: Vote) {
    return await this.voteRepo.delete({ id: vote.id });
  }

  async vote(user: User, document: Document) {
    const vote = {
      user,
      document,
    } as Vote;
    return await this.voteRepo.save(vote);
  }

  #getSearchQuery(search: SearchVoteDto) {
    const query = this.voteRepo
      .createQueryBuilder('vote')
      .innerJoin('vote.user', 'user')
      .innerJoin('vote.document', 'document')
      .where('1=1');
    if (search.intraId != null)
      query.andWhere('user.intraId = :intraId', search);
    if (search.documentId != null)
      query.andWhere('document.id = :documentId', search);
    if (search.userId != null) query.andWhere('user.id = :userId', search);
    return query;
  }

  async getVote(search: SearchVoteDto) {
    const query = this.#getSearchQuery(search);
    return await query.getMany();
  }

  async getVoteRich(search: SearchVoteDto) {
    const query = this.#getSearchQuery(search);
    query.setFindOptions({ relations: ['user', 'document'] });
    query.select([
      'vote.id',
      'vote.createdAt',
      'user.id',
      'user.intraId',
      'user.isAdmin',
      'user.email',
      'user.wallet',
      'document.id',
      'document.title',
      'document.createdAt',
    ]);
    return await query.getMany();
  }
}
