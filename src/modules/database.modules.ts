import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { Downloadlinks } from 'src/entities/downloadLinks.entity';
import { Guild } from 'src/entities/guild.entity';
import { GuildMember } from 'src/entities/guild_member.entity';
import { Item } from 'src/entities/item.entity';
import { ItemAttr } from 'src/entities/item_attr.entity';
import { ItemAttrRare } from 'src/entities/item_attr_rare.entity';
import { News } from 'src/entities/news.entity';
import { Player } from 'src/entities/player.entity';
import { PlayerIndex } from 'src/entities/playerIndex.entity';
import { Quest } from 'src/entities/quest.entity';
import { Safebox } from 'src/entities/safebox.entity';
import { Email } from 'src/entities/serverAnnouncementMails.entity';
import { Settings } from 'src/entities/settings.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DB_NAME_ACCOUNT,
      entities: [
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
        News,
        Email,
        Downloadlinks,
      ],
      synchronize: false,
    }),
  ],
})
export class DatabaseModule {}
