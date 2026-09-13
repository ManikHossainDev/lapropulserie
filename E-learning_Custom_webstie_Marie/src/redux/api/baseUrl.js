/**
 * Backend origin only (no /api/v1). Set via env so deploy = env change + rebuild.
 * Example: https://maniknew8080.sobhoy.com  or  http://10.10.5.76:8080
 */
const url = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8080'
).replace(/\/$/, '');

export default url;
