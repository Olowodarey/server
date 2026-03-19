import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { User } from '@app/database/entities/user.entity';
import { AiTutorService } from './ai-tutor.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { GeneratePracticeQuizDto } from './dto/practice-quiz.dto';
import { SubmitPracticeAnswerDto } from './dto/submit-practice-answer.dto';

@ApiTags('ai-tutor')
@ApiBearerAuth('JWT')
@Controller('ai-tutor')
export class AiTutorController {
  constructor(private readonly aiTutorService: AiTutorService) { }

  @Post('chat')
  @ApiOperation({ summary: 'Send a message to the context-aware AI tutor' })
  chat(@CurrentUser() user: User, @Body() dto: ChatMessageDto) {
    return this.aiTutorService.chat(user, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List all AI tutor chat sessions' })
  getSessions(@CurrentUser() user: User) {
    return this.aiTutorService.getSessions(user.id);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a single session with full message history' })
  getSession(@CurrentUser() user: User, @Param('id') id: string) {
    return this.aiTutorService.getSession(user.id, id);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Delete a chat session' })
  deleteSession(@CurrentUser() user: User, @Param('id') id: string) {
    return this.aiTutorService.deleteSession(user.id, id);
  }

  @Public()
  @Post('practice/generate')
  @ApiOperation({
    summary: 'Generate practice quiz questions (no XP, no progress tracking)',
    description: 'Generate random practice questions for any module or general knowledge. No rewards or tracking.'
  })
  generatePracticeQuiz(@Body() dto: GeneratePracticeQuizDto) {
    return this.aiTutorService.generatePracticeQuiz(dto);
  }

  @Public()
  @Post('practice/check')
  @ApiOperation({
    summary: 'Check practice answer and get feedback (no XP, no progress tracking)',
    description: 'Submit an answer to a practice question and receive feedback without affecting progress.'
  })
  checkPracticeAnswer(@Body() dto: SubmitPracticeAnswerDto) {
    return this.aiTutorService.checkPracticeAnswer(dto);
  }
}
