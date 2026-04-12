import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /users/me — authenticated user profile + tier progress + recent orders */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: { user: { userId: string } }) {
    return this.usersService.getMe(req.user.userId);
  }

  /** PATCH /users/update — update authenticated user profile */
  @UseGuards(JwtAuthGuard)
  @Patch('update')
  updateProfile(
    @Request() req: { user: { userId: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(req.user.userId, updateUserDto);
  }
}
