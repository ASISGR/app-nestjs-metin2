import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { DatabaseModule } from './modules/database.modules';
import { StatisticService } from './services/statistic.service';
import { Player } from './entities/player.entity';
import { Item } from './entities/item.entity';
import { Guild } from './entities/guild.entity';
import { PlayerIndex } from './entities/playerIndex.entity';
import { Settings } from './entities/settings.entity';
import { AuthService } from './services/auth.service';
import { AuthModule } from './modules/auth.modules';
import { Safebox } from './entities/safebox.entity';
import { ItemAttr } from './entities/item_attr.entity';
import { ItemAttrRare } from './entities/item_attr_rare.entity';
import { MailerModule } from './modules/mailer.modules';
import { Quest } from './entities/quest.entity';
import { GuildMember } from './entities/guild_member.entity';
import { SettingsService } from './services/settings.service';

@Module({
  imports: [
    MailerModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([
      Account,
      Item,
      Player,
      Guild,
      PlayerIndex,
      Settings,
      Safebox,
      ItemAttr,
      ItemAttrRare,
      Quest,
      GuildMember,
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, StatisticService, SettingsService, AuthService],
})
export class AppModule {}
