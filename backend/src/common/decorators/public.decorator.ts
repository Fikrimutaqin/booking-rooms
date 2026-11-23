import { SetMetadata } from '@nestjs/common';

// Variable Is Public Key
export const IS_PUBLIC_KEY = 'isPublic';
// Decorator to mark route as public
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
