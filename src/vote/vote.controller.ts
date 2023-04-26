import {
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

@Controller('vote')
export class VoteController {
  constructor(
    readonly voteService: VoteService,
    readonly userService: UserService,
    readonly documentService: DocumentService,
  ) {}

  @Get()
  // TODO: access only admin
  @UseGuards(AuthGuard)
  async getVote(@Req() req, @Query() search: SearchVoteDto) {
    return await this.voteService.getVote({ ...search });
  }

  @Post('me')
  @UseGuards(AuthGuard)
  async postVote(@Req() req, @Body() body: CreateVoteDto) {
    const intraId = req.user.intraId;
    if (intraId == null) throw new InternalServerErrorException();
    const vote = await this.voteService.getVoteRich({
      intraId,
      documentId: body.documentId,
    });
    if (vote.length !== 0) return;
    const user = await this.userService.getUser(intraId);
    const document = await this.documentService.getDocument(body.documentId);
    await this.voteService.vote(user, document);
  }

  @Delete('me')
  @UseGuards(AuthGuard)
  async deleteVoteMe(@Req() req, @Body() body: DeleteVoteDto) {
    const intraId = req.user.intraId;
    if (intraId == null) throw new InternalServerErrorException();
    const vote = await this.voteService.getVoteRich({
      intraId,
      documentId: body.documentId,
    });
    if (vote.length === 0) return;
    if (vote[0].user?.intraId !== intraId) throw new ForbiddenException();
    await this.voteService.deleteVote(vote[0]);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getVoteMe(@Req() req, @Query() search: SearchVoteDto) {
    const intraId = req.user.intraId;
    if (intraId == null) throw new InternalServerErrorException();
    return await this.voteService.getVote({ ...search, intraId });
  }
}
