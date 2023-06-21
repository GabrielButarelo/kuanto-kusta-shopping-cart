import { RemoveProductInShoppingCartProductDto } from '../dtos/removeProductInShoppingCartProduct.dto';

export interface IRemoveProductInShoppingCart {
  userId: string;
  product: RemoveProductInShoppingCartProductDto;
}
