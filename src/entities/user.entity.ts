import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
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

  @Column({ type: 'varchar', nullable: true })
  profilPhoto: string | null;

  @Column()
  password: string;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ default: false })
  isActivated: boolean;

  @Column({ type: 'varchar', nullable: true })
  activationCode: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  activationCodeExpires: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  passwordChangedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  passwordResetToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  passwordResetExpires: Date | null;

  @Column({ type: 'varchar', nullable: true })
  lastPostDate: string | null;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @OneToOne(() => Token, token => token.user, { nullable: true })
  @JoinColumn({ name: 'tokenId' })
  token: Token | null;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'user_viewer',
    joinColumn: { name: 'userId' },
    inverseJoinColumn: { name: 'viewerId' },
  })
  viewers: User[];

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'user_followers',
    joinColumn: { name: 'userId' },
    inverseJoinColumn: { name: 'followerId' },
  })
  followers: User[];

  @Column({ default: true })
  canSeeFollowers: boolean;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'user_followings',
    joinColumn: { name: 'userId' },
    inverseJoinColumn: { name: 'followingId' },
  })
  followings: User[];

  @Column({ default: true })
  canSeeFollowings: boolean;

  @OneToMany(() => Post, post => post.user)
  posts: Post[];

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'user_blockings',
    joinColumn: { name: 'userId' },
    inverseJoinColumn: { name: 'blockingId' },
  })
  blockings: User[];

  @Column({ type: 'enum', enum: AwardEnumType, default: AwardEnumType.BRONZE })
  userAward: string;

  toJSON() {
    const {
      password,
      activationCode,
      activationCodeExpires,
      passwordChangedAt,
      passwordResetToken,
      passwordResetExpires,
      ...rest
    } = this;
    return rest;
  }
}
