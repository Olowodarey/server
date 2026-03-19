import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BuilderProfile } from "@app/database/entities/builder-profile.entity";
import { BuildersController } from "./builders.controller";
import { BuildersService } from "./builders.service";

@Module({
  imports: [TypeOrmModule.forFeature([BuilderProfile])],
  controllers: [BuildersController],
  providers: [BuildersService],
})
export class BuildersModule {}
