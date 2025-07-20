import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
// configuration nest js for dotenv ect
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
