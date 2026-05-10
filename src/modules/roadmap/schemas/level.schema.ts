import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LevelDocument = HydratedDocument<Level>;

@Schema({ timestamps: true })
export class Level {
  @Prop({ type: Types.ObjectId, ref: 'World', required: true })
  worldId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  type!: string;

  @Prop({ required: true, min: 1 })
  order!: number;
}

export const LevelSchema = SchemaFactory.createForClass(Level);
