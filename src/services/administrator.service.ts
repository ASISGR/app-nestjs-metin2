import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNewsDto } from 'src/dto/create-news.dto';
import { Account } from 'src/entities/account.entity';
import { Guild } from 'src/entities/guild.entity';
import { Item } from 'src/entities/item.entity';
import { News } from 'src/entities/news.entity';
import { Player } from 'src/entities/player.entity';
import { PlayerIndex } from 'src/entities/playerIndex.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdministratorService {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(Player) private playerRepository: Repository<Player>,
    @InjectRepository(PlayerIndex)
    private playerIndexRepository: Repository<PlayerIndex>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    @InjectRepository(Guild) private guildRepository: Repository<Guild>,
    @InjectRepository(News) private newsRepository: Repository<News>,
  ) {}

  async createPost(Post: CreateNewsDto): Promise<any> {
    console.log('service:', Post);
    const post = await this.newsRepository
      .createQueryBuilder('news')
      .insert()
      .values({
        title: Post.title,
        postContent: Post.postContent,
        author: Post.author,
        created_at: Post.created_at,
      })
      .execute();

    if (!post) return false;

    return post;
  }

  async findPosts(): Promise<any> {
    return await this.newsRepository
      .createQueryBuilder('news')
      .select([])
      .execute();
  }
}
