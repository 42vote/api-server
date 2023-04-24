import { Injectable, NotFoundException } from '@nestjs/common';
import SearchDocumentDto from './dto/search-document.dto';
import CreateDocumentDto from './dto/create-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';
import { Repository } from 'typeorm';
import Document from 'src/entity/document.entity';
import Vote from 'src/entity/vote.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Category)
    private CatRepo: Repository<Category>,
    @InjectRepository(DocOption)
    private DocOpRepo: Repository<DocOption>,
    @InjectRepository(Document)
    private DocRepo: Repository<Document>,
    @InjectRepository(Vote)
    private VoteRepo: Repository<Vote>,
  ) {}

  async searchDoc(body: SearchDocumentDto) {
    const categoryId = body.categoryId;
    const listSize = body.listSize || 5; // default to 5 if listSize is not provided
    const listIndex = body.listIndex;

    const query = this.DocRepo.createQueryBuilder('document')
      .select('document.id', 'id')
      .addSelect('document.title', 'title')
      .addSelect('COUNT(vote.id)', 'voteCnt')
      .leftJoin('document.votes', 'vote', 'vote.documentId = document.id')
      .where('document.category = :categoryId', { categoryId })
      .groupBy('document.id')
      .orderBy('document.id', 'DESC')
      .skip(listIndex * 5)
      .take(listSize);

    const documents = await query.getRawMany();

    return documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      voteCnt: doc.voteCnt,
    }));
  }

  async detailDoc(documentId: number) {
	const document = await this.DocRepo.findOne({
		where: {id: documentId},
		relations: ['votes', 'option','category'],
	})
	// .createQueryBuilder('document')
	// // .leftJoin('document.author', 'author')
	// .leftJoin('document.option', 'option')
	// .leftJoin('option.category', 'category')
	// .leftJoin('document.votes', 'vote')
	// .select([
	//   'document.id',
	//   'document.title',
	//   'document.context',
	// //   'author.name',
	// //   'author.intraId',
	//   'category.id',
	//   'document.createdAt',
	//   'option.voteExpire',
	//   'option.goal',
	//   'COUNT(DISTINCT vote.user) AS voteCnt',
	//   `MAX(CASE WHEN vote.document.id = ${documentId} THEN 1 ELSE 0 END) AS isVote`,
	//   'MAX(option.voteExpire) < NOW() AS isVoteExpired',
	// ])
	// .where('document.id = :id', { id: documentId })
	// .groupBy('document.id')
	// .getRawOne();


	return {
			id: document.id,
			title : document.title,
			content : document.context,
			author : "yachoi", // neet to change
			isAuthor : false, // always bool at the moment(04/19)
			categoryId: document.category.id,
			createAt : document.createdAt,
			voteExpiredAt : document.option.voteExpire,
			// goal : document.option.goal,
			// voteCnt : document.votes.length,
			isVote : false, // need to change
			// isVoteExpired : document.option.voteExpire < new Date() ? true : false,
	}
  }

  async createDoc(body: CreateDocumentDto, token) {
    let docOption;
	const docExpire = new Date(body.voteExpire);
	docExpire.setDate(docExpire.getDate() + 7);

    if (body.goal && body.voteExpire) {
      docOption = await this.DocOpRepo.save({
        goal: body.goal,
        voteExpire: body.voteExpire,
        docExpire: docExpire, // set a default value for docExpire
        category: { id: body.categoryId }, // set the category relationship
      });
    } else {
      docOption = await this.DocOpRepo.findOne({
        where: { category: { id: body.categoryId } },
      });
    }

    const document = this.DocRepo.create({
      ...body,
      option: docOption,
	//   author: { id: token.intraId },
      category: { id: body.categoryId }, // set the category relationship
    });

    return this.DocRepo.save(document);
  }

  async deleteDoc(documentId: number) {
    const document = await this.DocRepo.findOne({
		where: {id: documentId}, 
		relations: ['option','category'],
	});
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

	// delete docOption if category is "goods or 5"
    // if (document.category.id === 5) { 
	//   await this.DocOpRepo.remove(document.option);
	// }

    return await this.DocRepo.remove(document);
	// return document;
  }
}
