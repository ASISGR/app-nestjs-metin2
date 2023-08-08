import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('account')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  login: string;

  @Column()
  password: string;

  @Column()
  real_name: string;

  @Column()
  social_id: string;

  @Column()
  email: string;

  @Column()
  phone1: string;

  @Column()
  phone2: string;

  @Column()
  address: string;

  @Column()
  zipcode: string;

  @Column()
  create_time: string;

  @Column()
  question1: string;

  @Column()
  answer1: string;

  @Column()
  question2: string;

  @Column()
  answer2: string;

  @Column()
  is_testor: string;

  @Column()
  status: string;

  @Column()
  securitycode: string;

  @Column()
  newsletter: string;

  @Column()
  empire: string;

  @Column()
  name_checked: string;

  @Column()
  availDt: string;

  @Column()
  mileage: string;

  @Column()
  cash: string;

  @Column()
  gold_expire: string;

  @Column()
  silver_expire: string;

  @Column()
  safebox_expire: string;

  @Column()
  autoloot_expire: string;

  @Column()
  fish_mind_expire: string;

  @Column()
  marriage_fast_expire: string;

  @Column()
  money_drop_rate_expire: string;

  @Column()
  ttl_cash: string;

  @Column()
  ttl_mileage: string;

  @Column()
  channel_company: string;

  @Column()
  last_play: string;

  @Column()
  coins: string;

  @Column()
  web_admin: string;

  @Column()
  web_ip: string;

  @Column()
  web_aktiviert: string;

  @Column()
  jcoins: string;

  @Column()
  deletion_token: string;

  @Column()
  passlost_token: string;

  @Column()
  email_token: string;

  @Column()
  new_email: string;

  @Column()
  cpu_id: string;

  @Column()
  hdd_model: string;

  @Column()
  machine_guid: string;

  @Column()
  mac_addr: string;

  @Column()
  hdd_serial: string;
}
