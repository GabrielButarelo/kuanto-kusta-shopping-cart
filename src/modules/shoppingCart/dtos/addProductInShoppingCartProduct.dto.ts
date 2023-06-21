import { IsNotEmpty } from 'class-validator';
import { IAddProductInShoppingCartProduct } from '../interfaces/addProductInShoppingCartProduct.interface';

export class AddProductInShoppingCartProductDto
  implements IAddProductInShoppingCartProduct
{
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  price: number;
}
