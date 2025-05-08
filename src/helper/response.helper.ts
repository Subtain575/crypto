import { BaseResponseDto } from '../dto/base-response.dto';

export function successResponse<T>(
  data: T,
  message = 'Success',
): BaseResponseDto<T> {
  return {
    status: 200,
    message,
    data,
  };
}
