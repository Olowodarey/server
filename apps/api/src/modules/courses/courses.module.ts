import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserProgress } from "@app/database/entities/user-progress.entity";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserProgress])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
