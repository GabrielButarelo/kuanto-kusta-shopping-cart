import { IsNotEmpty, ValidateNested } from 'class-validator';
import { IRemoveProductInShoppingCart } from '../interfaces/removeProductInShoppingCart.interface';
import { Type } from 'class-transformer';
import { RemoveProductInShoppingCartProductDto } from './removeProductInShoppingCartProduct.dto';

export class RemoveProductInShoppingCartDto
  implements IRemoveProductInShoppingCart
{
  @IsNotEmpty()
  userId: string;

  @ValidateNested({ each: true })
  @Type(() => RemoveProductInShoppingCartProductDto)
  product: RemoveProductInShoppingCartProductDto;
}
