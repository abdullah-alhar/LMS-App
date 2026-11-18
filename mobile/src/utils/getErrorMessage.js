export default function getErrorMessage(error, fallback) {
  const serverMessage = error?.response?.data?.message;
  if (serverMessage) return serverMessage;

  const detail = error?.message;
  return detail ? `${fallback}: ${detail}` : fallback;
}
