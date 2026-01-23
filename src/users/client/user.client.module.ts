import { Module } from "@nestjs/common";
import { UsersClientController } from "./users.client.controller";
import { UsersClientService } from "./users.client.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { CommonModule } from "src/common/common-module";

@Module({
    imports: [
      CommonModule, 
      TypeOrmModule.forFeature([UserEntity]),
    ],
    controllers: [UsersClientController],
    providers: [UsersClientService],
  })
  export class UsersClientModule {}
  