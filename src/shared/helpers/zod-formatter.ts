import { ValidationError } from '@/shared/protocols'
import { badRequest } from '@/shared/helpers/http-helper'

export const formatZodError = (zodError: any): ValidationError[] => {
  const errors: ValidationError[] = []

  const processErrors = (obj: any, path: string = '') => {
    if (obj._errors && obj._errors.length > 0) {
      errors.push({
        message: obj._errors[0],
        field: path || 'root',
        received: obj._errors[1] || 'unknown'
      })
    }

    for (const [key, value] of Object.entries(obj)) {
      if (key !== '_errors' && typeof value === 'object' && value !== null) {
        const newPath = path ? `${path}.${key}` : key
        processErrors(value, newPath)
      }
    }
  }

  processErrors(zodError.format())
  return errors
}

export const zodFormatter = (validation: any) => {
  const errors = formatZodError(validation.error)
  return badRequest(errors)
}
