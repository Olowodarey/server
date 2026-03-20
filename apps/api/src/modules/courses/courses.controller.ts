import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  NotFoundException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@app/common/decorators/public.decorator";
import { CurrentUser } from "@app/common/decorators/current-user.decorator";
import { User } from "@app/database/entities/user.entity";
import { CoursesService } from "./courses.service";

@ApiTags("courses")
@ApiBearerAuth("JWT")
@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Get all course modules" })
  getCurriculum() {
    return this.coursesService.getCurriculum();
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Get a single course with its lessons" })
  async getCourse(@Param("id", ParseIntPipe) id: number) {
    const course = await this.coursesService.getCourseById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  @Get(":id/progress")
  @ApiOperation({ summary: "Get user's progress for a course" })
  async getCourseProgress(
    @CurrentUser() user: User,
    @Param("id", ParseIntPipe) id: number,
  ) {
    const progress = await this.coursesService.getUserProgress(user.id, id);
    if (!progress) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return progress;
  }

  @Post(":courseId/lessons/:lessonId/steps/:stepId/complete")
  @ApiOperation({ summary: "Mark a lesson step as complete" })
  completeStep(
    @CurrentUser() user: User,
    @Param("courseId", ParseIntPipe) courseId: number,
    @Param("lessonId", ParseIntPipe) lessonId: number,
    @Param("stepId", ParseIntPipe) stepId: number,
  ) {
    return this.coursesService.completeStep(
      user.id,
      courseId,
      lessonId,
      stepId,
    );
  }

  @Get("progress/overall")
  @ApiOperation({
    summary: "Get user's overall progress across all courses",
    description:
      "Returns completion status, percentage, and breakdown by course. Use this to determine if user should be congratulated and can mint certificate.",
  })
  getOverallProgress(@CurrentUser() user: User) {
    return this.coursesService.getOverallProgress(user.id);
  }

  @Get("progress/summary")
  @ApiOperation({
    summary: "Get optimized progress summary for all courses",
    description:
      "Single endpoint that returns progress for all courses in one call. Use this on learning path page and hero widget instead of making multiple requests.",
  })
  getProgressSummary(@CurrentUser() user: User) {
    return this.coursesService.getProgressSummary(user.id);
  }
}
