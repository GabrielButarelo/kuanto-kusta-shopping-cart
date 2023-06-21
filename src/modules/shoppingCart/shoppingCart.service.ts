import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AddProductInShoppingCartDto } from './dtos/addProductInShoppingCart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ShoppingCartEntity } from './shoppingCart.entity';
import { IsNull, Repository } from 'typeorm';
import { ShoppingCartProductEntity } from './shoppingCartProduct.entity';
import { ShoppingCartStatus } from './enums/shoppingCartStatus.enum';
import { RemoveProductInShoppingCartDto } from './dtos/removeProductInShoppingCart.dto';

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

      let shoppingCartProductExist =
        await this.shoppingCartProductRepository.findOne({
          where: {
            shoppingCartId: shoppingCartInProgress.id,
            userId: data.userId,
            productId: data.product.productId,
            price: data.product.price,
            deletedAt: IsNull(),
          },
        });

      if (!shoppingCartProductExist) {
        shoppingCartProductExist =
          await this.shoppingCartProductRepository.save({
            userId: data.userId,
            shoppingCartId: shoppingCartInProgress.id,
            quantity: data.product.quantity,
            productId: data.product.productId,
            price: data.product.price,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

        return {
          message: 'Added product in shopping cart',
          data: {
            ...shoppingCartProductExist,
          },
        };
      }

      const updateShoppingCartProduct = await this.shoppingCartProductRepository
        .createQueryBuilder()
        .update(ShoppingCartProductEntity)
        .set({
          quantity: shoppingCartProductExist.quantity + data.product.quantity,
          updatedAt: new Date(),
        })
        .where('id = :id', { id: shoppingCartProductExist.id })
        .execute();

      return {
        message: 'Added product in shopping cart',
        data: {
          ...updateShoppingCartProduct,
        },
      };
    } catch (error) {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeProductInShoppingCart(data: RemoveProductInShoppingCartDto) {
    try {
      const shoppingCartInProgress = await this.shoppingCartRepository.findOne({
        where: {
          userId: data.userId,
          status: ShoppingCartStatus.IN_PROGRESS,
          deletedAt: IsNull(),
        },
      });

      if (!shoppingCartInProgress)
        return new HttpException(
          'Not found shopping cart for this user id',
          HttpStatus.BAD_REQUEST,
        );

      const shoppingCartProducts =
        await this.shoppingCartProductRepository.findOne({
          where: {
            userId: data.userId,
            productId: data.product.productId,
            price: data.product.price,
            deletedAt: IsNull(),
          },
        });

      if (!shoppingCartProducts)
        return new HttpException(
          'Not found product id in the shopping cart for this user id',
          HttpStatus.BAD_REQUEST,
        );

      if (shoppingCartProducts.quantity < data.product.quantity)
        return new HttpException(
          'The quantity of the product requested for removal is greater than the quantity of the product in the shopping cart',
          HttpStatus.BAD_REQUEST,
        );

      if (shoppingCartProducts.quantity === data.product.quantity) {
        await this.shoppingCartProductRepository
          .createQueryBuilder()
          .delete()
          .from(ShoppingCartProductEntity)
          .where('id = :id', { id: shoppingCartProducts.id })
          .execute();

        const products = await this.shoppingCartProductRepository.find({
          where: {
            shoppingCartId: shoppingCartInProgress.id,
            userId: data.userId,
          },
        });

        if (!products.length) {
          await this.shoppingCartRepository
            .createQueryBuilder()
            .update(ShoppingCartEntity)
            .set({
              status: ShoppingCartStatus.CANCELED,
            })
            .where('id = :id', { id: shoppingCartInProgress.id })
            .execute();
        }
        return {
          message: 'Removed product from the shopping cart',
        };
      }

      await this.shoppingCartProductRepository
        .createQueryBuilder()
        .update(ShoppingCartProductEntity)
        .set({
          quantity: shoppingCartProducts.quantity - data.product.quantity,
          updatedAt: new Date(),
        })
        .where('id = :id', { id: shoppingCartProducts.id })
        .execute();

      return {
        message: 'Removed product from the shopping cart',
      };
    } catch (error) {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
