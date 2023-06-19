import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Vote from 'src/entity/vote.entity';
import VoteLog from 'src/entity/vote-log.entity';
import Document from 'src/entity/document.entity';
import User from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import SearchVoteDto from './dto/search-vote.dto';
import SearchParticipantDto from './dto/search-participant';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote) private voteRepo: Repository<Vote>,
    @InjectRepository(VoteLog) private voteLogRepo: Repository<VoteLog>,
  ) {}

  async deleteVote(vote: Vote) {
    const res = await this.voteRepo.delete({ id: vote.id });
    if (res.affected.valueOf() > 0)
      await this.voteLogRepo.save({
        userId: vote.user.id,
        documentId: vote.document.id,
        state: 0,
      });
    return res;
  }

  async vote(user: User, document: Document) {
    const vote = {
      user,
      document,
    } as Vote;
    const res = await this.voteRepo.save(vote);
    const voteLog = {
      userId: user.id,
      documentId: document.id,
      state: 1,
    };
    await this.voteLogRepo.save(voteLog);
    return res;
  }

  #getSearchQuery(search: SearchVoteDto) {
    const query = this.voteRepo
      .createQueryBuilder('vote')
      .innerJoin('vote.user', 'user')
      .innerJoin('vote.document', 'document')
      .innerJoin('document.category', 'category')
      .where('1=1');
    if (search.intraId != null)
      query.andWhere('user.intraId = :intraId', search);
    if (search.documentId != null)
      query.andWhere('document.id = :documentId', search);
    if (search.userId != null) query.andWhere('user.id = :userId', search);
    if (search.categoryId != null)
      query.andWhere('category.id = :categoryId', search);
    return query;
  }

  async getVote(search: SearchVoteDto) {
    const query = this.#getSearchQuery(search);
    query.select(['vote.id', 'vote.createdAt']);
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
      'category.id',
      'category.title',
      'category.multipleVote',
    ]);
    return await query.getMany();
  }

  async getParticipant(search: SearchParticipantDto) {
    const query = this.voteRepo
      .createQueryBuilder('vote')
      .innerJoin('vote.user', 'voter')
      .innerJoin('vote.document', 'document')
      .innerJoin('document.author', 'author')
      .where('1=1');
    if (search.documentId != null)
      query.andWhere('document.id = :documentId', search);
    if (search.voterIntraId != null)
      query.andWhere('voter.intraId = :voterIntraId', search);
    if (search.authorIntraId != null)
      query.andWhere('author.intraId = :authorIntraId', search);
    query.setFindOptions({ relations: ['user', 'document'] });
    return await query
      .select([
        'vote.id',
        'vote.createdAt',
        'voter.intraId',
        'document.id',
        'author.intraId',
      ])
      .getMany();
  }
}
