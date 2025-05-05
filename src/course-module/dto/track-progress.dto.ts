// src/course/dto/track-progress.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TrackProgressDto {
  @ApiProperty()
  videoIndex: number;

  @ApiProperty()
  completed: boolean;
}
