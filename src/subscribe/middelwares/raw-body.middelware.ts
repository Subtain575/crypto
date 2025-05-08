import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  async use(req: RawBodyRequest<Request>, res: Response, next: NextFunction) {
    const rawBody: unknown = req.body;

    if (!rawBody) {
      throw new BadRequestException('No webhook payload was provided.');
    }
    console.log('rawBody', rawBody);
    // Debug logging
    console.log('Webhook body type:', typeof rawBody);
    console.log('Is Buffer:', Buffer.isBuffer(rawBody));
    console.log('Is ReadableStream:', rawBody instanceof ReadableStream);

    try {
      let bodyBuffer: Buffer;

      if (Buffer.isBuffer(rawBody)) {
        bodyBuffer = rawBody;
      } else if (typeof rawBody === 'string') {
        bodyBuffer = Buffer.from(rawBody);
      } else if (rawBody instanceof Uint8Array) {
        bodyBuffer = Buffer.from(rawBody);
      } else if (rawBody instanceof ReadableStream) {
        // Handle ReadableStream - convert to buffer
        const reader = rawBody.getReader();
        const chunks: Uint8Array[] = [];
        console.log('reader', reader);
        let done = false;
        while (!done) {
          const result = await reader.read();
          const { value, done: isDone } = result as {
            value: Uint8Array | undefined;
            done: boolean;
          };
          if (isDone) {
            done = true;
          } else if (value) {
            chunks.push(value);
          }
        }
        console.log('chunks', chunks);
        // Concatenate all chunks
        const totalLength = chunks.reduce(
          (sum, chunk) => sum + chunk.length,
          0,
        );
        bodyBuffer = Buffer.concat(chunks, totalLength);
      } else if (typeof rawBody === 'object') {
        // Last resort - try to stringify
        bodyBuffer = Buffer.from(JSON.stringify(rawBody));
        console.warn(
          'Converting object to buffer - signature verification might fail',
        );
      } else {
        throw new BadRequestException(
          `Unsupported body type: ${typeof rawBody}`,
        );
      }
      console.log('bodyBuffer', bodyBuffer);
      // Attach the buffer to the request object
      req.rawBody = bodyBuffer;

      // Proceed to the next middleware or controller
      next();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Webhook error: ${errorMessage}`);
    }
  }
}
