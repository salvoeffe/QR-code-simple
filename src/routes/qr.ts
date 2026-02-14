import { Request, Response, NextFunction } from 'express';
import QRCode from 'qrcode';
import { validationResult, ValidationError } from 'express-validator';
import { AppError } from '../errors.js';

function formatValidationDetails(errors: ValidationError[]): unknown {
  return errors.map((e) => ({
    field: 'path' in e ? e.path : 'text',
    message: e.msg,
  }));
}

export async function getQr(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(
      new AppError('Invalid text: check the "text" query parameter.', 400, 'VALIDATION_ERROR', {
        details: formatValidationDetails(errors.array()),
      })
    );
    return;
  }

  const text = (req.query.text as string)?.trim();
  if (!text) {
    next(
      new AppError(
        'Missing required parameter: "text". Use ?text=your-link-or-message',
        400,
        'MISSING_TEXT'
      )
    );
    return;
  }

  try {
    const png = await QRCode.toBuffer(text, {
      type: 'png',
      margin: 2,
      width: 256,
      errorCorrectionLevel: 'M',
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(png);
  } catch (err) {
    next(err);
  }
}

export async function postQr(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(
      new AppError('Invalid text in request body.', 400, 'VALIDATION_ERROR', {
        details: formatValidationDetails(errors.array()),
      })
    );
    return;
  }

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text) {
    next(
      new AppError(
        'Missing required field: "text". Send a JSON body: { "text": "your-link-or-message" }',
        400,
        'MISSING_TEXT'
      )
    );
    return;
  }

  try {
    const png = await QRCode.toBuffer(text, {
      type: 'png',
      margin: 2,
      width: 256,
      errorCorrectionLevel: 'M',
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(png);
  } catch (err) {
    next(err);
  }
}
