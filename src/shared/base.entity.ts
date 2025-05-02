import { ApiProperty } from '@nestjs/swagger';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @CreateDateColumn()
  @ApiProperty()
  public created_at: Date;

  @UpdateDateColumn()
  @ApiProperty()
  public updated_at: Date;

  @DeleteDateColumn()
  @ApiProperty()
  public deletedat: Date;
}
