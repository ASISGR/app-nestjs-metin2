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
  Patch,
  Delete,
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
import { RecaptchaDTO } from 'src/dto/recaptcha-verification.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from 'src/middlewares/throttler-behind-proxy.guard';
import { AdministratorService } from 'src/services/administrator.service';
import { CreateNewsDto, DeleteNewsDto } from 'src/dto/news.dto';
import { RolesGuard } from 'src/middlewares/roles.guards';
import {
  registerSwitchDto,
  registerSwitchVerificationDto,
} from 'src/dto/settings.dto';
import { ServerAnnouncementDto } from 'src/dto/server-announcement.dto';
// TODO: Να περάσω στα end google recaptha
@SkipThrottle()
@UseGuards(ThrottlerBehindProxyGuard)
@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private statisticService: StatisticService,
    private authService: AuthService,
    private settingsService: SettingsService,
    private mailerService: MailerService,
    private administratorService: AdministratorService,
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

    // Ελέγχουμε αν το e-mail που έβαλε ο χρήστης είναι ασφαλές.
    const isValidEmail: boolean = await this.mailerService.emailValidation(
      body.email,
    );

    if (!isValidEmail) {
      throw new HttpException(
        'Email is invalid please use a valid email.',
        HttpStatus.BAD_REQUEST,
      );
    }

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
      this.mailerService
        .sendVerification(body, hash, 'gr')
        .then(() => {
          console.log('Επιβεβαίωση στάλθηκε');
        })
        .catch(() => {
          console.log('Επιβεβαίωση δεν στάλθηκε');
        });

      return {
        message: `Your account has been successfully created! To get started, please check your email and follow the instructions to verify your account. Once verified, you'll be able to sign in and enjoy all the features of the game. Verification send to: ${body.email}.\n\nYou will be redirected to your dashboard in few seconds!`,
      };
    }

    return {
      message: `Your account has been successfully created! You can now log in and enjoy all the features of the game.`,
    };
  }

  @SkipThrottle(false)
  @Throttle(5, 10)
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
    const accountInfo = await this.appService.userInformation(token.userId);

    if (!accountInfo) {
      return {
        access_token: token.access_token,
        accountInfo: null,
      };
    }
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
      isVerified: accountFound.isVerified,
    });

    return {
      access_token: token.access_token,
      accountInfo: accountInfo,
    };
  }

  @SkipThrottle(false)
  @Throttle(1, 60)
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Post('send-retry-verification')
  async sendAccountVerification(
    @Request() req: Request & { user: UserJwtTokenDto },
  ) {
    const hash: any = await this.appService.accountRetryValidation(req.user);

    if (!hash) {
      throw new HttpException('Hash not found', HttpStatus.BAD_REQUEST);
    }

    this.mailerService.sendRetryVerification(req.user, hash);

    return {
      message: `Η επιβεβαίωση εστάλη με επιτυχία στο email: ${req.user.email}`,
    };
  }

  @SkipThrottle(false)
  @Throttle(5, 10)
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

    const getAccountForAnnouncementEmail =
      await this.appService.findAccountByHash(body.hash);

    const update = await this.appService.enableAccountByHash(hash);
    if (!update) {
      throw new HttpException(
        `We're sorry, but there was an issue activating your account. Please contact support for further assistance.`,
        HttpStatus.BAD_REQUEST,
      );
    }
    // Εάν το account ενεργοποιηθεί κρατάμε το email για το newsletter.
    this.administratorService.addAnnouncementEmail(
      getAccountForAnnouncementEmail.email,
    );
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
  @SkipThrottle(false)
  @Throttle(5, 10)
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

  @SkipThrottle(false)
  @Throttle(5, 10)
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Post('debug-character')
  async debugCharacter(
    @Body() body: DebugCharacterDto,
    @Request() req: Request & { user: UserJwtTokenDto },
  ) {
    const playerName = body.playerName;
    const empire = body.empire;
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
    const downloadLinks = await this.settingsService.getDownloadLink();

    return {
      registerStatus: registerStatus,
      registerEmailActivationStatus: registerEmailActivationStatus,
      downloadLinks: downloadLinks,
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

  @HttpCode(200)
  @Post('verifyRecaptcha')
  async recaptchaVerification(@Body() body: RecaptchaDTO) {
    const verify: any = await this.appService.recaptcha(
      process.env.RECAPTCHA_SECRET_KEY,
      body.response,
    );

    if (!verify.data.success) {
      console.log(verify);
      throw new HttpException(
        `Oops! It seems our reCAPTCHA V3 verification was unsuccessful. Please ensure you're not a robot by trying again, and double-check your internet connection. If the issue persists, please contact our support team for assistance.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return verify.data;
  }

  @SkipThrottle(false)
  @Throttle(5, 10)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(200)
  @Post('post')
  async createPost(
    @Body() body: CreateNewsDto,
    @Request() req: Request & { user: UserJwtTokenDto },
  ) {
    console.log(body);

    const createPost = await this.administratorService.createPost(body);

    if (!createPost) {
      throw new HttpException(
        `Σφάλμα. Η δημιουργία δημοσίευσης απέτυχε. Παρακαλώ δοκιμάστε ξανά`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: `Επιτυχία! Η δημοσίευση δημιουργήθηκε.`,
    };
  }

  @HttpCode(200)
  @Get('posts')
  async findPosts() {
    const posts = await this.administratorService.findPosts();
    return posts;
  }

  @HttpCode(200)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('posts')
  async editPost(
    @Body() body: CreateNewsDto,
    @Request() req: Request & { user: UserJwtTokenDto },
  ) {
    const post = await this.administratorService.editPost(body);
    if (post.affected == 0) {
      return {
        message: 'Post could not be updated.',
        success: false,
      };
    }
    return { message: 'Post updated successfully', success: true };
  }

  @HttpCode(200)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete('posts')
  async deletePost(
    @Body() body: DeleteNewsDto,
    @Request() req: Request & { user: UserJwtTokenDto },
  ) {
    console.log(body);
    const post = await this.administratorService.deletePost(body);
    if (post.affected == 0) {
      return {
        message: 'Post could not be deleted.',
        success: false,
      };
    }
    return { message: 'Post deleted successfully', success: true };
  }

  @HttpCode(200)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('register-switch')
  async registerSwitch(@Body() body: registerSwitchDto) {
    const register = await this.settingsService.changeRegisterStatus(
      body.register,
    );

    if (register.affected == 0) {
      throw new HttpException(
        `Register could not be activated.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const message = body.register
      ? `Register activated.`
      : `Register deactivated.`;

    return {
      message: message,
    };
  }

  @HttpCode(200)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('register-verification')
  async registerRequiredEmailVerification(
    @Body() body: registerSwitchVerificationDto,
  ) {
    const register =
      await this.settingsService.changeRegisterEmailVerificationStatus(
        body.registerEmailVerification,
      );

    if (register.affected == 0) {
      throw new HttpException(
        `Register email verification could not be activated.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const message = body.registerEmailVerification
      ? `Register email verification activated.`
      : `Register email verification deactivated.`;

    return {
      message: message,
    };
  }

  @HttpCode(200)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('server-announcement')
  async sendServerAnnouncement(@Body() body: ServerAnnouncementDto) {
    const emails: string[] =
      await this.administratorService.findAnnouncementEmails();

    /* const batchEmails = 100;

    for (let i = 0; i < body.emails.length; i += batchEmails) {
      const batchSend = body.emails.slice(i, i + batchEmails);

      // Στείλε τα emails του τρέχοντος batch
      console.log(i);

      console.log(batchSend);
      await this.mailerService.sendServerAnnouncement(
        batchSend,
        body.subject,
        body.title,
        body.content,
        'gr',
      );
      // Καθυστέρηση για 5 δευτερόλεπτα
      await this.delayAsync(5000);
    }*/
    const batchSend = [
      'asisgr01@gmail.gr',
      'gregory01523@gmail.com',
      'asceo2dev@gmail.com',
    ];

    await this.mailerService.sendServerAnnouncement(
      emails,
      body.subject,
      body.title,
      body.content,
      'gr',
    );

    return {
      message: 'Τα mails στάλθηκαν επιτυχώς',
      emails: body.emails,
    };
  }

  @HttpCode(200)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('server-marketing-emails')
  async getServerMarketingEmails() {
    const emails: string[] =
      await this.administratorService.findAnnouncementEmails();

    return {
      emails: emails,
    };
  }

  delayAsync(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
