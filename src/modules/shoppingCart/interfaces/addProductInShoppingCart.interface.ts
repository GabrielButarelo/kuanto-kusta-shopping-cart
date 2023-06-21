import { AddProductInShoppingCartProductDto } from '../dtos/addProductInShoppingCartProduct.dto';

export interface IAddProductInShoppingCart {
  userId: string;
  product: AddProductInShoppingCartProductDto;
}
