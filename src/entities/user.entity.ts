import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import Model from './base.entity';
import { Post } from './post.entity';
import { Comment } from './comment.entity';
import { Role } from './role.entity';
import { Token } from './token.entity';

export enum AwardEnumType {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
}

@Entity('users')
export class User extends Model {
  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  profilPhoto?: string;

  @Column()
  password: string;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ default: false })
  isActivated: boolean;

  @Column()
  activationCode?: string;

  @Column()
  activationCodeExpires?: BigInt;

  @Column()
  passwordChangedAt?: Date;

  @Column()
  passwordResetToken?: string;

  @Column()
  passwordResetExpires?: BigInt;

  @Column()
  lastPostDate?: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @OneToOne(() => Token, (token) => token.user, { nullable: true })
  @JoinColumn({ name: 'tokenId' })
  token: Token | null;

  @ManyToOne(() => User, (user) => user.viewers)
  @JoinColumn({ name: 'viewerId' })
  viewer: User;

  @OneToMany(() => User, (user) => user.viewer)
  viewers: User[];

  @ManyToOne(() => User, (user) => user.followers)
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @OneToMany(() => User, (user) => user.follower)
  followers: User[];

  @ManyToOne(() => User, (user) => user.followings)
  @JoinColumn({ name: 'followingId' })
  following: User;

  @OneToMany(() => User, (user) => user.following)
  followings: User[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @ManyToOne(() => User, (user) => user.blockings)
  @JoinColumn({ name: 'blockingId' })
  blocking: User;

  @OneToMany(() => User, (user) => user.blocking)
  blockings: User[];

  @Column({ type: 'enum', enum: AwardEnumType, default: AwardEnumType.BRONZE })
  userAward: string;
}
