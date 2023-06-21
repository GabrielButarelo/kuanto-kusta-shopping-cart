import { Module } from '@nestjs/common';
import { ShoppingCartModule } from './modules/shoppingCart/shoppingCart.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'KuantoKusta@2023',
      database: 'kuanto_kusta',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ShoppingCartModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
