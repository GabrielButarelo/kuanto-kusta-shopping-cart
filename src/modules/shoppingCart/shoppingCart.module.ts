import { Module } from '@nestjs/common';
import { ShoppingCartController } from './shoppingCart.controller';
import { ShoppingCartService } from './shoppingCart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingCartEntity } from './shoppingCart.entity';
import { ShoppingCartProductEntity } from './shoppingCartProduct.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShoppingCartEntity, ShoppingCartProductEntity]),
  ],
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService],
})
export class ShoppingCartModule {}
