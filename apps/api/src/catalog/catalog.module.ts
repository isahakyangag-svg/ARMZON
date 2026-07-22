import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CategoriesController } from './categories.controller.js';
import { AdminCategoriesController } from './admin-categories.controller.js';
import { AttributesService } from './attributes.service.js';
import { AdminAttributesController } from './admin-attributes.controller.js';
import { BrandsService } from './brands.service.js';
import { BrandsController } from './brands.controller.js';
import { AdminBrandsController } from './admin-brands.controller.js';
@Module({ controllers: [CategoriesController, AdminCategoriesController, AdminAttributesController, BrandsController, AdminBrandsController], providers: [CategoriesService, AttributesService, BrandsService], exports: [CategoriesService, AttributesService, BrandsService] })
export class CatalogModule {}
