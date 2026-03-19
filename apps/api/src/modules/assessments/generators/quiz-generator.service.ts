import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { QuizFormatDto } from "../dto/generate-quiz.dto";
import { GeneratedQuiz, Question, QuestionType } from "../types/question.types";
import { PromptBuilderService } from "./prompt-builder.service";

/**
 * Service responsible for generating quizzes using AI
 */
@Injectable()
export class QuizGeneratorService {
  private readonly logger = new Logger(QuizGeneratorService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Generate a quiz using AI based on the provided parameters
   */
  async generateQuiz(
    topic: string,
    format: QuizFormatDto,
    includeAdvanced: boolean,
  ): Promise<GeneratedQuiz> {
    const prompt = this.promptBuilder.buildGenerationPrompt(
      topic,
      format,
      includeAdvanced,
    );

    this.logger.debug(`Generating quiz for topic: ${topic}, format: ${format}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          "https://api.anthropic.com/v1/messages",
          {
            model: this.config.get("anthropic.model"),
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: {
              "content-type": "application/json",
              "x-api-key": this.config.get("anthropic.apiKey"),
              "anthropic-version": "2023-06-01",
            },
            timeout: 120000,
          },
        ),
      );

      const rawText = response.data.content[0].text;
      const questions = this.parseQuestions(rawText);

      this.validateQuestions(questions, format);

      // Shuffle multiple-choice options to ensure randomization
      const shuffledQuestions = this.shuffleMultipleChoiceOptions(questions);

      // Log answers in development mode
      if (process.env.NODE_ENV === "development") {
        this.logAnswersForDev(shuffledQuestions, topic);
      }

      return { questions: shuffledQuestions };
    } catch (error) {
      this.logger.error("Failed to generate quiz", error);
      throw new Error(`Quiz generation failed: ${error.message}`);
    }
  }

  /**
   * Parse and clean the AI response to extract questions
   */
  private parseQuestions(rawText: string): Question[] {
    // Remove markdown code blocks if present
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    }

    try {
      const parsed = JSON.parse(cleanedText);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      this.logger.error("Failed to parse AI response", error);
      throw new Error("Failed to generate valid quiz questions");
    }
  }

  /**
   * Validate that generated questions match the expected format
   */
  private validateQuestions(
    questions: Question[],
    format: QuizFormatDto,
  ): void {
    if (!questions || questions.length === 0) {
      throw new Error("No questions were generated");
    }

    for (const question of questions) {
      // Validate common fields
      if (!question.id || !question.type || !question.question) {
        throw new Error("Question missing required fields");
      }

      // Validate type-specific fields
      if (question.type === QuestionType.MULTIPLE_CHOICE) {
        if (
          !question.options ||
          question.options.length !== 4 ||
          !question.correctOptionId
        ) {
          throw new Error("Invalid multiple-choice question structure");
        }
      } else if (question.type === QuestionType.OPEN_ENDED) {
        if (!question.modelAnswer) {
          throw new Error("Open-ended question missing model answer");
        }
      }
    }

    // Validate format consistency
    const hasMultipleChoice = questions.some(
      (q) => q.type === QuestionType.MULTIPLE_CHOICE,
    );
    const hasOpenEnded = questions.some(
      (q) => q.type === QuestionType.OPEN_ENDED,
    );

    if (format === QuizFormatDto.MULTI_CHOICE && !hasMultipleChoice) {
      throw new Error(
        "Expected multiple-choice questions but none were generated",
      );
    }

    if (format === QuizFormatDto.OPEN_ENDED && !hasOpenEnded) {
      throw new Error("Expected open-ended questions but none were generated");
    }

    if (
      format === QuizFormatDto.MIXED &&
      (!hasMultipleChoice || !hasOpenEnded)
    ) {
      throw new Error("Mixed format requires both question types");
    }

    this.logger.debug(
      `Validated ${questions.length} questions (${questions.filter((q) => q.type === QuestionType.MULTIPLE_CHOICE).length} MC, ${questions.filter((q) => q.type === QuestionType.OPEN_ENDED).length} OE)`,
    );
  }

  /**
   * Shuffle multiple-choice options to randomize correct answer position
   * In development mode, always sets correct answer to 'a' for easier testing
   */
  private shuffleMultipleChoiceOptions(questions: Question[]): Question[] {
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      this.logger.debug("DEV MODE: Setting all correct answers to option A");
    }

    return questions.map((question) => {
      if (question.type !== QuestionType.MULTIPLE_CHOICE) {
        return question;
      }

      const mcQuestion = question as any;

      // In development mode, ensure correct answer is always 'a'
      if (isDevelopment) {
        const correctOption = mcQuestion.options.find(
          (opt: any) => opt.id === mcQuestion.correctOptionId,
        );

        // Remove correct option from array
        const otherOptions = mcQuestion.options.filter(
          (opt: any) => opt.id !== mcQuestion.correctOptionId,
        );

        // Place correct option first, then others
        const reorderedOptions = [correctOption, ...otherOptions].map(
          (opt: any, index: number) => ({
            ...opt,
            id: ["a", "b", "c", "d"][index],
          }),
        );

        return {
          ...mcQuestion,
          options: reorderedOptions,
          correctOptionId: "a",
        };
      }

      // Production mode: shuffle normally
      const options = [...mcQuestion.options];

      // Fisher-Yates shuffle algorithm
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      // Reassign IDs based on new positions
      const correctOption = mcQuestion.options.find(
        (opt: any) => opt.id === mcQuestion.correctOptionId,
      );

      const shuffledOptions = options.map((opt: any, index: number) => ({
        ...opt,
        id: ["a", "b", "c", "d"][index],
      }));

      const newCorrectId = shuffledOptions.find(
        (opt: any) => opt.text === correctOption.text,
      )?.id;

      return {
        ...mcQuestion,
        options: shuffledOptions,
        correctOptionId: newCorrectId,
      };
    });
  }

  /**
   * Log correct answers in development mode for easier testing
   */
  private logAnswersForDev(questions: Question[], topic: string): void {
    this.logger.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    );
    this.logger.log(`📝 DEV MODE: Quiz Answers for "${topic}"`);
    this.logger.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    );

    questions.forEach((question, index) => {
      if (question.type === QuestionType.MULTIPLE_CHOICE) {
        const mcQuestion = question as any;
        this.logger.log(
          `\nQ${index + 1} [Multiple Choice]: ${question.question.substring(0, 80)}...`,
        );
        this.logger.log(
          `   ✅ Correct Answer: ${mcQuestion.correctOptionId.toUpperCase()}`,
        );

        // Show all options
        mcQuestion.options.forEach((opt: any) => {
          const marker = opt.id === mcQuestion.correctOptionId ? "✅" : "  ";
          this.logger.log(
            `   ${marker} ${opt.id.toUpperCase()}. ${opt.text.substring(0, 60)}...`,
          );
        });
      } else {
        const oeQuestion = question as any;
        this.logger.log(
          `\nQ${index + 1} [Open-Ended]: ${question.question.substring(0, 80)}...`,
        );
        this.logger.log(
          `   💡 Model Answer: ${oeQuestion.modelAnswer.substring(0, 100)}...`,
        );
      }
    });

    this.logger.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    );
    this.logger.log(
      "💡 TIP: In dev mode, all multiple-choice answers are option A",
    );
    this.logger.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
    );
  }
}
