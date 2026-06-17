import { SetMetadata } from '@nestjs/common';
import { ADMIN_ONLY_KEY } from './roles.guard';

export const AdminOnly = () => SetMetadata(ADMIN_ONLY_KEY, true);