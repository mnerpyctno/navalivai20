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
    const errorMessage = data?.error?.message || data?.error || 'Неизвестная ошибка';
    
    switch (status) {
      case 401:
        throw new MoySkladAuthError(errorMessage);
      case 400:
        throw new MoySkladValidationError(errorMessage, data);
      case 404:
        throw new MoySkladNotFoundError(errorMessage);
      case 429:
        throw new MoySkladError('Превышен лимит запросов', status);
      default:
        throw new MoySkladServerError(errorMessage);
    }
  } else if (error.request) {
    throw new MoySkladError('Нет ответа от сервера. Проверьте подключение к интернету.');
  } else {
    throw new MoySkladError(error.message || 'Произошла неизвестная ошибка');
  }
}