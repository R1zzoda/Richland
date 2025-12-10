import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DictionariesModule } from './dictionaries/dictionaries.module';
import { TrainingModule } from './training/training.module';
import { WordsModule } from './word/words.module';
import { StatisticsModule } from './statistics/statistics.module';
import { DefaultDictionariesService } from "./seeder/default-dictionaries.service";



@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    DictionariesModule,
    TrainingModule,
    WordsModule,
    StatisticsModule // <-- добавили сюда
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DefaultDictionariesService,
  ],
})
export class AppModule {}
