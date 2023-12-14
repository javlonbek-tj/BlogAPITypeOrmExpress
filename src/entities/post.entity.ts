import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import Model from './base.entity';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Category } from './category.entity';

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

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @ManyToMany(() => Category, (category) => category.posts)
  @JoinTable({ name: 'post_categories' })
  categories: Category[];
}
