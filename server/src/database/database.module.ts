import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'PG_POOL',
      useFactory: () => {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
          throw new Error('❌ DATABASE_URL is not defined');
        }

        return new Pool({
          connectionString,
          ssl: {
            rejectUnauthorized: false, // Railway требует SSL
          },
        });
      },
    },
  ],
  exports: ['PG_POOL'],
})
export class DatabaseModule {}
