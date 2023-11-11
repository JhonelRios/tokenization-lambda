import { z } from 'zod';

function luhnAlgorithm(cardNumber: string): Boolean {
  let sum = 0;
  let shouldDouble = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = Number(cardNumber[i]);

    if (shouldDouble) {
      digit = digit * 2;

      if (digit > 9) digit = digit - 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble; // Alternate the doubling
  }

  // The card number is valid if the sum is a multiple of 10
  return sum % 10 === 0;
}

export const CardSchema = z.object({
  card_number: z
    .string()
    .min(13, { message: 'Card number must be at least 13 digits' })
    .max(16, { message: 'Card number must be no longer than 16 digits' })
    .refine(luhnAlgorithm, { message: 'Invalid card number' }),
  cvv: z
    .string()
    .min(3, { message: 'CVV must be at least 3 digits' })
    .max(4, { message: 'CVV must be no longer than 4 digits' }),
  expiration_month: z
    .string()
    .min(1, { message: 'Month must be at least 1 digit' })
    .max(2, { message: 'Month must be no longer than 2 digits' })
    .refine(val => Number(val) >= 1 && Number(val) <= 12, { message: 'Invalid month' }),
  expiration_year: z
    .string()
    .length(4, { message: 'Expiration year must be 4 digits' })
    .refine(
      val => {
        const currentYear = new Date().getFullYear();
        const year = Number(val);
        return year >= currentYear && year <= currentYear + 5;
      },
      { message: 'Invalid year' }
    ),
  email: z
    .string()
    .min(5, { message: 'Email must be at least 5 characters' })
    .max(100, { message: 'Email must be no longer than 100 characters' })
    .email({ message: 'Invalid email format' })
    .refine(val => /^(gmail\.com|hotmail\.com|yahoo\.es)$/.test(val.split('@')[1]), {
      message: 'Email domain must be gmail.com, hotmail.com, or yahoo.es',
    }),
});
