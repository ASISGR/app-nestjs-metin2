import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNewsDto, DeleteNewsDto, updateNewsDto } from 'src/dto/news.dto';
import { Account } from 'src/entities/account.entity';
import { Guild } from 'src/entities/guild.entity';
import { Item } from 'src/entities/item.entity';
import { News } from 'src/entities/news.entity';
import { Player } from 'src/entities/player.entity';
import { PlayerIndex } from 'src/entities/playerIndex.entity';
import { Email } from 'src/entities/serverAnnouncementMails.entity';
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
    @InjectRepository(Email) private emailAnnouncement: Repository<Email>,
  ) {}

  async createPost(Post: CreateNewsDto): Promise<any> {
    const post = await this.newsRepository
      .createQueryBuilder('news')
      .insert()
      .values({
        title: Post.title,
        postContent: Post.postContent,
        author: Post.author,
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

  async editPost(post: updateNewsDto): Promise<any> {
    const updatePost = await this.newsRepository
      .createQueryBuilder('news')
      .update()
      .set({
        author: post.author,
        postContent: post.postContent,
        updated_at: post.updated_at,
      })
      .where({ id: post.id })
      .execute();

    return updatePost;
  }

  async deletePost(post: DeleteNewsDto): Promise<any> {
    console.log(post.id);
    const deletePost = await this.newsRepository
      .createQueryBuilder('news')
      .delete()
      .where({ id: post.id })
      .execute();
    return deletePost;
  }

  async findAnnouncementEmails() {
    let emails = await this.emailAnnouncement
      .createQueryBuilder()
      .select(['email'])
      .execute();

    emails = emails.map((obj) => {
      return obj.email;
    });

    return emails;
  }
}
