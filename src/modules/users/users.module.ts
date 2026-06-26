import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProfileController } from './profile.controller';
import { LeaderboardController } from './leaderboard.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Pet, PetSchema } from '../pets/schemas/pet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Pet.name, schema: PetSchema },
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController, ProfileController, LeaderboardController],
  exports: [UsersService],
})
export class UsersModule {}
