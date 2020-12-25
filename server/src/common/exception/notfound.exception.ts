import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ResponseApi } from '../dto/response.dto';

@Catch(NotFoundException)
export class NotFoundApiHandler implements ExceptionFilter {
        catch(_: NotFoundException, host: ArgumentsHost) {
                const ctx = host.switchToHttp();
                const res = ctx.getResponse<Response>();
                const resApi: ResponseApi = {
                        data: null,
                        message: 'This method is undefined',
                };
                return res.send(resApi).status(HttpStatus.NOT_FOUND);
        }
}
