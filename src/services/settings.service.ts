import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { Guild } from 'src/entities/guild.entity';
import { Item } from 'src/entities/item.entity';
import { Player } from 'src/entities/player.entity';
import { PlayerIndex } from 'src/entities/playerIndex.entity';
import { Settings } from 'src/entities/settings.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(Player) private playerRepository: Repository<Player>,
    @InjectRepository(PlayerIndex)
    private playerIndexRepository: Repository<PlayerIndex>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    @InjectRepository(Guild) private guildRepository: Repository<Guild>,
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
  ) {}

  public async registerActive(active: '1' | '0') {
    const homepage = await this.settingsRepository.find();

    homepage[0].register = Number(active);
    return await this.settingsRepository.save(homepage);
  }

  public async registerEmailVerification(active: '1' | '0') {
    const homepage = await this.settingsRepository.find();

    homepage[0].registerEmailVerification = Number(active);
    return await this.settingsRepository.save(homepage);
  }

  public async getRegisterEmailVerification() {
    const registerEmailVerification = await this.settingsRepository.find();
    return registerEmailVerification[0].registerEmailVerification;
  }

  public async getRegisterEnableSetting() {
    const registerEnable = await this.settingsRepository.find();
    return registerEnable[0].register;
  }
}
