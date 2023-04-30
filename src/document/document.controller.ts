import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import CreateDocumentDto from './dto/create-document.dto';
import SearchDocumentDto from './dto/search-document.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { isNumberString } from 'class-validator';

@Controller('document')
@UseGuards(AuthGuard)
export class DocumentController {
  constructor(readonly docService: DocumentService) {}

  @Get()
  searchDocument(
    @Query(
      new ValidationPipe({ exceptionFactory: () => new BadRequestException() }),
    )
    searchDto: SearchDocumentDto,
    @Req() token: Request,
  ) {
    return this.docService.searchDoc(searchDto, token['user']);
  }

  @Get(':document_id')
  detailDocument(
    @Param('document_id') documentId: number,
    @Req() token: Request,
  ) {
    return this.docService.detailDoc(documentId, token['user']);
  }

  @Post()
  creatDocument(@Body() body: CreateDocumentDto, @Req() req: Request) {
    console.log("here");
    console.log(body);
    console.log(typeof body.title);
    console.log(typeof body.context);
    console.log(typeof body.categoryId);

    return this.docService.createDoc(body, req['user']);
  }

  @Delete(':document_id')
  deleteDocument(@Param('document_id') documentId: number) {
    return this.docService.deleteDoc(documentId);
  }
}
