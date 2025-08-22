import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
  // private: ensures encapsulation and prevents external misuse of dependencies
  // readonly: prevents accidental reassignment and makes code more predictable
  constructor(private readonly usersService: UsersService) { }
  


  /*   @Get("patients/:professionalId")
  // @UseGuards(JwtAuthGuard) // TODO: Créer JwtAuthGuard
  getPatientsByProfessionalId(@Param("professionalId") professionalId: string) {
    return this.usersService.getPatientsByProfessionalId(professionalId);
  }

  // Exemple d'utilisation du décorateur @IsAdmin()
  @Get("admin/users")
  @IsAdmin()
  @UseGuards(RolesGuard)
  getAdminUsers() {
    return this.usersService.getUsers();
  } */
}
