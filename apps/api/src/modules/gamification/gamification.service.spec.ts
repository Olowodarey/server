import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { GamificationService } from "./gamification.service";
import { User } from "@app/database/entities/user.entity";
import { XpService } from "./xp/xp.service";
import { BadgesService } from "./badges/badges.service";

describe("GamificationService", () => {
  let service: GamificationService;

  const mockUserRepo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
  };

  const mockXpService = {
    getLevelInfo: jest.fn(),
  };

  const mockBadgesService = {
    getUserBadges: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: XpService,
          useValue: mockXpService,
        },
        {
          provide: BadgesService,
          useValue: mockBadgesService,
        },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
