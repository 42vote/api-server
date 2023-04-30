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
  creatDocument(@Body() body: any, @Req() req: Request) {

    return this.docService.createDoc(body, req['user']);
  }

  @Delete(':document_id')
  deleteDocument(@Param('document_id') documentId: number) {
    return this.docService.deleteDoc(documentId);
  }
}
