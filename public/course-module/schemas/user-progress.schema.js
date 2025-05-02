"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProgressSchema = void 0;
const mongoose_1 = require("mongoose");
exports.UserProgressSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    courseId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Course' },
    completedVideos: [String],
    progress: Number,
}, { timestamps: true });
//# sourceMappingURL=user-progress.schema.js.map