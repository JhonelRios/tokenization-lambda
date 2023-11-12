import { z } from 'zod';

export const CommercePkSchema = z
  .string()
  .startsWith('pk', { message: 'Commerce key invalid format' });
