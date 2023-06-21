import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class ShoppingCartProductEntity {
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
}
