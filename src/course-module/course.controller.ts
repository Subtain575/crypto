import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { TrackProgressDto } from './dto/track-progress.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Types } from 'mongoose';

export interface RequestWithUser extends Request {
  user: {
    _id: string;
    email: string;
    role: string;
    // add other JWT payload fields if needed
  };
}

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  getAll() {
    return this.courseService.getAllCourses();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.courseService.getCourseById(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateCourseDto, @Req() req: RequestWithUser) {
    const adminId = req.user._id;
    return this.courseService.createCourse(dto, adminId);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: CreateCourseDto) {
    return this.courseService.updateCourse(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) {
    return this.courseService.deleteCourse(id);
  }

  @Post('progress')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Track course module progress' })
  trackProgress(
    @Request() req: Request & { user: { _id: string } },
    @Body() dto: TrackProgressDto,
  ) {
    const updatedDto = {
      ...dto,
      user: new Types.ObjectId(req.user._id),
    };

    return this.courseService.trackProgress(updatedDto);
  }
}
