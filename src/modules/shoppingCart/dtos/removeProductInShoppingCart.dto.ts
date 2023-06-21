import { IsNotEmpty, ValidateNested } from 'class-validator';
import { AddProductInShoppingCartProductDto } from './addProductInShoppingCartProduct.dto';
import { IRemoveProductInShoppingCart } from '../interfaces/removeProductInShoppingCart.interface';
import { Type } from 'class-transformer';

export class RemoveProductInShoppingCartDto
  implements IRemoveProductInShoppingCart
{
  @IsNotEmpty()
  userId: string;

  @ValidateNested({ each: true })
  @Type(() => AddProductInShoppingCartProductDto)
  product: AddProductInShoppingCartProductDto;
}
