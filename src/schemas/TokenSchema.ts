import { z } from 'zod';

export const TokenSchema = z.string().length(16, { message: 'Token length must be 16 characters' });
