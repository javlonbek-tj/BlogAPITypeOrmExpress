import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import Model from './base.entity';
import { Post } from './post.entity';

@Entity('categories')
export class Category extends Model {
  @Column()
  title: string;

  @ManyToMany(() => Post, (post) => post.categories)
  @JoinTable({ name: 'post_categories' })
  posts: Post[];
}
