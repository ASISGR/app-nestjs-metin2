import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { Player } from 'src/entities/player.entity';
import { hashPassword } from 'src/utils/sha1.utils';
import { Like, Not, Repository } from 'typeorm';
import * as md5 from 'md5';
import * as generator from 'generate-password';
import { PlayerIndex } from 'src/entities/playerIndex.entity';
import { ItemAttrRare } from 'src/entities/item_attr_rare.entity';
import { ItemAttr } from 'src/entities/item_attr.entity';
import { Guild } from 'src/entities/guild.entity';
import { Quest } from 'src/entities/quest.entity';
import { Safebox } from 'src/entities/safebox.entity';
import { GuildMember } from 'src/entities/guild_member.entity';
import { UserJwtTokenDto } from 'src/dto/user-jwt-token.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(PlayerIndex)
    private playerIndexRepository: Repository<PlayerIndex>,
    @InjectRepository(ItemAttrRare)
    private itemAttrRareRepository: Repository<ItemAttrRare>,
    @InjectRepository(ItemAttr)
    private itemAttrRepository: Repository<ItemAttr>,
    @InjectRepository(Guild)
    private guildRepository: Repository<Guild>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(Quest) private questRepository: Repository<Quest>,
  ) {}

  async usernameExists(username: string) {
    console.log(username);
    return await this.accountRepository.findOne({ where: { login: username } });
  }

  async emailExists(email: string): Promise<Object | null> {
    return await this.accountRepository.findOne({ where: { email } });
  }

  async createAccount(account: any, isAccVerificationActive: boolean) {
    const hash = md5(Math.random() * 10000);

    account.create_time = new Date();

    isAccVerificationActive === true
      ? (account.status = 'BLOCK')
      : (account.status = 'OK');

    isAccVerificationActive === true
      ? (account.web_aktiviert = hash)
      : (account.web_aktiviert = '1');

    account.password = hashPassword(account.password);

    const isCreated = await this.accountRepository.save(account);

    if (isCreated) {
      return hash;
    }

    return false;
  }

  async singIn(username: string, password: string) {
    password = hashPassword(password);

    const account: any = await this.accountRepository.findOne({
      where: { login: username, password },
    });

    if (account) {
      return {
        login: account.login,
        userId: account.id,
        coins: account.coins,
        jcoins: account.jcoins,
        last_play: account.last_play,
        account_status: account.status,
        social_id: account.social_id,
        email: account.email,
        isAdmin: account.web_admin == 9,
      };
    }

    return null;
  }

  async updatePassword(
    accountUser: UserJwtTokenDto,
    oldPassword: string,
    newPassword: string,
  ) {
    oldPassword = hashPassword(oldPassword);
    newPassword = hashPassword(newPassword);

    const account = await this.accountRepository.findOne({
      where: { id: accountUser.userId, password: oldPassword },
    });

    if (!account) return false;

    account.password = newPassword;

    return await this.accountRepository.save(account);
  }

  async enableAccountByHash(hash: string) {
    const account = await this.accountRepository.findOne({
      where: { status: 'BLOCK', web_aktiviert: hash },
    });

    if (!account) return false;

    account.status = 'OK';
    account.web_aktiviert = '1';

    return await this.accountRepository.save(account);
  }

  async applyPasslostToken(email: string, login: string) {
    const hash = md5(Math.random() * 10000);

    const account = await this.accountRepository.findOne({
      where: { email, login },
    });

    console.log(account);
    if (!account) return false;

    account.passlost_token = hash;

    await this.accountRepository.save(account);

    return hash;
  }

  async resetPassword(hash: string) {
    const newPassword = generator.generate({
      length: 10,
      lowercase: true,
      uppercase: true,
      numbers: true,
    });

    const newHashPassword = hashPassword(newPassword);

    const account = await this.accountRepository.findOne({
      where: { passlost_token: hash },
    });

    if (!account) return false;

    account.passlost_token = '';
    account.password = newHashPassword;

    await this.accountRepository.save(account);

    return newPassword;
  }

  async debugCharacter(accountId: number, playerName: string, empire: number) {
    // map 1 SHINSOO
    // map 2 CHUNJO
    // map 3 JINNO

    let mapIndex = '0',
      x = '0',
      y = '0';

    if (empire === 1) {
      mapIndex = '0';
      x = '459770';
      y = '953980';
    } else if (empire === 2) {
      mapIndex = '21';
      x = '52043';
      y = '166304';
    } else if (empire === 3) {
      mapIndex = '41';
      x = '957291';
      y = '255221';
    } else {
      return false;
    }

    const player = await this.playerRepository.findOne({
      where: { account_id: accountId, name: playerName },
    });

    if (!player) return false;

    player.map_index = mapIndex;
    player.x = x;
    player.y = y;
    player.exit_x = x;
    player.exit_y = y;
    player.exit_map_index = mapIndex;
    player.horse_riding = '0';

    return await this.playerRepository.save(player);
  }

  async userInformation(userId: any) {
    const player = await this.playerRepository
      .createQueryBuilder('player')
      .select([
        'player.name',
        'player.level',
        'player.playtime',
        'player.account_id',
        'playerIndex.empire',
        'playerSafebox.password',
      ])
      .leftJoin(
        PlayerIndex,
        'playerIndex',
        'player.account_id = playerIndex.id',
      )
      .leftJoin(
        Safebox,
        'playerSafebox',
        'player.account_id = playerSafebox.account_id',
      )
      .where('player.account_id = :userId', { userId })

      .getRawMany();

    const playtime = player
      .reduce((oldValue: any, newValue: any) => {
        return oldValue + newValue.player_playtime;
      }, 0)
      .toLocaleString();

    const players = player.map((res) => {
      return res.player_name;
    });

    return {
      players: players,
      empire: player.length > 0 ? player[0].playerIndex_empire : null,
      playtime: playtime,
      safebox_password:
        player.length > 0 ? player[0].playerSafebox_password : null,
    };
  }

  async getItemAttr() {
    return await this.itemAttrRepository
      .createQueryBuilder('item_attr')
      .select([])
      .getRawMany();
  }

  async getItemAttrRare() {
    return await this.itemAttrRareRepository
      .createQueryBuilder('item_attr_rare')
      .select([])

      .getRawMany();
  }

  async top10Guilds() {
    const topGuilds = await this.guildRepository
      .createQueryBuilder('guild')
      .select([
        'guild.name',
        'guild.level',
        'guild.ladder_point',
        'playerLeader.name',
        'playerIndex.empire',
      ])
      .leftJoin(Player, 'playerLeader', 'playerLeader.id = guild.master')
      .leftJoin(
        PlayerIndex,
        'playerIndex',
        'playerIndex.id = playerLeader.account_id',
      )
      .where("guild.name NOT LIKE '%[%' AND guild.name NOT LIKE '%]%'")
      .groupBy(
        'guild.name, guild.level, guild.ladder_point, playerIndex_empire, playerLeader_name',
      )
      .orderBy('guild.level', 'DESC')
      .addOrderBy('guild.ladder_point', 'DESC')
      .limit(10)
      .getRawMany();

    for (let i = 0; i < topGuilds.length; i++) {
      topGuilds[i].index = i + 1;

      topGuilds[i].guild_ladder_point =
        topGuilds[i].guild_ladder_point.toLocaleString();
    }

    return topGuilds;
  }

  async top10Players() {
    const topPlayers = await this.playerRepository
      .createQueryBuilder('player')
      .select([
        'player.name',
        'player.level',
        'player.playtime',
        'player.exp',
        'player.horse_level',
        'playerIndex.empire',
        'playerGuild.name',
        `CONCAT('Βιολόγος ', MAX(collect_quest_lv)) AS highest_collect_quest_lv`,
      ])
      .leftJoin(
        PlayerIndex,
        'playerIndex',
        'player.account_id = playerIndex.id',
      )
      .leftJoin(
        GuildMember,
        'playerGuildMember',
        'player.id = playerGuildMember.pid',
      )
      .leftJoin(
        Guild,
        'playerGuild',
        'playerGuildMember.guild_id = playerGuild.id ',
      )
      .leftJoin(
        (subQuery) =>
          subQuery
            .select([
              'dwPID',
              "REPLACE(SUBSTRING_INDEX(szName, '_', -1), 'lv', '') + 0 AS collect_quest_lv",
            ])
            .from(Quest, 'quest')
            .where("quest.szName LIKE 'collect_quest_lv%'"),
        'collect_quest_lv',
        'collect_quest_lv.dwPID = player.id',
      )
      .where("player.name NOT LIKE '%[%' AND player.name NOT LIKE '%]%'")
      .groupBy('player.name, player.level, player.playtime, playerIndex.empire')
      .orderBy('player.level', 'DESC')
      .addOrderBy('MAX(collect_quest_lv)', 'DESC')
      .addOrderBy('player.playtime', 'DESC')
      .limit(10)
      .getRawMany();

    for (let i = 0; i < topPlayers.length; i++) {
      topPlayers[i].index = i + 1;

      topPlayers[i].player_playtime =
        topPlayers[i].player_playtime.toLocaleString();

      topPlayers[i].player_exp = topPlayers[i].player_exp.toLocaleString();
    }
    return topPlayers;
  }

  async topPlayersRanklist(page: any) {
    const ITEMS_PER_PAGE = 50;

    page = parseInt(page);

    const totalPlayers = await this.playerRepository.count({
      where: [{ name: Not(Like('%[%')) }, { name: Not(Like('%]%')) }],
    });

    if (page && page > 0 && page <= Math.ceil(totalPlayers / ITEMS_PER_PAGE)) {
      page = page;
    } else {
      page = 1;
    }

    const offset = (page - 1) * ITEMS_PER_PAGE;

    const topPlayers = await this.playerRepository
      .createQueryBuilder('player')
      .select([
        'player.name',
        'player.level',
        'player.playtime',
        'player.exp',
        'player.horse_level',
        'playerIndex.empire',
        'playerGuild.name',
        `CONCAT('Βιολόγος ', MAX(collect_quest_lv)) AS highest_collect_quest_lv`,
      ])
      .leftJoin(
        PlayerIndex,
        'playerIndex',
        'player.account_id = playerIndex.id',
      )
      .leftJoin(
        GuildMember,
        'playerGuildMember',
        'player.id = playerGuildMember.pid',
      )
      .leftJoin(
        Guild,
        'playerGuild',
        'playerGuildMember.guild_id = playerGuild.id ',
      )
      .leftJoin(
        (subQuery) =>
          subQuery
            .select([
              'dwPID',
              "REPLACE(SUBSTRING_INDEX(szName, '_', -1), 'lv', '') + 0 AS collect_quest_lv",
            ])
            .from(Quest, 'quest')
            .where("quest.szName LIKE 'collect_quest_lv%'"),
        'collect_quest_lv',
        'collect_quest_lv.dwPID = player.id',
      )
      .where("player.name NOT LIKE '%[%' AND player.name NOT LIKE '%]%'")
      .groupBy('player.name, player.level, player.playtime, playerIndex.empire')
      .orderBy('player.level', 'DESC')
      .addOrderBy('MAX(collect_quest_lv)', 'DESC')
      .addOrderBy('player.playtime', 'DESC')
      .limit(ITEMS_PER_PAGE)
      .offset(offset)
      .take(ITEMS_PER_PAGE)
      .getRawMany();

    for (let i = 0; i < topPlayers.length; i++) {
      topPlayers[i].index = i + 1;
      topPlayers[i].player_exp = topPlayers[i].player_exp.toLocaleString();

      topPlayers[i].player_playtime =
        topPlayers[i].player_playtime.toLocaleString();
    }

    const totalCount = totalPlayers;

    return {
      players: topPlayers,
      totalPlayers: totalCount,
      hasNextPage: ITEMS_PER_PAGE * page < totalCount,
      currentPage: page,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalCount / ITEMS_PER_PAGE),
    };
  }

  async topGuildsRanklist(page: any) {
    const ITEMS_PER_PAGE = 50;

    page = parseInt(page);
    const totalGuilds = await this.guildRepository.count({
      where: [{ name: Not(Like('%[%')) }, { name: Not(Like('%]%')) }],
    });

    if (page && page > 0 && page <= Math.ceil(totalGuilds / ITEMS_PER_PAGE)) {
      page = page;
    } else {
      page = 1;
    }

    const offset = (page - 1) * ITEMS_PER_PAGE;

    const topGuilds = await this.guildRepository
      .createQueryBuilder('guild')
      .select([
        'guild.name',
        'guild.level',
        'guild.win',
        'guild.draw',
        'guild.loss',
        'guild.ladder_point',
        'playerLeader.name',
        'playerIndex.empire',
      ])
      .leftJoin(Player, 'playerLeader', 'guild.master = playerLeader.id')
      .leftJoin(
        PlayerIndex,
        'playerIndex',
        'playerLeader.account_id = playerIndex.id',
      )
      .where("guild.name NOT LIKE '%[%' AND guild.name NOT LIKE '%]%'")
      .groupBy(
        'guild.name, guild.level, guild.ladder_point, playerLeader_name, playerIndex_empire',
      )
      .orderBy('guild.level', 'DESC')
      .orderBy('guild.ladder_point', 'DESC')
      .limit(ITEMS_PER_PAGE)
      .offset(offset)
      .take(ITEMS_PER_PAGE)
      .getRawMany();

    for (let i = 0; i < topGuilds.length; i++) {
      topGuilds[i].index = i + 1;
      console.log(topGuilds[i]);
      topGuilds[i].guild_ladder_point =
        topGuilds[i].guild_ladder_point.toLocaleString();
    }

    const totalCount = totalGuilds;

    return {
      guilds: topGuilds,
      totalGuilds: totalCount,
      hasNextPage: ITEMS_PER_PAGE * page < totalCount,
      currentPage: page,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalCount / ITEMS_PER_PAGE),
    };
  }
}
