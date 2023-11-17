import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { Downloadlinks } from 'src/entities/downloadLinks.entity';
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
    @InjectRepository(Downloadlinks)
    private downloadsRepository: Repository<Downloadlinks>,
  ) {}

  public async changeRegisterStatus(active: boolean) {
    const registerStatus = await this.settingsRepository
      .createQueryBuilder('settings')
      .update()
      .set({ register: active ? 1 : 0 })
      .execute();

    return registerStatus;
  }

  public async changeRegisterEmailVerificationStatus(active: boolean) {
    const registerEmailStatus = await this.settingsRepository
      .createQueryBuilder('settings')
      .update()
      .set({ registerEmailVerification: active ? 1 : 0 })
      .execute();

    return registerEmailStatus;
  }

  public async isRegisterEmailVerification() {
    const isEmailVerificationEnable = await this.settingsRepository
      .createQueryBuilder('settings')
      .select('settings.registerEmailVerification')
      .getRawOne();

    return isEmailVerificationEnable.settings_registerEmailVerification > 0;
  }

  public async isRegisterEnableSetting() {
    const isRegisterEnable = await this.settingsRepository
      .createQueryBuilder('settings')
      .select('settings.register')
      .getRawOne();

    console.log(isRegisterEnable);

    return isRegisterEnable.settings_register > 0;
  }

  public async getDownloadLink() {
    const links = await this.downloadsRepository.createQueryBuilder().getMany();

    return links;
  }
}
