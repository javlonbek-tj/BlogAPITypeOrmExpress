import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import Model from './base.entity';
import { User } from './user.entity';

@Entity('tokens')
export class Token extends Model {
  @Column()
  refreshToken: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.token)
  user: User;
}
