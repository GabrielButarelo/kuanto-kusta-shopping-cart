import { EventPattern, Payload } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { ShoppingCartService } from './shoppingCart.service';
import { AddProductInShoppingCartDto } from './dtos/addProductInShoppingCart.dto';
import { RemoveProductInShoppingCartDto } from './dtos/removeProductInShoppingCart.dto';
import { ViewShoppingCartDto } from './dtos/viewShoppingCart.dto';

export class ShoppingCartController {
  constructor(
    @Inject(ShoppingCartService)
    private readonly shoppingCartService: ShoppingCartService,
  ) {}

  @EventPattern('add_product_in_shopping_cart')
  async addProductInShoppingCart(@Payload() data: AddProductInShoppingCartDto) {
    return await this.shoppingCartService.addProductInShoppingCart(data);
  }

  @EventPattern('remove_product_in_shopping_cart')
  async removeProductInShoppingCart(
    @Payload() data: RemoveProductInShoppingCartDto,
  ) {
    return await this.shoppingCartService.removeProductInShoppingCart(data);
  }

  @EventPattern('view_shopping_cart')
  async viewShoppingCart(@Payload() data: ViewShoppingCartDto) {
    return await this.shoppingCartService.viewShoppingCart(data);
  }
}
