export interface IShoppingCartProductEntity {
  id: number;
  shoppingCartId: number;
  productId: string;
  userId: string;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
