import { NextApiResponse } from 'next';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown, res: NextApiResponse) => {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code
    });
  }

  return res.status(500).json({
    error: 'Internal Server Error',
    message: error instanceof Error ? error.message : 'Unknown error occurred'
  });
};
