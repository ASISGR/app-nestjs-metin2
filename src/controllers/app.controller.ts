import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService } from '../services/app.service';
import { StatisticService } from '../services/statistic.service';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { AuthService } from 'src/services/auth.service';
import { MailerService } from 'src/services/mailer.service';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private statisticService: StatisticService,
    private authService: AuthService,
    private mailerService: MailerService,
  ) {}

  @HttpCode(200)
  @Get('statistics')
  async getStatistics(): Promise<Object> {
    const sumAccountsLength = await this.statisticService.sumAccountsLength();
    const sumAccountsPerKingdom =
      await this.statisticService.sumAccountsPerKingdom();
    const sumOfCommunityItems =
      await this.statisticService.sumOfCommunityItems();
    const sumOfGold = await this.statisticService.sumOfGold();
    const sumOfGuilds = await this.statisticService.sumOfGuilds();
    const sumOfPlayers = await this.statisticService.sumOfPlayers();
    const sumOfPlayersOnline = await this.statisticService.sumOfPlayersOnline();
    const sumOfPlayersOnline24 =
      await this.statisticService.sumOfPlayersOnline24();

    return {
      sumAccountsLength: sumAccountsLength,
      sumAccountsPerKingdom: sumAccountsPerKingdom,
      sumOfCommunityItems: sumOfCommunityItems,
      sumOfGold: sumOfGold,
      sumOfGuilds: sumOfGuilds,
      sumOfPlayers: sumOfPlayers,
      sumOfPlayersOnline: sumOfPlayersOnline,
      sumOfPlayersOnline24: sumOfPlayersOnline24,
    };
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() body: LoginUserDto) {
    const token: any = await this.authService.signIn(body.login, body.password);

    if (!token) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const accountInfo = await this.appService.userInformation(token.user_id);

    return {
      access_token: token.access_token,
      accountInfo: accountInfo,
    };
  }

  @HttpCode(200)
  @Post('sendMail')
  async sendMail() {
    const guilds = await this.appService.top10Players();
    return guilds;
  }
}
