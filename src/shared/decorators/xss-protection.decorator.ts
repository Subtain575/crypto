import { Transform } from 'class-transformer';
import { applyDecorators } from '@nestjs/common';

export function SanitizeHtml() {
  return applyDecorators(
    Transform(({ value }) => {
      if (typeof value !== 'string') return value;

      // First, trim whitespace from beginning and end
      let sanitized = value.trim();

      // Handle SQL injection protection by removing single quotes
      sanitized = sanitized.replace(/'/g, '');

      // Remove HTML tags completely instead of converting to entities
      sanitized = sanitized.replace(/<[^>]*>?/gm, '');

      return sanitized;
    }),
  );
}
