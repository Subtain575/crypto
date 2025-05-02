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
exports.TicketService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ticket_schema_1 = require("./schemas/ticket.schema");
let TicketService = class TicketService {
    ticketModel;
    constructor(ticketModel) {
        this.ticketModel = ticketModel;
    }
    create(createTicketDto) {
        return this.ticketModel.create(createTicketDto);
    }
    async findAll(status) {
        const filter = status ? { status } : {};
        return this.ticketModel.find(filter).sort({ createdAt: -1 });
    }
    async findByUser(userId) {
        return this.ticketModel.find({ userId }).sort({ createdAt: -1 });
    }
    async findOne(id) {
        const ticket = await this.ticketModel.findById(id);
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        return ticket;
    }
    async updateStatus(id, status) {
        return this.ticketModel.findByIdAndUpdate(id, { status }, { new: true });
    }
    async addReply(id, updateDto) {
        const ticket = await this.ticketModel.findById(id);
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        if (!updateDto.userId || !updateDto.message)
            throw new common_1.NotFoundException('Missing required fields');
        ticket.replies.push({
            userId: updateDto.userId,
            message: updateDto.message,
            createdAt: new Date(),
        });
        await ticket.save();
        return ticket;
    }
    async remove(id) {
        return this.ticketModel.findByIdAndDelete(id);
    }
};
exports.TicketService = TicketService;
exports.TicketService = TicketService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(ticket_schema_1.Ticket.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TicketService);
//# sourceMappingURL=ticket.service.js.map