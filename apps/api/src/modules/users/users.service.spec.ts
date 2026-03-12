import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@app/database/entities/user.entity';
import { createMockRepository } from '../../../test/mocks/repository.mock';
import { UserFactory } from '../../../test/factories/user.factory';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const mockUser = UserFactory.create();
      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findById('non-existent')).rejects.toThrow(
        'User non-existent not found',
      );
    });
  });

  describe('findByWalletAddress', () => {
    it('should return a user by wallet address', async () => {
      const mockUser = UserFactory.create();
      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByWalletAddress(mockUser.walletAddress);

      expect(result).toEqual(mockUser);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { walletAddress: mockUser.walletAddress },
      });
    });

    it('should return null if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.findByWalletAddress('SP123');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockUser = UserFactory.create();
      const updateDto = {
        displayName: 'Updated Name',
        bio: 'New bio',
      };

      userRepo.findOne.mockResolvedValue(mockUser);
      userRepo.save.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await service.updateProfile(mockUser.id, updateDto);

      expect(result.displayName).toBe(updateDto.displayName);
      expect(result.bio).toBe(updateDto.bio);
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile('non-existent', { displayName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return user stats', async () => {
      const mockUser = UserFactory.create({
        xpTotal: 500,
        level: 5,
        streakDays: 10,
        longestStreak: 15,
      });
      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.getStats(mockUser.id);

      expect(result).toEqual({
        xpTotal: 500,
        level: 5,
        streakDays: 10,
        longestStreak: 15,
        lastActivityAt: mockUser.lastActivityAt,
      });
    });
  });
});
