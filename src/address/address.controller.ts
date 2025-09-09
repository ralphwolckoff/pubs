import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './Dto/create-address.dto';
import { UpdateAddressDto } from './Dto/update-address.dto';
import { RequestWithUser } from 'src/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('addresses')
@UseGuards(JwtAuthGuard) 
export class AddressController {
  constructor(private readonly addressService: AddressService) {}


  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: RequestWithUser, @Body() createAddressDto: CreateAddressDto) {
    const userId = req.user.id;
    return this.addressService.create(userId, createAddressDto);
  }


  @Get('me')
  findOne(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.addressService.findOneByUserId(userId);
  }


  @Patch('me')
  update(@Req() req: RequestWithUser, @Body() updateAddressDto: UpdateAddressDto) {
    const userId = req.user.id;
    return this.addressService.update(userId, updateAddressDto);
  }
}
