import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface IBasicResponse<T> {
	message: string;
	count?: number;
	data?: T;
}

@Injectable()
export class BasicInterceptor<T>
	implements NestInterceptor<T, IBasicResponse<T>>
{
	intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<IBasicResponse<T>> {
		return next.handle().pipe(
			map((data: T) => {
				let count: number | undefined = undefined;
				if (Array.isArray(data)) count = data.length;
				const noData = typeof data == 'boolean';
				return {
					message: 'successful',
					count,
					data: noData ? undefined : data,
				};
			}),
		);
	}
}
