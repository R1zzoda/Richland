import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WordsService } from './words.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { AnswerWordDto } from './dto/answer-word.dto';

@Controller('words')
@UseGuards(JwtAuthGuard)
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateWordDto) {
    return this.wordsService.create(req.user.id, dto);
  }

  @Get('dictionary/:id')
  getByDictionary(@Param('id') id: number) {
    return this.wordsService.getByDictionary(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateWordDto) {
    return this.wordsService.update(Number(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.wordsService.delete(Number(id));
  }

  @Get('due')
  getDueWords(@Req() req) {
    return this.wordsService.getDueWords(req.user.id);
  }

  // ответ на слово — обязательно передаём sessionId в теле
  @Post(':id/answer')
  answerWord(
    @Param('id') id: number,
    @Body() dto: AnswerWordDto,
    @Req() req: any,
  ) {
    return this.wordsService.answerWord(
      Number(id),
      dto.correct,
      req.user.id,
      dto.sessionId,
    );
  }
}
