import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, UserSchema } from './modules/users/schemas/user.schema';
import { UsersModule } from './modules/users/users.module';
import { TutorialsModule } from './modules/tutorials/tutorials.module';
import { RoadmapsModule } from './modules/roadmaps/roadmaps.module';
import { HistoriesModule } from './modules/histories/histories.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://devcopet:bkute123456@cluster-1.7fhl9ez.mongodb.net/devcopet?retryWrites=true&w=majority&appName=Cluster-1',
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    TutorialsModule,
    RoadmapsModule,
    HistoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
