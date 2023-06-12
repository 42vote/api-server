import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import SearchDocumentDto from './dto/search-document.dto';
import CreateDocumentDto from './dto/create-document.dto';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';
import Document from 'src/entity/document.entity';
import Vote from 'src/entity/vote.entity';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { VoteService } from 'src/vote/vote.service';
import SearchVoteDto from 'src/vote/dto/search-vote.dto';
import Image from 'src/entity/image.entity';
import { doc } from 'prettier';

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
    @InjectRepository(Image)
    private ImageRepo: Repository<Image>,
    private imageService: AwsS3Service,
    private voteService: VoteService,
  ) {}

  async searchDocument(searchCriteria: SearchDocumentDto, user: any) {
    let documents: Document[] = [];

    if (searchCriteria.myPost === 'true') {
      documents = await this.DocRepo.find({
        relations: {
          author: true,
          votes: true,
          option: true,
          images: true,
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
            images: true,
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
          images: true,
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
      image: doc.images[0] ? doc.images[0].directory : null,
    }));
  }

  async detailDocument(documentId: number, user: any) {
    const document = await this.DocRepo.findOne({
      where: { id: documentId },
      relations: {
        author: true,
        votes: true,
        option: true,
        category: true,
        images: true,
      },
    });
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }
    // await new Promie(resolve => setTimeout(resolve, 10000));

    return {
      id: document.id,
      title: document.title,
      content: document.context,
      author: document.author.intraId,
      isAuthor: document.author.id === user.userId,
      categoryId: document.category.id,
      createAt: document.createdAt,
      voteExpiredAt: document.option.voteExpire,
      goal: document.option.goal,
      voteCnt: document.votes.length,
      isVote:
        (
          await this.voteService.getVote({
            documentId: documentId,
            userId: user.userId,
          })
        ).length !== 0, // need to change
      isVoteExpired: document.option.voteExpire < new Date() ? true : false,
      image: document.images.map((image) => image.directory),
    };
  }

  async createDocument(body: CreateDocumentDto, user) {
    let docOption;

    const voteTime = new Date();
    const docTime = new Date();
    voteTime.setDate(voteTime.getDate() + 30);
    docTime.setDate(docTime.getDate() + 37);

    if (body.categoryId === 5 && body.goal) {
      docOption = await this.DocOpRepo.save({
        goal: body.goal,
        voteExpire: voteTime,
        docExpire: docTime, // set a default value for docExpire
        category: { id: body.categoryId }, // set the category relationship
      });
    } else {
      docOption = await this.DocOpRepo.findOne({
        where: { category: { id: body.categoryId } },
      });
    }

    const document = this.DocRepo.create({
      title: body.title,
      context: body.context,
      option: docOption,
      author: { id: user.userId },
      category: { id: body.categoryId }, // set the category relationship
    });

    const saveDoc = await this.DocRepo.save(document);

    const images = body.image;
    for (let i = 0; i < images.length; i++) {
      const filename = `${saveDoc.id}/image_${i}`;
      const directory = await this.imageService.uploadOne(filename, images[i]);
      if (directory) {
        const image = this.ImageRepo.create({
          document: saveDoc,
          directory: directory,
          filename: `image_${i}`,
        });
        await this.ImageRepo.save(image);
      }
    }
    return document;
  }

  async deleteDocument(documentId: number) {
    const document = await this.DocRepo.findOne({
      where: { id: documentId },
      relations: ['option', 'category', 'images'],
    });
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }
    await this.ImageRepo.remove(document.images);
    await this.DocRepo.remove(document);
    // delete docOption if category is "goods or 5"
    if (document.category.id === 5) {
      const customOption = document.option;
      await this.DocOpRepo.remove(customOption);
    }
    return;
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
