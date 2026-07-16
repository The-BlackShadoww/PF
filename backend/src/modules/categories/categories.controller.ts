import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Find all categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully.' })
  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.categoriesService.findAll(user.id);
  }

  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(user.id, createCategoryDto);
  }

  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(user.id, id, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully.' })
  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.categoriesService.remove(user.id, id);
  }
}
