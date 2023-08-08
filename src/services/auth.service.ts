import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private appService: AppService, private jwtService: JwtService) {}

  async signIn(username: string, password: string) {
    const user = await this.appService.singIn(username, password);
    if (!user) {
      return null;
    }

    const payload = {
      user_id: user.userId,
      username: user.login,
      email: user.email,
      web_admin: user.isAdmin,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user_id: user.userId,
    };
  }
}
