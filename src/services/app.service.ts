import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { Player } from 'src/entities/player.entity';
import { hashPassword } from 'src/utils/sha1.utils';
import { Like, Not, Repository } from 'typeorm';
import * as md5 from 'md5';
import generator from 'generate-password';
import { PlayerIndex } from 'src/entities/playerIndex.entity';
import { ItemAttrRare } from 'src/entities/item_attr_rare.entity';
import { ItemAttr } from 'src/entities/item_attr.entity';
import { Guild } from 'src/entities/guild.entity';
import { Quest } from 'src/entities/quest.entity';

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

  async usernameExists(username: string): Promise<Object | null> {
    return await this.accountRepository.find({ where: { login: username } });
  }

  async emailExists(email: string): Promise<Object | null> {
    return await this.accountRepository.find({ where: { email } });
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
    accountUser: any,
    oldPassword: string,
    newPassword: string,
  ) {
    oldPassword = hashPassword(oldPassword);
    newPassword = hashPassword(newPassword);

    const account = await this.accountRepository.findOne({
      where: { id: accountUser.id, password: oldPassword },
    });

    account.password = newPassword;

    return await this.accountRepository.save(account);
  }

  async enableAccountByHash(hash: string) {
    const account = await this.accountRepository.findOne({
      where: { status: 'BLOCK', web_aktiviert: hash },
    });

    account.status = 'OK';
    account.web_aktiviert = '1';

    return await this.accountRepository.save(account);
  }

  async applyPasslostToken(email: string, login: string) {
    const hash = md5(Math.random() * 10000);

    const account = await this.accountRepository.findOne({
      where: { email, login },
    });

    account.passlost_token = hash;

    return await this.accountRepository.save(account);
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

    account.passlost_token = '';
    account.password = newHashPassword;

    await this.accountRepository.save(account);

    return newPassword;
  }

  async debugCharacter(
    accountId: string,
    playerName: string,
    empire: 'SHINSOO' | 'CHUNJO' | 'JINNO',
  ) {
    // map 1 SHINSOO
    // map 2 CHUNJO
    // map 3 JINNO

    let mapIndex = '0',
      x = '0',
      y = '0';

    if (empire === 'SHINSOO') {
      mapIndex = '0';
      x = '459770';
      y = '953980';
    } else if (empire === 'CHUNJO') {
      mapIndex = '21';
      x = '52043';
      y = '166304';
    } else if (empire === 'JINNO') {
      mapIndex = '41';
      x = '957291';
      y = '255221';
    } else {
      return false;
    }

    const player = await this.playerRepository.findOne({
      where: { account_id: accountId, name: playerName },
    });

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
    const player = await this.playerRepository.find({
      where: { account_id: userId },
      relations: {
        safebox: true,
      },
    });

    const playerIndex = await this.playerIndexRepository.findOne({
      where: { id: userId },
    });

    const players = player.map((res) => {
      return res.name;
    });

    const playtime = player.reduce((oldValue: any, newValue: any) => {
      return oldValue + newValue.playtime;
    }, 0);

    return {
      players: players,
      empire: playerIndex.empire,
      playtime: playtime,
      safebox_password: player[0].safebox,
    };
  }

  async getItemAttr() {
    return await this.itemAttrRepository.find();
  }

  async getItemAttrRare() {
    return await this.itemAttrRareRepository.find();
  }

  async top10Guilds() {
    const topGuilds = await this.guildRepository
      .createQueryBuilder('guild')
      .select([
        'guild.name',
        'guild.level',
        'guild.ladder_point',
        'player_index.empire AS empire',
        'player.name AS guild_leader',
      ])
      .leftJoin('guild.player', 'player')
      .leftJoin('player.playerIndex', 'player_index')
      .where("guild.name NOT LIKE '%[%' AND guild.name NOT LIKE '%]%'")
      .groupBy(
        'guild.name, guild.level, guild.ladder_point, player_index.empire, player.name',
      )
      .orderBy('guild.level', 'DESC')
      .addOrderBy('guild.ladder_point', 'DESC')
      .limit(10)
      .getRawMany();

    for (let i = 0; i < topGuilds.length; i++) {
      topGuilds[i].guild_ladder_point =
        topGuilds[i].guild_ladder_point.toLocaleString();
    }

    return topGuilds;
  }

  async top10Players() {
    /* const topPlayers = await this.playerRepository.find({
      where: { name: 'Zoeasy' },
      relations: { quests: true },
      
    });*/

    const topPlayers = await this.playerRepository
      .createQueryBuilder('player')
      .select([
        'player.name',
        'player.level',
        'player.playtime',
        'player.exp',
        'player.horse_level',
        'player_index.empire AS empire',
        'guild.name AS guild_name',
        `CONCAT('Βιολόγος ', MAX(collect_quest_lv)) AS highest_collect_quest_lv`,
      ])
      .leftJoin('player.guild', 'guild')
      .leftJoin('player.playerIndex', 'player_index')
      .leftJoin(
        (subQuery) =>
          subQuery
            .select([
              'dwPID',
              "REPLACE(SUBSTRING_INDEX(szName, '_', -1), 'lv', '') + 0 AS collect_quest_lv",
            ])
            .from(Quest, 'q')
            .where("q.szName LIKE 'collect_quest_lv%'"),
        'collect_quest_lv',
        'collect_quest_lv.dwPID = player.id',
      )
      .where("player.name NOT LIKE '%[%' AND player.name NOT LIKE '%]%'")
      .groupBy(
        'player.name, player.level, player.playtime, player_index.empire, guild.name',
      )
      .orderBy('player.level', 'DESC')
      .addOrderBy('MAX(collect_quest_lv)', 'DESC')
      .addOrderBy('player.playtime', 'DESC')
      .getRawMany();

    for (let i = 0; i < topPlayers.length; i++) {
      console.log(i);
      topPlayers[i].player_playtime =
        topPlayers[i].player_playtime.toLocaleString();

      topPlayers[i].player_exp = topPlayers[i].player_exp.toLocaleString();
    }
    return topPlayers;
  }

  async topPlayersRanklist(page: number) {
    const ITEMS_PER_PAGE = 50;

    const totalPlayers = await this.playerRepository.count({
      where: [{ name: Not(Like('%[%')) }, { name: Not(Like('%]%')) }],
    });

    if (page && page > 0 && page <= Math.ceil(totalPlayers / ITEMS_PER_PAGE)) {
      page = page;
    } else {
      page = 1;
    }

    const topPlayers = await this.playerRepository
      .createQueryBuilder('player')
      .select([
        'player.name as player_name',
        'player.level as player_level',
        'player.playtime as player_playtime',
        'player_index.empire AS empire',
        'guild.name AS guild_name',
        '(SELECT CONCAT("Βιολόγος ", COALESCE(MAX(CAST(SUBSTRING_INDEX(q.szName, "collect_quest_lv", -1) AS UNSIGNED)), -1)) FROM quest q WHERE q.dwPID = player.id AND q.szName LIKE "collect_quest_lv%") AS highest_collect_quest_lv',
      ])
      .leftJoin('player.guild', 'guild')
      .leftJoin('player.playerIndex', 'player_index')
      .where("player.name NOT LIKE '%[%' AND player.name NOT LIKE '%]%'")
      .groupBy(
        'player.name, player.level, player.playtime, player_index.empire, guild.name',
      )
      .orderBy('player.level', 'DESC')
      .addOrderBy(
        '(SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(quest.szName, "collect_quest_lv", -1) AS UNSIGNED)), -1) FROM quest WHERE quest.dwPID = player.id AND quest.szName LIKE "collect_quest_lv%")',
        'DESC',
      )
      .addOrderBy('player.playtime', 'DESC')
      .limit(10)
      .getRawMany();

    const formattedPlayers = topPlayers.map((player) => {
      return {
        ...player,
        exp: Number(player.exp).toLocaleString(),
        playtime: Number(player.playtime).toLocaleString(),
      };
    });

    const totalCount = totalPlayers;

    return {
      players: formattedPlayers,
      totalPlayers: totalCount,
      hasNextPage: ITEMS_PER_PAGE * page < totalCount,
      currentPage: page,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalCount / ITEMS_PER_PAGE),
    };
  }
}
