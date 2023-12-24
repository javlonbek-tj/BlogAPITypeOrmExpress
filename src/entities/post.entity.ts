import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
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

  @ManyToOne(() => User, user => user.posts)
  user: User;

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  @ManyToMany(() => User, user => user.likedPosts)
  likedByUsers: User[];

  @ManyToMany(() => User, user => user.disLikedPosts)
  disLikedByUsers: User[];

  @ManyToMany(() => User, user => user.viewedPosts)
  viewedByUsers: User[];

  @ManyToMany(() => Category, category => category.posts)
  @JoinTable({ name: 'post_categories' })
  categories: Category[];

  get likedUserIds(): string[] {
    return this.likedByUsers ? this.likedByUsers.map(user => user.id) : [];
  }

  get dislikedUserIds(): string[] {
    return this.disLikedByUsers ? this.disLikedByUsers.map(user => user.id) : [];
  }

  get viewedPostUserIds(): string[] {
    return this.viewedByUsers ? this.viewedByUsers.map(user => user.id) : [];
  }

  toJSON() {
    const { id, title, description, image, likedUserIds, dislikedUserIds, viewedPostUserIds } =
      this;

    return {
      id,
      title,
      description,
      image,
      likedUserIds,
      dislikedUserIds,
      viewedPostUserIds,
    };
  }
}
