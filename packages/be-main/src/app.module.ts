import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import databaseConfig from './config/database.config'
import { User } from './entities'
import { Bug } from './entities'
import { OperationLog } from './entities'
import { TimeRule } from './entities'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { BugModule } from './bug/bug.module'
import { AdminModule } from './admin/admin.module'
import { OrderModule } from './order/order.module'
import { SeedService } from './database/seed.service'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const database = config.get<string>('dbDatabase') || 'bug_platform'
        return {
          type: 'mysql',
          host: config.get('dbHost') || 'localhost',
          port: config.get('dbPort') || 3306,
          username: config.get('dbUsername') || 'root',
          password: config.get('dbPassword') ?? '',
          database,
          entities: [User, Bug, OperationLog, TimeRule],
          synchronize: true,
          charset: 'utf8mb4',
        }
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, TimeRule]),
    UserModule,
    AuthModule,
    BugModule,
    AdminModule,
    OrderModule,
  ],
  providers: [AppService, SeedService],
})
export class AppModule {}
