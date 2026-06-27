import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { Pet, PetSchema } from './schemas/pet.schema';
import { UsersModule } from '../users/users.module';
import { LearningHistoryModule } from '../learning-history/learning-history.module';
import { MissionsModule } from '../missions/missions.module';

@Module({
  imports: [
    UsersModule,
    LearningHistoryModule,
    MissionsModule,
    MongooseModule.forFeature([{ name: Pet.name, schema: PetSchema }]),
  ],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}
