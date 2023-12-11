import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import Model from './base.entity';
import { Post } from './post.entity';
import { Comment } from './comment.entity';

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

  @Column()
  email: string;

  @Column()
  profilPhoto: string;

  @Column()
  password: string;

  @Column()
  isBlocked: boolean;

  @ManyToOne(() => User, (user) => user.viewers)
  @JoinColumn({ name: 'viewerId' })
  viewer: User;

  @ManyToOne(() => User, (user) => user.viewer)
  viewers: User[];

  @ManyToOne(() => User, (user) => user.followers)
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @ManyToOne(() => User, (user) => user.follower)
  followers: User[];

  @ManyToOne(() => User, (user) => user.followings)
  @JoinColumn({ name: 'followingId' })
  following: User;

  @ManyToOne(() => User, (user) => user.following)
  followings: User[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @ManyToOne(() => User, (user) => user.blockings)
  @JoinColumn({ name: 'blockingId' })
  blocking: User;

  @ManyToOne(() => User, (user) => user.follower)
  blockings: User[];

  userAward;
}
