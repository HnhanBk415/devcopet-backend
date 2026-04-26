import { Module } from '@nestjs/common';
import { TutorialsService } from './tutorials.service';
import { TutorialsController } from './tutorials.controller';

@Module({
  controllers: [TutorialsController],
  providers: [TutorialsService],
})
export class TutorialsModule {}
