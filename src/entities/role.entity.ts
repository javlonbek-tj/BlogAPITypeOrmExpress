import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import Model from './base.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role extends Model {
  @Column()
  value: string;

  @Column()
  description: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
