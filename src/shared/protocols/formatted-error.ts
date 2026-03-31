export interface ValidationError {
  field: string;
  message: string;
  received: any;
}

export interface FormattedError {
  message: string;
  paramsError: {
    errors: ValidationError[];
  };
  extraData: object;
}
