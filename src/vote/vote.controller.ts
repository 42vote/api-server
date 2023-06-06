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
import { AuthAdminGuard } from 'src/auth/auth-admin.guard';
import SearchParticipantDto from './dto/search-participant';

@Controller('vote')
export class VoteController {
  constructor(
    readonly voteService: VoteService,
    readonly userService: UserService,
    readonly documentService: DocumentService,
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
    const searchVoteDto = {
      intraId,
      documentId: body.documentId,
    };
    const vote = await this.voteService.getVoteRich(searchVoteDto);
    if (vote.length !== 0) return;
    const user = await this.userService.getUser(intraId);
    const document = await this.documentService.getDocument(body.documentId);
    await this.voteService.vote(user, document);
    const votes = await this.voteService.getVote(searchVoteDto);
    for (let i = 1; i < votes.length; i++) {
      this.voteService.deleteVote(votes[i]);
    }
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
}
