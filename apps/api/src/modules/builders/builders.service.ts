import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  BuilderProfile,
  BuilderCategory,
} from "@app/database/entities/builder-profile.entity";
import { SubmitBuilderDto } from "./dto/submit-builder.dto";
import { ApproveBuilderDto, RejectBuilderDto } from "./dto/approve-builder.dto";

@Injectable()
export class BuildersService {
  private readonly logger = new Logger(BuildersService.name);

  constructor(
    @InjectRepository(BuilderProfile)
    private readonly repo: Repository<BuilderProfile>,
  ) {}

  async findAll(category?: BuilderCategory) {
    const qb = this.repo.createQueryBuilder("b").where("b.is_approved = true");
    if (category) qb.andWhere("b.category = :category", { category });
    return qb.orderBy("b.created_at", "DESC").getMany();
  }

  async findOne(id: string) {
    const builder = await this.repo.findOne({
      where: { id, isApproved: true },
    });
    if (!builder) throw new NotFoundException("Builder profile not found");
    return builder;
  }

  async submit(userId: string, dto: SubmitBuilderDto) {
    // Generate initials from name (first 2 letters)
    const initials =
      dto.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "SA";

    // Generate a random gradient for avatar
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-purple-500 to-pink-600",
      "from-green-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-yellow-500 to-orange-600",
      "from-indigo-500 to-blue-600",
      "from-pink-500 to-rose-600",
      "from-teal-500 to-cyan-600",
    ];
    const avatarGradient =
      gradients[Math.floor(Math.random() * gradients.length)];

    const profile = this.repo.create({
      ...dto,
      submittedBy: userId,
      isApproved: false,
      initials,
      avatarGradient,
    });

    return this.repo.save(profile);
  }

  /**
   * Admin: Get all pending builder profiles
   */
  async findPending() {
    return this.repo.find({
      where: { isApproved: false },
      relations: ["submitter"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Admin: Approve a builder profile
   */
  async approve(id: string, dto: ApproveBuilderDto) {
    const builder = await this.repo.findOne({ where: { id } });
    if (!builder) throw new NotFoundException("Builder profile not found");

    builder.isApproved = true;
    const updated = await this.repo.save(builder);

    this.logger.log(
      `Builder profile ${id} approved by admin. Notes: ${dto.notes || "None"}`,
    );
    return updated;
  }

  /**
   * Admin: Reject a builder profile
   */
  async reject(id: string, dto: RejectBuilderDto) {
    const builder = await this.repo.findOne({ where: { id } });
    if (!builder) throw new NotFoundException("Builder profile not found");

    // Delete rejected profile
    await this.repo.remove(builder);

    this.logger.log(
      `Builder profile ${id} rejected by admin. Reason: ${dto.reason}`,
    );
    return { deleted: true, reason: dto.reason };
  }
}
