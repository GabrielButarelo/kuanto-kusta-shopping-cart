import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ShoppingCartStatus } from './enums/shoppingCartStatus.enum';

@Entity()
export class ShoppingCartEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({
    enum: [ShoppingCartStatus.CANCELED, ShoppingCartStatus.IN_PROGRESS],
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
