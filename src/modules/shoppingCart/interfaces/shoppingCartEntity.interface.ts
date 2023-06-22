import { ShoppingCartStatus } from '../enums/shoppingCartStatus.enum';

export interface IShoppingCartEntity {
  id: number;
  userId: string;
  status: ShoppingCartStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
