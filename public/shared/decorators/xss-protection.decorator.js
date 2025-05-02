"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizeHtml = SanitizeHtml;
const class_transformer_1 = require("class-transformer");
const common_1 = require("@nestjs/common");
function SanitizeHtml() {
    return (0, common_1.applyDecorators)((0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value !== 'string')
            return value;
        let sanitized = value.trim();
        sanitized = sanitized.replace(/'/g, '');
        sanitized = sanitized.replace(/<[^>]*>?/gm, '');
        return sanitized;
    }));
}
//# sourceMappingURL=xss-protection.decorator.js.map