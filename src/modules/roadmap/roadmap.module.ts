import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';
import { World, WorldSchema } from './schemas/world.schema';
import { Level, LevelSchema } from './schemas/level.schema';
import { Node, NodeSchema } from './schemas/node.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: World.name, schema: WorldSchema },
      { name: Level.name, schema: LevelSchema },
      { name: Node.name, schema: NodeSchema },
    ]),
  ],
  controllers: [RoadmapController],
  providers: [RoadmapService],
  exports: [RoadmapService],
})
export class RoadmapModule {}
