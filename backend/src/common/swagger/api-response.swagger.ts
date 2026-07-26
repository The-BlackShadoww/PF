import { ApiProperty } from '@nestjs/swagger';

export class ApiMeta {
  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  timestamp!: string;
}

export class ApiWrappedResponse<T> {
  @ApiProperty()
  data!: T;

  @ApiProperty({ type: ApiMeta })
  meta!: ApiMeta;
}

export class ApiErrorResponse {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiProperty({ example: 'req_abc123xyz' })
  requestId!: string;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  timestamp!: string;
}
