import { IsNotEmpty } from 'class-validator';
import { IViewShoppingCart } from '../interfaces/viewShoppingCart.interface';

export class ViewShoppingCartDto implements IViewShoppingCart {
  @IsNotEmpty()
  userId: string;
}
