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

  async searchDoc(searchCriteria: SearchDocumentDto) {
    const intraId = 'yachoi';
    let documents: Document[] = [];

    if (searchCriteria.myPost === true) {
      documents = await this.DocRepo.find({
        relations: {
          author: true,
          votes: true,
          option: true,
        },
        where: {
          author: { intraId: intraId },
        },
        order: { id: 'DESC' },
      });
    } else if (searchCriteria.myVote === true) {
      const votes = await this.VoteRepo.find({
        relations: {
          user: true,
          document: { option: true },
        },
        where: {
          user: { intraId: intraId },
        },
      });
      documents = votes
        .map((vote) => vote.document)
        .sort((a, b) => b.id - a.id);
    } else if (searchCriteria.categoryId !== 0) {
      documents = await this.DocRepo.find({
        relations: {
          category: true,
          option: true,
          votes: true,
        },
        where: { category: { id: searchCriteria.categoryId } },
        order: { id: 'DESC' },
      });
    }

    documents.slice(
      searchCriteria.listIndex * 5,
      searchCriteria.listIndex * 5 + searchCriteria.listSize,
    );

    return documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      goal: doc.option.goal,
      voteCnt: doc.votes.length,
      voteExpired: doc.option.voteExpire < new Date(),
    }));
  }

  async detailDoc(documentId: number) {
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
      author: 'yachoi', // neet to change
      isAuthor: false, // always bool at the moment(04/19)
      categoryId: document.category.id,
      createAt: document.createdAt,
      voteExpiredAt: document.option.voteExpire,
      goal: document.option.goal,
      voteCnt: document.votes.length,
      isVote: false, // need to change
      isVoteExpired: document.option.voteExpire < new Date() ? true : false,
    };
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
