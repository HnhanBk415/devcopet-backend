import { Test, TestingModule } from '@nestjs/testing';
import { HistoriesController } from './histories.controller';
import { HistoriesService } from './histories.service';

describe('HistoriesController', () => {
  let controller: HistoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoriesController],
      providers: [HistoriesService],
    }).compile();

    controller = module.get<HistoriesController>(HistoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
