import { IsNotEmpty } from 'class-validator';
import { IRemoveProductInShoppingCartProduct } from '../interfaces/removeProductInShoppingCartProduct.interface';

export class RemoveProductInShoppingCartProductDto
  implements IRemoveProductInShoppingCartProduct
{
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  quantity: number;
}
