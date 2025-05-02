"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCourseModuleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_course_dto_1 = require("./create-course.dto");
class UpdateCourseModuleDto extends (0, swagger_1.PartialType)(create_course_dto_1.CreateCourseDto) {
}
exports.UpdateCourseModuleDto = UpdateCourseModuleDto;
//# sourceMappingURL=update-course.dto.js.map