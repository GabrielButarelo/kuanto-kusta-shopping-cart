import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ShoppingCartStatus } from './enums/shoppingCartStatus.enum';
import { IShoppingCartEntity } from './interfaces/shoppingCartEntity.interface';

@Entity()
export class ShoppingCartEntity implements IShoppingCartEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({
    enum: [ShoppingCartStatus.CANCELED, ShoppingCartStatus.IN_PROGRESS],
  })
  status: ShoppingCartStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  constructor(shoppingCart?: Partial<ShoppingCartEntity>) {
    this.id = shoppingCart?.id;
    this.userId = shoppingCart?.userId;
    this.status = shoppingCart?.status;
    this.createdAt = shoppingCart?.createdAt;
    this.updatedAt = shoppingCart?.updatedAt;
    this.deletedAt = shoppingCart?.deletedAt;
  }
}
