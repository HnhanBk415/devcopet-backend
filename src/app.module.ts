import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, UserSchema } from './user.schema'; 

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://devcopet:bkute123456@cluster-1.7fhl9ez.mongodb.net/devcopet?retryWrites=true&w=majority&appName=Cluster-1'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}