import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return users', async () => {
      // Vì hàm getUsers gọi appService.getAllUsers() trả về Promise,
      // ta sửa lại test để gọi đúng tên hàm.
      const result = await appController.getUsers();
      expect(result).toBeDefined();
    });
  });
});
