import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import SearchDocumentDto from './dto/search-document.dto';
import CreateDocumentDto from './dto/create-document.dto';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';
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

  async searchDoc(searchCriteria: SearchDocumentDto, user: any) {
    let documents: Document[] = [];

    if (searchCriteria.myPost === 'true') {
      documents = await this.DocRepo.find({
        relations: {
          author: true,
          votes: true,
          option: true,
        },
        where: {
          author: { intraId: user.intraId },
        },
        order: { id: 'DESC' },
        skip: searchCriteria.listIndex * 5,
        take: searchCriteria.listSize,
      });
    } else if (searchCriteria.myVote === 'true') {
      const votes = await this.VoteRepo.find({
        relations: {
          user: true,
          document: {
            option: true,
            votes: true,
          },
        },
        where: {
          user: { intraId: user.intraId },
        },
        order: { id: 'DESC' },
        skip: searchCriteria.listIndex * 5,
        take: searchCriteria.listSize,
      });
      documents = votes.map((vote) => vote.document);
    } else if (searchCriteria.categoryId !== 0) {
      documents = await this.DocRepo.find({
        relations: {
          category: true,
          option: true,
          votes: true,
        },
        where: { category: { id: searchCriteria.categoryId } },
        order: { id: 'DESC' },
        skip: searchCriteria.listIndex * 5,
        take: searchCriteria.listSize,
      });
    }

    return documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      goal: doc.option.goal,
      voteCnt: doc.votes.length,
      voteExpired: doc.option.voteExpire < new Date(),
    }));
  }

  async detailDoc(documentId: number, user: any) {
    const document = await this.DocRepo.findOne({
      where: { id: documentId },
      relations: {
        author: true,
        votes: true,
        option: true,
        category: true,
      },
    });

    return {
      id: document.id,
      title: document.title,
      content: document.context,
      author: document.author.intraId,
      isAuthor: document.author.intraId === user.intraId,
      categoryId: document.category.id,
      createAt: document.createdAt,
      voteExpiredAt: document.option.voteExpire,
      goal: document.option.goal,
      voteCnt: document.votes.length,
      isVote: false, // need to change
      isVoteExpired: document.option.voteExpire < new Date() ? true : false,
    };
  }

  async createDoc(body: CreateDocumentDto, user) {
    let docOption;
    const timeNow = new Date();
    timeNow.setDate(timeNow.getDate() + 7);
  
    if (body.categoryId === 5 && body.goal) {
      docOption = await this.DocOpRepo.save({
        goal: body.goal,
        voteExpire: new Date(),
        docExpire: timeNow, // set a default value for docExpire
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
      author: { id: user.userId },
      category: { id: body.categoryId }, // set the category relationship
    });

    return this.DocRepo.save(document);
  }

  async deleteDoc(documentId: number) {
    const document = await this.DocRepo.findOne({
      where: { id: documentId },
      relations: ['option', 'category'],
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

  async getDocument(documentId: number) {
    const document = await this.DocRepo.findOne({
      where: { id: documentId },
      relations: ['option', 'category'],
    });
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }
    return document;
  }
}
