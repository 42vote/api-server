import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { DocumentService } from 'src/document/document.service';
import { UserService } from 'src/user/user.service';
import CreateVoteDto from './dto/create-vote.dto';
import DeleteVoteDto from './dto/delete-vote.dto';
import SearchVoteDto from './dto/search-vote.dto';
import { VoteService } from './vote.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthAdminGuard } from 'src/auth/auth-admin.guard';
import SearchParticipantDto from './dto/search-participant';
import { CategoryService } from 'src/category/category.service';

@Controller('vote')
export class VoteController {
  constructor(
    readonly voteService: VoteService,
    readonly userService: UserService,
    readonly documentService: DocumentService,
    readonly categoryService: CategoryService,
  ) {}

  @Get()
  @UseGuards(AuthAdminGuard)
  async getVote(@Query() search: SearchVoteDto) {
    return await this.voteService.getVoteRich({ ...search });
  }

  @Get('participant')
  @UseGuards(AuthGuard)
  async getVotePatricipant(@Req() req, @Query() search: SearchParticipantDto) {
    const intraId = req.user?.intraId;
    if (intraId == null) throw new InternalServerErrorException();
    return await this.voteService.getParticipant({
      ...search,
      authorIntraId: intraId,
    });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getVoteMe(@Req() req, @Query() search: SearchVoteDto) {
    const intraId = req.user?.intraId;
    if (intraId == null) throw new InternalServerErrorException();
    return await this.voteService.getVote({ ...search, intraId });
  }

  @Post('me')
  @UseGuards(AuthGuard)
  async postVote(@Req() req, @Body() body: CreateVoteDto) {
    const intraId = req.user.intraId;
    if (intraId == null) throw new InternalServerErrorException();
    const document = await this.documentService.getDocument(body.documentId);
    if (document == null)
      throw new BadRequestException('document is not found');
    const now = Date.now();
    const isDocVoteExpired =
      new Date(document.option.voteExpire).getTime() < now ||
      new Date(document.option.docExpire).getTime() < now;
    if (isDocVoteExpired) throw new BadRequestException('document is expired');
    const user = await this.userService.getUser(intraId);
    if (user == null) throw new BadRequestException('user dead');
    const searchVoteDto = {
      intraId,
      documentId: body.documentId,
    };
    const vote = await this.voteService.getVoteRich(searchVoteDto);
    if (vote.length !== 0) throw new BadRequestException('double request');
    if (document.category.multipleVote) {
      await this.voteService.vote(user, document);
      const duplicatedVotes = await this.voteService.getVote(searchVoteDto);
      for (let i = 1; i < duplicatedVotes.length; i++)
        this.voteService.deleteVote(duplicatedVotes[i]);
    } else {
      const searchCategoryVoteDto = {
        intraId,
        categoryId: document.category.id,
      };
      const categoryVotes = await this.voteService.getVoteRich(
        searchCategoryVoteDto,
      );
      if (
        categoryVotes.length !== 0 &&
        categoryVotes[0].document.id == document.id
      )
        throw new BadRequestException('double request');
      for (let i = 0; i < categoryVotes.length; i++)
        this.voteService.deleteVote(categoryVotes[i]);

      await this.voteService.vote(user, document);
      const duplicatedVotes = await this.voteService.getVote(
        searchCategoryVoteDto,
      );
      for (let i = 1; i < duplicatedVotes.length; i++)
        this.voteService.deleteVote(duplicatedVotes[i]);
    }
  }

  @Delete('me')
  @UseGuards(AuthGuard)
  async deleteVoteMe(@Req() req, @Body() body: DeleteVoteDto) {
    const intraId = req.user.intraId;
    if (intraId == null) throw new InternalServerErrorException();
    const document = await this.documentService.getDocument(body.documentId);
    if (document == null)
      throw new BadRequestException('document is not found');
    const now = Date.now();
    const isDocVoteExpired =
      new Date(document.option.voteExpire).getTime() < now;
    if (isDocVoteExpired) throw new BadRequestException('document is expired');
    const user = await this.userService.getUser(intraId);
    if (user == null) throw new BadRequestException('user dead');
    const searchVoteDto = {
      intraId,
      documentId: body.documentId,
    };
    const vote = await this.voteService.getVoteRich(searchVoteDto);
    if (vote.length === 0) return;
    if (vote[0].user?.intraId !== intraId) throw new ForbiddenException();
    await this.voteService.deleteVote(vote[0]);
  }
}
