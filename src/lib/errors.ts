export class MoySkladError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'MoySkladError';
  }
}

export class MoySkladAuthError extends MoySkladError {
  constructor(message: string = 'Ошибка авторизации в МойСклад') {
    super(message, 401);
    this.name = 'MoySkladAuthError';
  }
}

export class MoySkladValidationError extends MoySkladError {
  constructor(message: string, data?: any) {
    super(message, 400, data);
    this.name = 'MoySkladValidationError';
  }
}

export class MoySkladNotFoundError extends MoySkladError {
  constructor(message: string = 'Ресурс не найден') {
    super(message, 404);
    this.name = 'MoySkladNotFoundError';
  }
}

export class MoySkladServerError extends MoySkladError {
  constructor(message: string = 'Ошибка сервера МойСклад') {
    super(message, 500);
    this.name = 'MoySkladServerError';
  }
}

export function handleMoySkladError(error: any): never {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        throw new MoySkladAuthError(data?.error || 'Ошибка авторизации');
      case 400:
        throw new MoySkladValidationError(data?.error || 'Ошибка валидации', data);
      case 404:
        throw new MoySkladNotFoundError(data?.error || 'Ресурс не найден');
      default:
        throw new MoySkladServerError(data?.error || 'Ошибка сервера');
    }
  } else if (error.request) {
    throw new MoySkladError('Нет ответа от сервера');
  } else {
    throw new MoySkladError(error.message || 'Неизвестная ошибка');
  }
} 