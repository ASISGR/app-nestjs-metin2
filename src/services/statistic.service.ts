import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { Guild } from 'src/entities/guild.entity';
import { Item } from 'src/entities/item.entity';
import { Player } from 'src/entities/player.entity';
import { PlayerIndex } from 'src/entities/playerIndex.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(Player) private playerRepository: Repository<Player>,
    @InjectRepository(PlayerIndex)
    private playerIndexRepository: Repository<PlayerIndex>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    @InjectRepository(Guild) private guildRepository: Repository<Guild>,
  ) {}

  async sumAccountsLength(): Promise<string> {
    return (await this.accountRepository.count()).toLocaleString();
  }

  async sumAccountsPerKingdom(): Promise<Object> {
    const result = await this.playerIndexRepository
      .createQueryBuilder()
      .select('COUNT(CASE WHEN empire = 1 THEN 1 END)', 'SHINSOO')
      .addSelect('COUNT(CASE WHEN empire = 2 THEN 1 END)', 'CHUNJO')
      .addSelect('COUNT(CASE WHEN empire = 3 THEN 1 END)', 'JINNO')
      .getRawOne();

    const formattedResult = {
      SHINSOO: result.SHINSOO.toLocaleString(),
      CHUNJO: result.CHUNJO.toLocaleString(),
      JINNO: result.JINNO.toLocaleString(),
    };

    return formattedResult;
  }

  async sumOfCommunityItems(): Promise<string> {
    return (await this.itemRepository.count()).toLocaleString();
  }

  async sumOfPlayersOnline(): Promise<string> {
    const currentTime = new Date();
    const minusTime = new Date(currentTime.getTime() - 600000); // 600000 -> 10 Minutes | 300.000 -> 5 Minutes

    const result = await this.playerRepository
      .createQueryBuilder()
      .select('COUNT(name)', 'onlinePlayers')
      .where('last_play > :minusTime', { minusTime })
      .getRawOne();

    return result.onlinePlayers;
  }

  async sumOfPlayersOnline24(): Promise<string> {
    const currentTime = new Date();
    const minusTime = new Date(currentTime.getTime() - 86400000); // 86400000 -> 24 Hours

    const result = await this.playerRepository
      .createQueryBuilder()
      .select('COUNT(name)', 'onlinePlayers24')
      .where('last_play > :minusTime', { minusTime })
      .getRawOne();

    return result.onlinePlayers24;
  }

  async sumOfGuilds(): Promise<string> {
    return (await this.guildRepository.count()).toLocaleString();
  }

  async sumOfPlayers(): Promise<string> {
    return (await this.playerRepository.count()).toLocaleString();
  }

  async sumOfGold(): Promise<string> {
    return (await this.playerRepository.sum('gold')).toLocaleString();
  }
}
