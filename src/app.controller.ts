import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('users') // Định tuyến: endpoint lúc này sẽ là /users
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getUsers() {
    return this.appService.getAllUsers();
  }
}
