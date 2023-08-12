import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { AppService } from '../services/app.service';
import { StatisticService } from '../services/statistic.service';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { AuthService } from 'src/services/auth.service';
import { MailerService } from 'src/services/mailer.service';
import { CreateAccountDto } from 'src/dto/create-account.dto';
import { SettingsService } from 'src/services/settings.service';
import { ChangePasswordDto } from 'src/dto/change-password.dto';
import { AuthGuard } from 'src/middlewares/auth.guard';
import { UserJwtTokenDto } from 'src/dto/user-jwt-token.dto';
import { accountActivationDto } from 'src/dto/account-activation.dto';
import { AsyncValidationDTO } from 'src/dto/async-validation-data.dto';
import { ApplyResetPasswordDto } from 'src/dto/apply-reset-password.dto';
import { DebugCharacterDto } from 'src/dto/debug-character.dto';
import { RankingIndex } from 'src/dto/ranking.request.dto';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private statisticService: StatisticService,
    private authService: AuthService,
    private settingsService: SettingsService,
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

  @HttpCode(201)
  @Post('create')
  async create(@Body() body: CreateAccountDto) {
    if ((await this.settingsService.isRegisterEnableSetting()) === false) {
      throw new HttpException(
        'Register is deactivated.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const passwordWithoutHash = body.password;

    const requiredEmailVerification =
      await this.settingsService.isRegisterEmailVerification();

    const usernameExist = await this.appService.usernameExists(body.login);

    if (usernameExist) {
      throw new HttpException('Username in use.', HttpStatus.BAD_REQUEST);
    }

    const emailExists = await this.appService.emailExists(body.email);
    if (emailExists) {
      throw new HttpException('Email in use.', HttpStatus.BAD_REQUEST);
    }

    const hash = await this.appService.createAccount(
      body,
      requiredEmailVerification,
    );

    if (!hash) {
      throw new HttpException(
        'Account could not be created',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (requiredEmailVerification) {
      body.password = passwordWithoutHash;
      this.mailerService.sendVerification(body, hash, 'gr');
      return {
        message: `Your account has been successfully created! To get started, please check your email and follow the instructions to verify your account. Once verified, you'll be able to sign in and enjoy all the features of the game. Verification send to: ${body.email}.`,
      };
    }

    return {
      message: `Your account has been successfully created! You can now log in and enjoy all the features of the game.`,
    };
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() body: LoginUserDto) {
    const token: any = await this.authService.signIn(body.login, body.password);

    if (!token) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const accountFound = await this.appService.singIn(
      body.login,
      body.password,
    );

    if (!accountFound) {
      throw new HttpException(
        `Account doesn't exist.`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const accountInfo = await this.appService.userInformation(token.user_id);

    Object.assign(accountInfo, {
      userId: accountFound.userId,
      login: accountFound.login,
      coins: accountFound.coins,
      jcoins: accountFound.jcoins,
      email: accountFound.email,
      last_play: accountFound.last_play,
      account_status: accountFound.account_status,
      social_id: accountFound.social_id,
      isAdmin: accountFound.isAdmin,
    });

    return {
      access_token: token.access_token,
      accountInfo: accountInfo,
    };
  }

  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Post('change-user-password')
  async changeUserPassword(
    @Body() body: ChangePasswordDto,
    @Request() req: Request & { user: UserJwtTokenDto },
  ) {
    const previousPassword = body.previousPassword;
    const updatePassword = body.updatePassword;

    const updateAccountPassword = await this.appService.updatePassword(
      req.user,
      previousPassword,
      updatePassword,
    );

    if (!updateAccountPassword) {
      throw new HttpException(
        'Credentials did not updated',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: `Credentials changed successfully!`,
    };
  }

  @HttpCode(200)
  @Post('active')
  async accountActivation(@Body() body: accountActivationDto) {
    const hash = body.hash;

    const update = await this.appService.enableAccountByHash(hash);
    if (!update) {
      throw new HttpException(
        `We're sorry, but there was an issue activating your account. Please contact support for further assistance.`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      message: `Your account has been successfully activated.`,
    };
  }

  @HttpCode(200)
  @Post('validation')
  async asyncValidation(@Body() body: AsyncValidationDTO) {
    if (body.login) {
      const usernameExist = await this.appService.usernameExists(body.login);
      if (usernameExist) {
        throw new HttpException(
          `username already in use.`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (body.email) {
      const emailExist = await this.appService.emailExists(body.email);
      if (emailExist) {
        throw new HttpException(
          `email already in use.`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return {
      status: true,
    };
  }

  @HttpCode(200)
  @Post('apply-reset-password')
  async applyRequestResetPassword(@Body() body: ApplyResetPasswordDto) {
    const email = body.email;
    const login = body.login;

    const hash = await this.appService.applyPasslostToken(email, login);

    if (!hash) {
      throw new HttpException(
        `Σας ενημερώνουμε ότι δεν βρέθηκε λογαριασμός που αντιστοιχεί στα στοιχεία: e-mail: ${email} όνομα χρήστη: ${login}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    this.mailerService.sendResetPassword(email, hash, 'gr');

    return {
      message: `Σας ενημερώνουμε ότι σας έχει σταλεί email για επαναφορά κωδικού πρόσβασης στο e-mail: ${email}`,
    };
  }

  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body() body: accountActivationDto) {
    const hash = body.hash;

    const newResetedPassword = await this.appService.resetPassword(hash);

    if (!newResetedPassword) {
      throw new HttpException(
        `Σφάλμα. Η επαναφορά απέτυχε. Παρακαλώ δοκιμάστε ξανά`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: `Επιτυχία! Ο λογαριασμός σας επαναφέρθηκε με νέο κωδικό: ${newResetedPassword}`,
    };
  }

  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Post('debug-character')
  async debugCharacter(
    @Body() body: DebugCharacterDto,
    @Request() req: Request & { user: UserJwtTokenDto },
  ) {
    const playerName = body.playerName;
    const empire = body.empire;
    console.log(empire);
    const debugChar = await this.appService.debugCharacter(
      req.user.userId,
      playerName,
      empire,
    );

    if (!debugChar) {
      throw new HttpException(
        `Σφάλμα. Η επαναφορά απέτυχε. Παρακαλώ δοκιμάστε ξανά`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: `Επιτυχία! Ο χαρακτήρας σας: ${playerName} επαναφέρθηκε, παρακαλώ περιμένετε 15 λεπτά πριν συνδεθείτε.`,
    };
  }

  @HttpCode(200)
  @Get('bonus')
  async getBonus() {
    const item_attr = await this.appService.getItemAttr();
    const item_attr_rare = await this.appService.getItemAttrRare();

    return {
      item_attr: item_attr,
      item_attr_rare: item_attr_rare,
    };
  }

  @HttpCode(200)
  @Get('settings-status')
  async getSettingsStatus() {
    const registerStatus = await this.settingsService.isRegisterEnableSetting();
    const registerEmailActivationStatus =
      await this.settingsService.isRegisterEmailVerification();
    return {
      registerStatus: registerStatus,
      registerEmailActivationStatus: registerEmailActivationStatus,
    };
  }

  @HttpCode(200)
  @Get('top10Ranks')
  async top10Ranks() {
    const top10Guilds = await this.appService.top10Guilds();
    const top10Players = await this.appService.top10Players();

    return {
      top10Guilds: top10Guilds,
      top10Players: top10Players,
    };
  }

  @HttpCode(200)
  @Get('topListPlayers/:index')
  async topPlayersList(@Param() params: RankingIndex) {
    const topPlayers = await this.appService.topPlayersRanklist(params.index);

    return topPlayers;
  }

  @HttpCode(200)
  @Get('topListGuilds/:index')
  async topGuildsList(@Param() params: RankingIndex) {
    const topGuilds = await this.appService.topGuildsRanklist(params.index);

    return topGuilds;
  }
}
