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
  Param,
  NotFoundException,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './Dto/create-address.dto';
import { UpdateAddressDto } from './Dto/update-address.dto';
import { RequestWithUser } from 'src/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req: RequestWithUser,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    const userId = req.user.id;
    return this.addressService.create(userId, createAddressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findOne(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.addressService.findOneByUserId(userId);
  }

  @Get(':id')
  async findOneAddress(@Param('id') id: string) {
    const address = await this.addressService.findOneById(id);
    if (!address) {
      throw new NotFoundException(`Address with id ${id} not found.`);
    }
    return address;
  }


  @UseGuards(JwtAuthGuard)
  @Patch('me')
  update(
    @Req() req: RequestWithUser,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const userId = req.user.id;
    return this.addressService.update(userId, updateAddressDto);
  }
}
