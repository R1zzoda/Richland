import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'PG_POOL',
      useFactory: () => {
        return new Pool({
          host: 'localhost',
          port: 4200,            //  docker пробрасывает 4200 → 5432
          user: 'postgres',      //  логин
          password: 'lamb',      //  пароль
          database: 'Richland',  //  база в контейнере
        });
      },
    },
  ],
  exports: ['PG_POOL'],
})
export class DatabaseModule {}
