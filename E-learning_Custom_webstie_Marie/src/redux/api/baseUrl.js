/**
 * Backend origin only (no /api/v1). Set via env so deploy = env change + rebuild.
 * Example: https://mohaimin8005.sobhoy.com  or  http://10.10.5.76:8005
 */
const url = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8005'
).replace(/\/$/, '');

export default url;
