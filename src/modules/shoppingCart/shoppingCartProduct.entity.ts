import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { IShoppingCartProductEntity } from './interfaces/shoppingCartProductEntity.interface';

@Entity()
export class ShoppingCartProductEntity implements IShoppingCartProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shoppingCartId: number;

  @Column()
  productId: string;

  @Column()
  userId: string;

  @Column()
  price: number;

  @Column()
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  constructor(shoppingCartProduct?: Partial<ShoppingCartProductEntity>) {
    this.id = shoppingCartProduct?.id;
    this.shoppingCartId = shoppingCartProduct?.shoppingCartId;
    this.productId = shoppingCartProduct?.productId;
    this.userId = shoppingCartProduct?.userId;
    this.price = shoppingCartProduct?.price;
    this.quantity = shoppingCartProduct?.quantity;
    this.createdAt = shoppingCartProduct?.createdAt;
    this.updatedAt = shoppingCartProduct?.updatedAt;
    this.deletedAt = shoppingCartProduct?.deletedAt;
  }
}
