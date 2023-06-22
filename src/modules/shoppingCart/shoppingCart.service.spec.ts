import { getRepositoryToken } from '@nestjs/typeorm';
import { ShoppingCartService } from './shoppingCart.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingCartEntity } from './shoppingCart.entity';
import { ShoppingCartProductEntity } from './shoppingCartProduct.entity';
import { ShoppingCartStatus } from './enums/shoppingCartStatus.enum';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

const userId = '101010';

const findOneWithResultShoppingCart: ShoppingCartEntity =
  new ShoppingCartEntity({
    id: 1,
    status: ShoppingCartStatus.IN_PROGRESS,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const findOneWithResultShoppingCartProduct: ShoppingCartProductEntity =
  new ShoppingCartProductEntity({
    id: 1,
    userId,
    productId: '102030',
    price: 100,
    quantity: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('ShoppingCartService', () => {
  let shoppingCartService: ShoppingCartService;
  let shoppingCartRepository: Repository<ShoppingCartEntity>;
  let shoppingCartProductRepository: Repository<ShoppingCartProductEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShoppingCartService,
        {
          provide: getRepositoryToken(ShoppingCartEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue(findOneWithResultShoppingCart),
            save: jest.fn().mockResolvedValue(findOneWithResultShoppingCart),
            merge: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ShoppingCartProductEntity),
          useValue: {
            findOne: jest
              .fn()
              .mockResolvedValue(findOneWithResultShoppingCartProduct),
            save: jest
              .fn()
              .mockResolvedValue(findOneWithResultShoppingCartProduct),
            merge: jest.fn(),
            softDelete: jest.fn(),
            find: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    shoppingCartService = module.get<ShoppingCartService>(ShoppingCartService);
    shoppingCartRepository = module.get<Repository<ShoppingCartEntity>>(
      getRepositoryToken(ShoppingCartEntity),
    );
    shoppingCartProductRepository = module.get<
      Repository<ShoppingCartProductEntity>
    >(getRepositoryToken(ShoppingCartProductEntity));
  });

  it('should be defined', () => {
    expect(shoppingCartService).toBeDefined();
    expect(shoppingCartRepository).toBeDefined();
    expect(shoppingCartProductRepository).toBeDefined();
  });

  describe('addProductInShoppingCart', () => {
    it('should add product to the shopping cart with an existing product in the shopping cart', async () => {
      const result = await shoppingCartService.addProductInShoppingCart({
        userId,
        product: {
          quantity: 1,
          price: 100,
          productId: '102030',
        },
      });

      expect(result).toEqual({ message: 'Added product in shopping cart' });
      expect(shoppingCartRepository.findOne).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.findOne).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.merge).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.save).toBeCalledTimes(1);
    });

    it('should add product to the shopping cart with an not existing product in the shopping cart', async () => {
      jest
        .spyOn(shoppingCartProductRepository, 'findOne')
        .mockResolvedValue(null);

      const result = await shoppingCartService.addProductInShoppingCart({
        userId,
        product: {
          quantity: 1,
          price: 100,
          productId: '102040',
        },
      });

      expect(result).toEqual({ message: 'Added product in shopping cart' });
      expect(shoppingCartRepository.findOne).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.findOne).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.merge).toBeCalledTimes(0);
      expect(shoppingCartProductRepository.save).toBeCalledTimes(1);
    });

    it('should add product to the shopping cart with not existing product and not have shopping cart in progress', async () => {
      jest.spyOn(shoppingCartRepository, 'findOne').mockResolvedValue(null);

      jest
        .spyOn(shoppingCartProductRepository, 'findOne')
        .mockResolvedValue(null);

      const result = await shoppingCartService.addProductInShoppingCart({
        userId,
        product: {
          quantity: 1,
          price: 100,
          productId: '102040',
        },
      });

      expect(result).toEqual({ message: 'Added product in shopping cart' });
      expect(shoppingCartRepository.findOne).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.findOne).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.merge).toBeCalledTimes(0);
      expect(shoppingCartProductRepository.save).toBeCalledTimes(1);
    });

    it('should throw new error', async () => {
      jest
        .spyOn(shoppingCartRepository, 'findOne')
        .mockRejectedValueOnce(new Error());

      const result = await shoppingCartService.addProductInShoppingCart({
        userId,
        product: {
          quantity: 1,
          price: 100,
          productId: '102040',
        },
      });

      expect(result).toEqual(new InternalServerErrorException());
    });
  });

  describe('removeProductInShoppingCart', () => {
    it('should remove the product to the shopping cart with an existing product in the shopping cart with less quantity than the existing one', async () => {
      const result = await shoppingCartService.removeProductInShoppingCart({
        userId,
        product: {
          quantity: 1,
          price: 100,
          productId: '102030',
        },
      });

      expect(result).toEqual({
        message: 'Removed product from the shopping cart',
      });
      expect(shoppingCartRepository.findOne).toBeCalledTimes(1);
      expect(shoppingCartRepository.merge).toBeCalledTimes(0);
      expect(shoppingCartProductRepository.findOne).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.merge).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.save).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.softDelete).toBeCalledTimes(0);
      expect(shoppingCartProductRepository.find).toBeCalledTimes(0);
    });

    it('should remove the product to the shopping cart with an existing product in the shopping cart with the same quantity as the existing one', async () => {
      const result = await shoppingCartService.removeProductInShoppingCart({
        userId,
        product: {
          quantity: 10,
          price: 100,
          productId: '102030',
        },
      });

      expect(result).toEqual({
        message: 'Removed product from the shopping cart',
      });
      expect(shoppingCartRepository.findOne).toBeCalledTimes(1);
      expect(shoppingCartRepository.merge).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.findOne).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.merge).toBeCalledTimes(0);
      expect(shoppingCartProductRepository.save).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.softDelete).toBeCalledTimes(1);
      expect(shoppingCartProductRepository.find).toBeCalledTimes(1);
    });

    it('should remove the product to the shopping cart with an existing product in the shopping cart with quantity greater than the existing one', async () => {
      const result = await shoppingCartService.removeProductInShoppingCart({
        userId,
        product: {
          quantity: 100,
          price: 100,
          productId: '102030',
        },
      });

      expect(result).toEqual(
        new BadRequestException(
          'The quantity of the product requested for removal is greater than the quantity of the product in the shopping cart',
        ),
      );
    });

    it('should not found shopping cart id from user id incorrect', async () => {
      jest.spyOn(shoppingCartRepository, 'findOne').mockResolvedValue(null);

      const result = await shoppingCartService.removeProductInShoppingCart({
        userId: '1223',
        product: {
          quantity: 10,
          price: 100,
          productId: '102030',
        },
      });

      expect(result).toEqual(
        new BadRequestException('Not found shopping cart for this user id'),
      );
    });

    it('should not found product id in shopping cart', async () => {
      jest
        .spyOn(shoppingCartProductRepository, 'findOne')
        .mockResolvedValue(null);

      const result = await shoppingCartService.removeProductInShoppingCart({
        userId,
        product: {
          quantity: 10,
          price: 100,
          productId: '102040',
        },
      });

      expect(result).toEqual(
        new BadRequestException(
          'Not found product id in the shopping cart for this user id',
        ),
      );
    });

    it('should internal server error', async () => {
      jest
        .spyOn(shoppingCartRepository, 'findOne')
        .mockRejectedValueOnce(new Error());
      const result = await shoppingCartService.removeProductInShoppingCart({
        userId,
        product: {
          quantity: 10,
          price: 100,
          productId: '102030',
        },
      });

      expect(result).toEqual(new InternalServerErrorException());
    });
  });

  describe('viewShoppingCart', () => {
    it('should list all products from the shopping cart user', async () => {
      jest.spyOn(shoppingCartProductRepository, 'find').mockResolvedValue([
        new ShoppingCartProductEntity({
          id: 1,
          userId,
          productId: '102030',
          price: 100,
          quantity: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        new ShoppingCartProductEntity({
          id: 2,
          userId,
          productId: '102040',
          price: 100,
          quantity: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ]);

      const result = await shoppingCartService.viewShoppingCart({
        userId,
      });

      const expectResult = {
        shoppingCart: {
          shoppingCartId: 1,
          totalPrice: 2000,
          totalQuantity: 20,
          userId: '101010',
          products: [
            {
              price: 100,
              productId: '102030',
              quantity: 10,
            },
            {
              price: 100,
              productId: '102040',
              quantity: 10,
            },
          ],
        },
      };

      expect(result).toEqual(expectResult);
      expect(shoppingCartRepository.findOne).toBeCalledTimes(1);
      expect(shoppingCartRepository.merge).toBeCalledTimes(0);
      expect(shoppingCartProductRepository.findOne).toBeCalledTimes(0);
      expect(shoppingCartProductRepository.merge).toBeCalledTimes(0);
      expect(shoppingCartProductRepository.save).toBeCalledTimes(0);
      expect(shoppingCartProductRepository.softDelete).toBeCalledTimes(0);
      expect(shoppingCartProductRepository.find).toBeCalledTimes(1);
    });

    it('should not found shopping cart from user', async () => {
      jest.spyOn(shoppingCartRepository, 'findOne').mockResolvedValue(null);

      const result = await shoppingCartService.viewShoppingCart({
        userId,
      });

      expect(result).toEqual(
        new BadRequestException('Not exist shopping cart from this user id'),
      );
    });

    it('should internal server error', async () => {
      jest
        .spyOn(shoppingCartRepository, 'findOne')
        .mockRejectedValueOnce(new Error());
      const result = await shoppingCartService.viewShoppingCart({
        userId,
      });

      expect(result).toEqual(new InternalServerErrorException());
    });
  });
});
