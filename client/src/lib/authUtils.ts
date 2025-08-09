export function isUnauthorizedError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    /^401: .*unauthorized/.test(error.message) ||
    message.includes('unauthorized') ||
    message.includes('401') ||
    message.includes('not authenticated') ||
    message.includes('invalid token') ||
    message.includes('no access token')
  );
}
