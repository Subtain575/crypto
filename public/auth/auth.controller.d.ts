import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos/register.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<any>;
    login(loginDto: LoginDto): Promise<any>;
    protectedRoute(): Promise<{
        message: string;
    }>;
    protectedUserRoute(): Promise<{
        message: string;
    }>;
    findAll(req: any): Promise<import("./entities/user.entity").UserDocument[]>;
    findOne(id: string, req: any): Promise<import("./entities/user.entity").UserDocument>;
    update(id: string, dto: UpdateUserDto, req: any): Promise<import("./entities/user.entity").UserDocument>;
    delete(id: string, req: any): Promise<import("./entities/user.entity").UserDocument>;
}
