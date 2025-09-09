import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCategoryDto } from './Dto/create-category.dto';
import { UpdateCategoryDto } from './Dto/update-category.dto';
import { CategoryService } from './category.service';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle catégorie' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'La catégorie a été créée avec succès.',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les catégories' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste de toutes les catégories.',
  })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(":id")
  getStoreCategory(@Param("id") id: string ){
    return this.categoryService.getStoreCategory(id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une catégorie par son ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'La catégorie a été trouvée.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Catégorie introuvable.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une catégorie par son ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'La catégorie a été mise à jour avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Catégorie introuvable.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une catégorie par son ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'La catégorie a été supprimée avec succès.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Catégorie introuvable.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.remove(id);
  }
}
