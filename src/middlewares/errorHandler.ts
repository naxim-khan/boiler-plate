// simplified example
export default function errorHandler(err: any, req: any, res: any, next: any) {
  const status = err.status || 500;
  const body = {
    message: status === 500 ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  };
  res.status(status).json(body);
}
