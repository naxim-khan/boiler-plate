import type { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  code?: string;
  data: T | null;
  errors?: any;
  meta?: any; // pagination or extra info
}

export const successResponse = <T>(
  res: Response,
  message: string,
  data: T | null = null,
  statusCode = 200,
  meta?: any
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  code: string,
  errors?: any
) => {
  const response: ApiResponse = {
    success: false,
    message,
    code,
    data: null,
    errors: errors ? errors : undefined, // only send errors if explicitly provided
  };
  return res.status(statusCode).json(response);
};
