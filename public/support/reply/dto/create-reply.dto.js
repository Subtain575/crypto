"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReplyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const role_enum_1 = require("../../../auth/enums/role.enum");
class CreateReplyDto {
    ticketId;
    userId;
    role;
    message;
}
exports.CreateReplyDto = CreateReplyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ticketId123',
        description: 'ID of the ticket being replied to',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReplyDto.prototype, "ticketId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'userId123',
        description: 'ID of the user/admin replying',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReplyDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: role_enum_1.Role.USER,
        enum: role_enum_1.Role,
        description: 'Role of the person replying',
    }),
    (0, class_validator_1.IsEnum)(role_enum_1.Role),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReplyDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'We are looking into your issue.',
        description: 'Reply message content',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReplyDto.prototype, "message", void 0);
//# sourceMappingURL=create-reply.dto.js.map