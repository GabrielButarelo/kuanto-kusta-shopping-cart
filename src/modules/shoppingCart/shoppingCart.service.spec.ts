import { getRepositoryToken } from '@nestjs/typeorm';
import { ShoppingCartService } from './shoppingCart.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingCartEntity } from './shoppingCart.entity';
import { ShoppingCartProductEntity } from './shoppingCartProduct.entity';
import { ShoppingCartStatus } from './enums/shoppingCartStatus.enum';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

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
    quantity: 1,
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
});
