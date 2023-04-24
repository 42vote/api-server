import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { DocumentService } from './document.service';
import CreateDocumentDto from './dto/create-document.dto';
import SearchDocumentDto from './dto/search-document.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('document')
// @UseGuards(AuthGuard)
export class DocumentController {
  constructor(readonly docService: DocumentService) {}

  @Get()
  searchDocument(@Body() body: SearchDocumentDto) {
    return this.docService.searchDoc(body);
  }

  @Get(':document_id')
  detailDocument(@Param('document_id') documentId: number, @Req() req: Request) {
    return this.docService.detailDoc(documentId);
  }

  @Post()
  // creatDocument(@Body() body: CreateDocumentDto, @Req() req: Requeust ) {
  creatDocument(@Body() body: CreateDocumentDto) {
    const token = {
      intraId: "yachoi",
      isAdmin: false,
      wallet: 10,
    };
    return this.docService.createDoc(body, token);
    // return this.docService.createDoc(body, req);
  }

  @Delete(':document_id')
  deleteDocument(@Param('document_id') documentId: number) {
    return this.docService.deleteDoc(documentId);
  }
}
