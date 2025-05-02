export class CreateCourseDto {
  title: string;
  description: string;
  level: string;
  videos: string[];
}
export class TrackProgressDto {
  completedVideos: string[];
}
