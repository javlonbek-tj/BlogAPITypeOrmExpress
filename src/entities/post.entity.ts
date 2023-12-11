import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import Model from './base.entity';
import { User } from './user.entity';

@Entity('posts')
export class Post extends Model {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'userId' })
  user: User;
}
