import { LoginDto, RegisterDto } from './dtos/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<any>;
    login(loginDto: LoginDto): Promise<any>;
    findAll(currentUser: any): Promise<UserDocument[]>;
    findOne(id: string, currentUser: any): Promise<UserDocument>;
    update(id: string, updateUserDto: UpdateUserDto, currentUser: any): Promise<UserDocument>;
    delete(id: string, currentUser: any): Promise<UserDocument>;
    private generateToken;
}
