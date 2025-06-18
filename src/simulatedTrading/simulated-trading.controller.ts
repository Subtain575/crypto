import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { SimulatedTradingService } from './simulated-trading.service';
import {
  ApiOperation,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { ExecuteTradeDto } from './dto/trade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

interface RequestWithUser extends Request {
  user?: {
    sub?: string;
    email?: string;
    role?: string;
  };
}

@ApiTags('Simulated Trading')
@Controller('api/trading')
export class SimulatedTradingController {
  constructor(
    private readonly simulatedTradingService: SimulatedTradingService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('buy')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Simulate a Buy Order' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ExecuteTradeDto })
  @UseInterceptors(FileInterceptor('image'))
  async buyStock(
    @Body() executeTradeDto: ExecuteTradeDto,
    @Request() req: RequestWithUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User ID not found in token');

    let imageUrl: string | undefined;
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploadResult.secure_url as string;
    }

    return this.simulatedTradingService.buySimulated(
      userId,
      executeTradeDto.symbol,
      executeTradeDto.quantity,
      executeTradeDto.price,
      imageUrl,
    );
  }

  @Post('sell')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Simulate a Sell Order' })
  @ApiBody({ type: ExecuteTradeDto })
  async sellStock(
    @Body()
    body: {
      symbol: string;
      quantity: number;
      price: number;
    },
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User ID not found in token');

    return this.simulatedTradingService.sellSimulated(
      userId,
      body.symbol.toUpperCase(),
      body.quantity,
      body.price,
    );
  }

  @Get('holdings')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Get user's current simulated holdings with market data",
  })
  async getHoldings(@Request() req: RequestWithUser) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User ID not found in token');
    return this.simulatedTradingService.getUserCurrentHoldings(userId);
  }

  @Get('history')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Get user's complete simulated trade history (buy/sell)",
  })
  async getTradeHistory(@Request() req: RequestWithUser) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User ID not found in token');
    return this.simulatedTradingService.getUserTradeHistory(userId);
  }
}
