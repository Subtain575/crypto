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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyController = void 0;
const common_1 = require("@nestjs/common");
const reply_service_1 = require("./reply.service");
const create_reply_dto_1 = require("./dto/create-reply.dto");
let ReplyController = class ReplyController {
    replyService;
    constructor(replyService) {
        this.replyService = replyService;
    }
    create(dto) {
        return this.replyService.create(dto);
    }
    findByTicket(ticketId) {
        return this.replyService.findByTicket(ticketId);
    }
};
exports.ReplyController = ReplyController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reply_dto_1.CreateReplyDto]),
    __metadata("design:returntype", void 0)
], ReplyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('ticket/:ticketId'),
    __param(0, (0, common_1.Param)('ticketId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReplyController.prototype, "findByTicket", null);
exports.ReplyController = ReplyController = __decorate([
    (0, common_1.Controller)('replies'),
    __metadata("design:paramtypes", [reply_service_1.ReplyService])
], ReplyController);
//# sourceMappingURL=reply.controller.js.map