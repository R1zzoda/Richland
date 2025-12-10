import { Module } from '@nestjs/common';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';
import { DatabaseModule } from '../database/database.module';
import { TrainingModule } from '../training/training.module';

@Module({
  imports: [
    DatabaseModule,   // для PG_POOL
    TrainingModule,   // чтобы получить TrainingService
  ],
  controllers: [WordsController],
  providers: [WordsService],
})
export class WordsModule {}
