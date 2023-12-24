import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import Model from './base.entity';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity('comments')
export class Comment extends Model {
  @Column()
  description: string;

  @ManyToOne(() => Post, post => post.comments)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  userId: string;

  @Column()
  postId: string;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'userId' })
  user: User;
}
