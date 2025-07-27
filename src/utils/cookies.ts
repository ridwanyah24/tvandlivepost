import Cookies from "js-cookie";
// Async function to create a 'name' cookieimport Cookies from 'js-cookie';

export function createCookie(
  name: string,
  value: string,
  options: Cookies.CookieAttributes = {}
) {
  Cookies.set(name, value, options);
}

export function clearCookie(name: string) {
  Cookies.remove(name);
}