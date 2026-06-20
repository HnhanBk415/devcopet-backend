import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    findSafeById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the current user only', async () => {
    const user = { _id: 'u1', email: 'a@example.com' };
    usersService.findSafeById.mockResolvedValue(user);

    await expect(controller.getMe({ user: { userId: 'u1' } })).resolves.toEqual(
      user,
    );
    expect(usersService.findSafeById).toHaveBeenCalledWith('u1');
  });
});
