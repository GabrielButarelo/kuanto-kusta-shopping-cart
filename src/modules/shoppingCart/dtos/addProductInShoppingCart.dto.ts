import { IsNotEmpty, ValidateNested } from 'class-validator';
import { AddProductInShoppingCartProductDto } from './addProductInShoppingCartProduct.dto';
import { IAddProductInShoppingCart } from '../interfaces/addProductInShoppingCart.interface';
import { Type } from 'class-transformer';

export class AddProductInShoppingCartDto implements IAddProductInShoppingCart {
  @IsNotEmpty()
  userId: string;

  @ValidateNested({ each: true })
  @Type(() => AddProductInShoppingCartProductDto)
  product: AddProductInShoppingCartProductDto;
}
