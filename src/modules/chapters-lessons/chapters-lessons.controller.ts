import { Controller } from '@nestjs/common';
import { ChaptersLessonsService } from './chapters-lessons.service';

@Controller('chapters-lessons')
export class ChaptersLessonsController {
  constructor(
    private readonly chaptersLessonsService: ChaptersLessonsService,
  ) {}
}
