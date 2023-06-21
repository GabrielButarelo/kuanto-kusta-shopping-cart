import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AddProductInShoppingCartDto } from './dtos/addProductInShoppingCart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ShoppingCartEntity } from './shoppingCart.entity';
import { IsNull, Repository } from 'typeorm';
import { ShoppingCartProductEntity } from './shoppingCartProduct.entity';
import { ShoppingCartStatus } from './enums/shoppingCartStatus.enum';

@Injectable()
export class ShoppingCartService {
  constructor(
    @InjectRepository(ShoppingCartEntity)
    private shoppingCartRepository: Repository<ShoppingCartEntity>,
    @InjectRepository(ShoppingCartProductEntity)
    private shoppingCartProductRepository: Repository<ShoppingCartProductEntity>,
  ) {}

  async addProductInShoppingCart(data: AddProductInShoppingCartDto) {
    try {
      let shoppingCartInProgress = await this.shoppingCartRepository.findOne({
        where: {
          userId: data.userId,
          status: ShoppingCartStatus.IN_PROGRESS,
          deletedAt: IsNull(),
        },
      });

      if (!shoppingCartInProgress) {
        shoppingCartInProgress = await this.shoppingCartRepository.save({
          userId: data.userId,
          status: ShoppingCartStatus.IN_PROGRESS,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      const shoppingCartProduct = await this.shoppingCartProductRepository.save(
        {
          userId: data.userId,
          shoppingCartId: shoppingCartInProgress.id,
          quantity: data.product.quantity,
          productId: data.product.productId,
          price: data.product.price,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );

      return {
        message: 'Added product in shopping cart',
        data: {
          ...shoppingCartProduct,
        },
      };
    } catch (error) {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
