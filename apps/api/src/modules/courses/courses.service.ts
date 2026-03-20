import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  UserProgress,
  StepState,
} from "@app/database/entities/user-progress.entity";

/**
 * Course curriculum is defined statically here (or loaded from a seed/config).
 * This avoids a separate courses table while keeping data in one place.
 * In future, this can be migrated to a CMS-backed DB table.
 */
const CURRICULUM = [
  {
    id: 1,
    title: "Bitcoin Fundamentals",
    description: "Understand the core principles of Bitcoin.",
    lessons: [
      {
        id: 1,
        title: "Bitcoin 101",
        steps: [
          { id: 1, title: "What is Bitcoin?" },
          { id: 2, title: "History" },
        ],
      },
      {
        id: 2,
        title: "The Bitcoin Network",
        steps: [
          { id: 1, title: "Nodes" },
          { id: 2, title: "Miners" },
        ],
      },
      {
        id: 3,
        title: "Proof of Work",
        steps: [{ id: 1, title: "PoW Explained" }],
      },
      {
        id: 4,
        title: "Wallets & Nodes",
        steps: [{ id: 1, title: "Key Management" }],
      },
    ],
  },
  {
    id: 2,
    title: "Introduction to Stacks",
    description: "Explore the Stacks L2 ecosystem.",
    lessons: [
      {
        id: 1,
        title: "Basics of Stacks",
        steps: [{ id: 1, title: "What is Stacks?" }],
      },
      {
        id: 2,
        title: "Proof of Transfer (PoX)",
        steps: [{ id: 1, title: "PoX Mechanics" }],
      },
      {
        id: 3,
        title: "sBTC Overview",
        steps: [{ id: 1, title: "sBTC Bridge" }],
      },
      {
        id: 4,
        title: "Stacks Architecture",
        steps: [{ id: 1, title: "Microblocks" }],
      },
    ],
  },
  {
    id: 3,
    title: "Clarity Smart Contracts",
    description: "Write smart contracts using the Clarity language.",
    lessons: [
      {
        id: 1,
        title: "Clarity Syntax",
        steps: [
          { id: 1, title: "Types" },
          { id: 2, title: "Functions" },
        ],
      },
      {
        id: 2,
        title: "Built-in Functions",
        steps: [{ id: 1, title: "STX Functions" }],
      },
      {
        id: 3,
        title: "Deploying Contracts",
        steps: [{ id: 1, title: "testnet deploy" }],
      },
    ],
  },
  {
    id: 4,
    title: "Advanced Smart Contract Patterns",
    description: "Master advanced Clarity concepts.",
    lessons: [
      { id: 1, title: "Advanced Methods", steps: [{ id: 1, title: "Traits" }] },
      {
        id: 2,
        title: "Security Best Practices",
        steps: [{ id: 1, title: "Audits" }],
      },
      {
        id: 3,
        title: "DeFi Implementations",
        steps: [{ id: 1, title: "AMMs" }],
      },
      {
        id: 4,
        title: "Performance Profiling",
        steps: [{ id: 1, title: "Gas" }],
      },
    ],
  },
];

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(UserProgress)
    private readonly progressRepo: Repository<UserProgress>,
  ) {}

  getCurriculum() {
    return CURRICULUM;
  }

  /**
   * Calculate total steps across all courses in the curriculum
   */
  getTotalStepsInCurriculum(): number {
    return CURRICULUM.reduce((total, course) => {
      return (
        total +
        course.lessons.reduce((lessonTotal, lesson) => {
          return lessonTotal + lesson.steps.length;
        }, 0)
      );
    }, 0);
  }

  getCourseById(courseId: number) {
    return CURRICULUM.find((c) => c.id === courseId) ?? null;
  }

  async getUserProgress(userId: string, courseId: number) {
    const progressRecords = await this.progressRepo.find({
      where: { userId, courseId },
    });

    const course = this.getCourseById(courseId);
    if (!course) return null;

    const lessons = course.lessons.map((lesson) => ({
      ...lesson,
      steps: lesson.steps.map((step) => {
        const record = progressRecords.find(
          (p) => p.lessonId === lesson.id && p.stepId === step.id,
        );
        return { ...step, state: record?.state ?? StepState.LOCKED };
      }),
    }));

    const totalSteps = course.lessons.reduce(
      (acc, l) => acc + l.steps.length,
      0,
    );
    const completedSteps = progressRecords.filter(
      (p) => p.state === StepState.COMPLETED,
    ).length;

    return {
      lessons,
      totalSteps,
      completedSteps,
      progressPercentage:
        totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
    };
  }

  async completeStep(
    userId: string,
    courseId: number,
    lessonId: number,
    stepId: number,
  ) {
    let record = await this.progressRepo.findOne({
      where: { userId, courseId, lessonId, stepId },
    });

    if (!record) {
      record = this.progressRepo.create({ userId, courseId, lessonId, stepId });
    }

    // Only update if not already completed
    const wasAlreadyCompleted = record.state === StepState.COMPLETED;
    record.state = StepState.COMPLETED;
    record.completedAt = new Date();
    await this.progressRepo.save(record);

    // Check if entire curriculum is now complete
    const overallProgress = await this.getOverallProgress(userId);

    return {
      ...record,
      curriculumComplete: overallProgress.isComplete,
      overallProgressPercentage: overallProgress.progressPercentage,
      justCompleted: !wasAlreadyCompleted,
    };
  }

  /**
   * Get user's overall progress across all courses
   */
  async getOverallProgress(userId: string) {
    const totalSteps = this.getTotalStepsInCurriculum();

    const completedSteps = await this.progressRepo.count({
      where: { userId, state: StepState.COMPLETED },
    });

    const progressPercentage =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    const isComplete = progressPercentage === 100;

    // Get progress breakdown by course
    const courseProgress = await Promise.all(
      CURRICULUM.map(async (course) => {
        const courseCompletedSteps = await this.progressRepo.count({
          where: { userId, courseId: course.id, state: StepState.COMPLETED },
        });

        const courseTotalSteps = course.lessons.reduce(
          (acc, l) => acc + l.steps.length,
          0,
        );

        return {
          courseId: course.id,
          courseTitle: course.title,
          completedSteps: courseCompletedSteps,
          totalSteps: courseTotalSteps,
          progressPercentage:
            courseTotalSteps > 0
              ? Math.round((courseCompletedSteps / courseTotalSteps) * 100)
              : 0,
          isComplete:
            courseCompletedSteps === courseTotalSteps && courseTotalSteps > 0,
        };
      }),
    );

    return {
      totalSteps,
      completedSteps,
      progressPercentage,
      isComplete,
      courseProgress,
    };
  }

  /**
   * Get progress summary across all courses (optimized for frontend)
   * Single endpoint to replace multiple individual course progress calls
   * Makes only ONE database query instead of N queries (one per course)
   */
  async getProgressSummary(userId: string) {
    // Fetch all user progress records in one query
    const allProgress = await this.progressRepo.find({
      where: { userId, state: StepState.COMPLETED },
    });

    // Build a map of courseId -> completed step count
    const completedByCourse = new Map<number, number>();
    for (const record of allProgress) {
      const current = completedByCourse.get(record.courseId) || 0;
      completedByCourse.set(record.courseId, current + 1);
    }

    // Calculate progress for each course
    const courses = CURRICULUM.map((course) => {
      const courseTotalSteps = course.lessons.reduce(
        (acc, l) => acc + l.steps.length,
        0,
      );
      const courseCompletedSteps = completedByCourse.get(course.id) || 0;
      const progressPercentage =
        courseTotalSteps > 0
          ? Math.round((courseCompletedSteps / courseTotalSteps) * 100)
          : 0;

      return {
        courseId: course.id,
        progressPercentage,
        completedSteps: courseCompletedSteps,
        totalSteps: courseTotalSteps,
        isComplete: progressPercentage === 100,
      };
    });

    // Calculate overall stats
    const completedCourses = courses.filter((c) => c.isComplete).length;
    const totalCourses = CURRICULUM.length;
    const totalSteps = this.getTotalStepsInCurriculum();
    const completedSteps = allProgress.length;
    const overallPercentage =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return {
      completedCourses,
      totalCourses,
      overallPercentage,
      completedSteps,
      totalSteps,
      courses,
    };
  }
}
