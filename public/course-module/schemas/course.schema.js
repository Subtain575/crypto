"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseSchema = void 0;
const mongoose_1 = require("mongoose");
exports.CourseSchema = new mongoose_1.default.Schema({
    title: String,
    description: String,
    level: String,
    videos: [String],
}, { timestamps: true });
//# sourceMappingURL=course.schema.js.map