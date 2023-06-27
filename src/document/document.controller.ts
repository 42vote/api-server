import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import UpdateDocumentDto from './dto/update-document.dto';

@Controller('document')
@UseGuards(AuthGuard)
export class DocumentController {
  constructor(readonly documentService: DocumentService) {}

  @Get()
  searchDocument(@Query() searchDto: SearchDocumentDto, @Req() token: Request) {
    return this.documentService.searchDocument(searchDto, token['user']);
  }

  @Get(':document_id')
  detailDocument(
    @Param('document_id') documentId: number,
    @Req() token: Request,
  ) {
    return this.documentService.detailDocument(documentId, token['user']);
  }

  @Post()
  creatDocument(@Body() body: CreateDocumentDto, @Req() req: Request) {
    return this.documentService.createDocument(body, req['user']);
  }

  @Patch(':document_id')
  updateDocument(
    @Param('document_id') documentId: number,
    @Body() body: UpdateDocumentDto,
    @Req() req: Request,
  ) {
    return this.documentService.updateDocument(documentId, body, req['user']);
  }

  @Delete(':document_id')
  deleteDocument(@Param('document_id') documentId: number) {
    return this.documentService.deleteDocument(documentId);
  }
}
