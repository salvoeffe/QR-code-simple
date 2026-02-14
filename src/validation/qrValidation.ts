import { body, query, ValidationChain } from 'express-validator';
import { config } from '../config.js';

const maxLength = config.maxTextLength;

export const qrQueryValidation: ValidationChain[] = [
  query('text')
    .trim()
    .notEmpty()
    .withMessage('text is required')
    .isLength({ max: maxLength })
    .withMessage(`text must be at most ${maxLength} characters`),
];

export const qrBodyValidation: ValidationChain[] = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('text is required')
    .isLength({ max: maxLength })
    .withMessage(`text must be at most ${maxLength} characters`),
];
