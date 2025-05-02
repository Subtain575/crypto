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
exports.TicketController = void 0;
const common_1 = require("@nestjs/common");
const ticket_service_1 = require("./ticket.service");
const create_ticket_dto_1 = require("./dto/create-ticket.dto");
const update_ticket_dto_1 = require("./dto/update-ticket.dto");
const ticket_status_enum_1 = require("./enum/ticket-status.enum");
const base_response_dto_1 = require("../../shared/dto/base-response.dto");
const swagger_1 = require("@nestjs/swagger");
let TicketController = class TicketController {
    ticketService;
    constructor(ticketService) {
        this.ticketService = ticketService;
    }
    async create(dto) {
        const newTicket = await this.ticketService.create(dto);
        return new base_response_dto_1.BaseResponseDto(201, 'Ticket created successfully', newTicket);
    }
    async findAll(status) {
        const tickets = await this.ticketService.findAll(status);
        return new base_response_dto_1.BaseResponseDto(200, 'Tickets fetched successfully', tickets);
    }
    async findByUser(userId) {
        const tickets = await this.ticketService.findByUser(userId);
        return new base_response_dto_1.BaseResponseDto(200, 'User tickets fetched successfully', tickets);
    }
    async findOne(id) {
        const ticket = await this.ticketService.findOne(id);
        return new base_response_dto_1.BaseResponseDto(200, 'Ticket fetched successfully', ticket);
    }
    async updateStatus(id, status) {
        const updated = await this.ticketService.updateStatus(id, status);
        return new base_response_dto_1.BaseResponseDto(200, 'Ticket status updated successfully', updated);
    }
    async addReply(id, dto) {
        const updated = await this.ticketService.addReply(id, dto);
        return new base_response_dto_1.BaseResponseDto(200, 'Reply added successfully', updated);
    }
    async remove(id) {
        const deleted = await this.ticketService.remove(id);
        return new base_response_dto_1.BaseResponseDto(200, 'Ticket deleted successfully', deleted);
    }
};
exports.TicketController = TicketController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Ticket fetched successfully',
        type: base_response_dto_1.BaseResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ticket_dto_1.CreateTicketDto]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tickets fetched successfully',
        type: base_response_dto_1.BaseResponseDto,
    }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User tickets fetched successfully',
        type: base_response_dto_1.BaseResponseDto,
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Ticket fetched successfully',
        type: base_response_dto_1.BaseResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Ticket status updated successfully',
        type: base_response_dto_1.BaseResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/reply'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reply added successfully',
        type: base_response_dto_1.BaseResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ticket_dto_1.UpdateTicketDto]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "addReply", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Ticket deleted successfully',
        type: base_response_dto_1.BaseResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketController.prototype, "remove", null);
exports.TicketController = TicketController = __decorate([
    (0, common_1.Controller)('tickets'),
    __metadata("design:paramtypes", [ticket_service_1.TicketService])
], TicketController);
//# sourceMappingURL=ticket.controller.js.map