import { Module } from "@nestjs/common";
import { DefaultDictionariesService } from "./default-dictionaries.service";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [DefaultDictionariesService],
  exports: [DefaultDictionariesService],
})
export class SeederModule {}
