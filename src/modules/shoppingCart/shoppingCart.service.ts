import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AddProductInShoppingCartDto } from './dtos/addProductInShoppingCart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ShoppingCartEntity } from './shoppingCart.entity';
import { IsNull, Repository } from 'typeorm';
import { ShoppingCartProductEntity } from './shoppingCartProduct.entity';
import { ShoppingCartStatus } from './enums/shoppingCartStatus.enum';
import { RemoveProductInShoppingCartDto } from './dtos/removeProductInShoppingCart.dto';
import { ViewShoppingCartDto } from './dtos/viewShoppingCart.dto';
import { IAddProductInShoppingCartResponse } from './interfaces/addProductInShoppingCartResponse.interface';
import { IRemoveProductInShoppingCartResponse } from './interfaces/removeProductInShoppingCartResponse.interface';
import { IViewShoppingCartResponse } from './interfaces/viewShoppingCartResponse.interface';

@Injectable()
export class ShoppingCartService {
  constructor(
    @InjectRepository(ShoppingCartEntity)
    private shoppingCartRepository: Repository<ShoppingCartEntity>,
    @InjectRepository(ShoppingCartProductEntity)
    private shoppingCartProductRepository: Repository<ShoppingCartProductEntity>,
  ) {}

  async addProductInShoppingCart(
    data: AddProductInShoppingCartDto,
  ): Promise<InternalServerErrorException | IAddProductInShoppingCartResponse> {
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
        };
      }

      this.shoppingCartProductRepository.merge(shoppingCartProductExist, {
        quantity: shoppingCartProductExist.quantity + data.product.quantity,
        updatedAt: new Date(),
      });

      await this.shoppingCartProductRepository.save(shoppingCartProductExist);

      return {
        message: 'Added product in shopping cart',
      };
    } catch (error) {
      return new InternalServerErrorException(error.message);
    }
  }

  async removeProductInShoppingCart(
    data: RemoveProductInShoppingCartDto,
  ): Promise<
    | BadRequestException
    | InternalServerErrorException
    | IRemoveProductInShoppingCartResponse
  > {
    try {
      const shoppingCartInProgress = await this.shoppingCartRepository.findOne({
        where: {
          userId: data.userId,
          status: ShoppingCartStatus.IN_PROGRESS,
          deletedAt: IsNull(),
        },
      });

      if (!shoppingCartInProgress)
        return new BadRequestException(
          'Not found shopping cart for this user id',
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
        return new BadRequestException(
          'Not found product id in the shopping cart for this user id',
        );

      if (shoppingCartProducts.quantity < data.product.quantity)
        return new BadRequestException(
          'The quantity of the product requested for removal is greater than the quantity of the product in the shopping cart',
        );

      if (shoppingCartProducts.quantity === data.product.quantity) {
        await this.shoppingCartProductRepository.softDelete(
          shoppingCartProducts.id,
        );

        const products = await this.shoppingCartProductRepository.find({
          where: {
            shoppingCartId: shoppingCartInProgress.id,
            userId: data.userId,
          },
        });

        if (!products.length) {
          this.shoppingCartRepository.merge(shoppingCartInProgress, {
            status: ShoppingCartStatus.CANCELED,
            updatedAt: new Date(),
          });

          await this.shoppingCartProductRepository.save(shoppingCartInProgress);
        }
        return {
          message: 'Removed product from the shopping cart',
        };
      }

      this.shoppingCartProductRepository.merge(shoppingCartProducts, {
        quantity: shoppingCartProducts.quantity - data.product.quantity,
        updatedAt: new Date(),
      });

      await this.shoppingCartProductRepository.save(shoppingCartProducts);

      return {
        message: 'Removed product from the shopping cart',
      };
    } catch (error) {
      return new InternalServerErrorException(error.message);
    }
  }

  async viewShoppingCart(
    data: ViewShoppingCartDto,
  ): Promise<
    | BadRequestException
    | InternalServerErrorException
    | IViewShoppingCartResponse
  > {
    try {
      const shoppingCartInProgress = await this.shoppingCartRepository.findOne({
        where: {
          userId: data.userId,
          status: ShoppingCartStatus.IN_PROGRESS,
          deletedAt: IsNull(),
        },
      });

      if (!shoppingCartInProgress)
        return new BadRequestException(
          'Not exist shopping cart from this user id',
        );

      const shoppingCartProducts =
        await this.shoppingCartProductRepository.find({
          where: {
            userId: data.userId,
            shoppingCartId: shoppingCartInProgress.id,
            deletedAt: IsNull(),
          },
        });

      const productArray = [];
      let totalPrice = 0;
      let totalQuantity = 0;

      for (const shoppingCartProduct of shoppingCartProducts) {
        totalPrice += shoppingCartProduct.price * shoppingCartProduct.quantity;
        totalQuantity += shoppingCartProduct.quantity;
        productArray.push({
          productId: shoppingCartProduct.productId,
          price: shoppingCartProduct.price,
          quantity: shoppingCartProduct.quantity,
        });
      }

      return {
        shoppingCart: {
          shoppingCartId: shoppingCartInProgress.id,
          userId: data.userId,
          totalPrice,
          totalQuantity,
          products: productArray,
        },
      };
    } catch (error) {
      return new InternalServerErrorException(error.message);
    }
  }
}
