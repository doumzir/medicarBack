import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
// configuration nest js for dotenv ect
import { ConfigModule } from '@nestjs/config';
import { AppointmentsModule } from './appointments/appointments.module';
import { NotesModule } from './notes/notes.module';
import { PatientsModule } from './patients/patients.module';

import { TreatmentsModule } from './treatments/treatments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PatientsModule,
    NotesModule,
    TreatmentsModule,
    AppointmentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
