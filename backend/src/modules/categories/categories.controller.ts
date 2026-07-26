import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { ApiErrorResponse } from '../../common/swagger/api-response.swagger';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({
    summary: 'List all categories',
    description: 'Returns all income and expense categories for the user, ordered by type then sort order. Includes both default (system) and user-created categories.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category list',
    schema: {
      example: {
        data: [{ id: '...', name: 'Groceries', type: 'expense', color: '#dc2626', icon: 'shopping-cart', isDefault: true, sortOrder: 0 }],
        meta: { timestamp: '...' },
      },
    },
  })
  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.categoriesService.findAll(user.id);
  }

  @ApiOperation({
    summary: 'Create a category',
    description: 'Creates a new user-defined category. The name must be unique per type per user.',
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created' })
  @ApiResponse({ status: 400, description: 'Category with this name and type already exists', type: ApiErrorResponse })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(user.id, dto);
  }

  @ApiOperation({
    summary: 'Update a category',
    description: 'Updates a category name, color, icon, or sort order. The type field cannot be changed after creation.',
  })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 404, description: 'Category not found', type: ApiErrorResponse })
  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(user.id, id, dto);
  }

  @ApiOperation({
    summary: 'Delete a category',
    description: 'Soft-deletes a user-created category. Default categories cannot be deleted. Existing transactions retain their category reference for historical accuracy.',
  })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted',
    schema: { example: { data: { success: true }, meta: { timestamp: '...' } } },
  })
  @ApiResponse({ status: 403, description: 'Cannot delete a default category', type: ApiErrorResponse })
  @ApiResponse({ status: 404, description: 'Category not found', type: ApiErrorResponse })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.remove(user.id, id);
  }
}
