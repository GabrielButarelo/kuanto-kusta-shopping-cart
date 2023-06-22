interface IViewShoppingCartResponseProducts {
  price: number;
  quantity: number;
  productId: string;
}

interface IViewShoppingCartResponseBody {
  shoppingCartId: number;
  totalPrice: number;
  totalQuantity: number;
  userId: string;
  products: IViewShoppingCartResponseProducts[];
}

export interface IViewShoppingCartResponse {
  shoppingCart: IViewShoppingCartResponseBody;
}
