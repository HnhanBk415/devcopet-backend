import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import { Pet } from '../pets/schemas/pet.schema';

describe('UsersService', () => {
  let service: UsersService;

  const userModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Pet.name), useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should normalize email lookup', async () => {
    userModel.findOne.mockResolvedValue(null);

    await service.findByEmail(' USER@Example.COM ');

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: 'user@example.com',
    });
  });
});
