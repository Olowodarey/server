import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

import { QuizSession, QuizFormat } from '@app/database/entities/quiz-session.entity';
import { User } from '@app/database/entities/user.entity';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { AiGraderService } from './grader/ai-grader.service';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

const FREE_DAILY_LIMIT = 2;

@Injectable()
export class AssessmentsService {
  private readonly anthropic: Anthropic;

  constructor(
    @InjectRepository(QuizSession)
    private readonly quizRepo: Repository<QuizSession>,
    private readonly graderService: AiGraderService,
    private readonly config: ConfigService,
  ) {
    this.anthropic = new Anthropic({ apiKey: this.config.get('anthropic.apiKey') });
  }

  async generateQuiz(user: User, dto: GenerateQuizDto): Promise<QuizSession> {
    await this.checkQuota(user);

    const prompt = this.buildGenerationPrompt(dto);
    const response = await this.anthropic.messages.create({
      model: this.config.get('anthropic.model'),
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const questions = JSON.parse(
      (response.content[0] as Anthropic.TextBlock).text,
    );

    const session = this.quizRepo.create({
      userId: user.id,
      topic: dto.topic,
      format: dto.format as unknown as QuizFormat,
      includeAdvanced: dto.includeAdvanced ?? false,
      questions,
    });

    return this.quizRepo.save(session);
  }

  async submitAnswers(user: User, sessionId: string, dto: SubmitAnswersDto) {
    const session = await this.quizRepo.findOne({
      where: { id: sessionId, userId: user.id },
    });
    if (!session) throw new NotFoundException('Quiz session not found');

    const { score, feedback } = await this.graderService.grade(session, dto.answers);
    session.score = score;
    session.gradedAt = new Date();
    await this.quizRepo.save(session);

    return { sessionId, score, feedback };
  }

  async getHistory(userId: string) {
    return this.quizRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async getQuota(user: User) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await this.quizRepo.count({
      where: { userId: user.id, createdAt: MoreThan(today) },
    });
    const limit = user.isPro ? Infinity : FREE_DAILY_LIMIT;
    return { used: count, limit, remaining: Math.max(0, limit - count) };
  }

  private async checkQuota(user: User) {
    if (user.isPro) return;
    const { used, limit } = await this.getQuota(user);
    if (used >= limit) {
      throw new ForbiddenException(
        `Daily quiz limit of ${limit} reached. Upgrade to Pro for unlimited quizzes.`,
      );
    }
  }

  private buildGenerationPrompt(dto: GenerateQuizDto): string {
    const formatInstructions = {
      multi_choice: 'Each question must have 4 options (a, b, c, d) and a single correct answer.',
      open_ended: 'Each question must be open-ended. Include a model answer for grading.',
      mixed: 'Mix multi-choice and open-ended questions equally.',
    };

    return `You are a Stacks/Bitcoin L2 quiz generator.
Generate a quiz with 5 questions about: "${dto.topic}".
Format: ${dto.format}. ${formatInstructions[dto.format]}
${dto.includeAdvanced ? 'Make the questions advanced and challenging.' : 'Keep questions beginner-friendly.'}

Return ONLY a valid JSON array. Do not include any other text or markdown.
JSON format: [{ "question": string, "type": "multi_choice"|"open_ended", "options"?: string[], "correctAnswer": string, "explanation": string }]`;
  }
}
