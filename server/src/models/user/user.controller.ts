import { Controller, Get, UseGuards, Req, Put, UsePipes, Body, Post, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Request } from 'express';
import * as _ from 'lodash';

//* Internal import
import { ChangePasswordDto, vChangePasswordDto } from './dto/changePassword.dto';
import { JoiValidatorPipe } from '../../common/validation/validator.pipe';
import { AuthService } from '../../auth/auth.service';
import { UserAuth } from '../../auth/auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto, vUpdateUserDto } from './dto/updateUser.dto';
import { ApiResponse } from '../../common/interfaces/ApiResponse';
import { UpdateEmailDto, vUpdateEmailDto } from './dto/updateEmail.dto';
import { CreateUserDto, vCreateUserDto } from '../../auth/dto/createUser.dto';
import { RedisService } from '../../providers/redis/redis.service';
import { MailService } from '../../providers/mail/mail.service';
import { otpGenerator } from '../../common/helper/otpGenerator';

import { TokenService } from '../../providers/token/token.service';
import { User } from './entities/user.entity';
import { ErrorResponse } from '../../common/interfaces/ErrorResponse';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from '../../providers/aws/aws.service';
import { File } from '../../common/interfaces/File';

@Controller('user')
export class UserController {
        constructor(
                private readonly redisService: RedisService,
                private readonly userService: UserService,
                private readonly authService: AuthService,

                private readonly tokenService: TokenService,
                private readonly awsService: AwsService,
        ) {}

        @Get('')
        @UseGuards(UserAuth)
        async getUserInfo(@Req() req: Request): Promise<ApiResponse<any>> {
                const user = await this.userService.getOneFindField('_id', req.user._id);

                return { data: _.pick(user, ['username', 'fullName', 'email', 'avatarUrl', 'isPremium', 'role']) };
        }

        @Put('/password')
        @UseGuards(UserAuth)
        @UsePipes(new JoiValidatorPipe(vChangePasswordDto))
        async changePassword(@Body() body: ChangePasswordDto, @Req() req: Request): Promise<ApiResponse<void>> {
                const encryptedPassword = await this.authService.encryptString(body.newPassword, 10);
                const user = await this.userService.getOneFindField('_id', req.user._id);
                user.password = encryptedPassword;

                await this.userService.updateOrSave(user);

                return { message: 'Updated user information' };
        }

        @Put('')
        @UseGuards(UserAuth)
        @UsePipes(new JoiValidatorPipe(vUpdateUserDto))
        async updateUser(@Body() body: UpdateUserDto, @Req() req: Request): Promise<ApiResponse<void>> {
                const user = await this.userService.getOneFindField('_id', req.user._id);
                user.fullName = body.fullName;

                await this.userService.updateOrSave(user);
                return { message: 'Updated user information' };
        }

        @Post('/avatar')
        @UseGuards(UserAuth)
        @UseInterceptors(FileInterceptor('avatar'))
        async uploadAvatar(@UploadedFile() file: File, @Req() req: Request): Promise<ApiResponse<void>> {
                if (!file) throw ErrorResponse.send({ details: { avatar: 'is not found' } }, 'BadRequestException');
                if (!this.awsService.checkFileExtension(file)) throw ErrorResponse.send({ message: 'File is not supported' }, 'BadRequestException');
                if (!this.awsService.checkFileSize(file, 1)) throw ErrorResponse.send({ details: { avatar: 'is too big ( limit size: 1MB)' } }, 'BadRequestException');

                const filePath = `${req.user._id}/avatar/ `;
                const fileName = await this.awsService.uploadFile(file, filePath, 'user');
                if (!fileName) throw ErrorResponse.send({ details: { avatar: 'Something went wrong' } }, 'InternalServerErrorException');

                req.user.avatarUrl = fileName;
                await this.userService.updateOrSave(req.user);

                return { message: 'Upload avatar success' };
        }

        @Put('/email/:key')
        async resetPasswordHandler(@Param('key') key): Promise<ApiResponse<void>> {
                const findRedisKey = await this.redisService.getByKey(key);
                if (!findRedisKey) throw ErrorResponse.send({ details: { otp: 'is invalid' } }, 'BadRequestException');

                const decode = this.tokenService.decodeJWT<User>(findRedisKey);
                const user = await this.userService.getOneFindField('_id', decode._id);
                user.email = decode.email;

                await this.userService.updateOrSave(user);
                this.redisService.deleteByKey(key);
                return {
                        message: 'Update user success',
                };
        }

        @Put('/social-info')
        @UseGuards(UserAuth)
        @UsePipes(new JoiValidatorPipe(vCreateUserDto))
        async updateSocialInfo(@Body() body: CreateUserDto, @Req() req: Request): Promise<ApiResponse<void>> {
                const user = await this.userService.getOneFindField('_id', req.user._id);
                if (user.username != '') throw ErrorResponse.send({ details: { username: 'is already updated' } }, 'BadRequestException');

                const getUser = await this.userService.getOneFindField('username', body.username);
                if (getUser) throw ErrorResponse.send({ details: { username: 'is taken' } }, 'BadRequestException');

                user.username = body.username;
                user.password = await this.authService.encryptString(body.password, 10);
                user.fullName = body.fullName;
                await this.userService.updateOrSave(user);

                return { message: 'Updated user information' };
        }
}
