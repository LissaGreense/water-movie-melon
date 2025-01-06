import { AxiosRequestConfig } from "axios";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../constants/paths.ts";

const USER_KEY = "username";
const CSR_KEY = "csrftoken";

const cookies = new Cookies();

export const getUsername = (): string | null => {
  return localStorage.getItem(USER_KEY);
};

export const getCSRToken = (): string | undefined => {
  return cookies.get(CSR_KEY);
};
export const setUsername = (username: string) => {
  localStorage.setItem(USER_KEY, username);
};

export const clearUser = () => {
  localStorage.removeItem(USER_KEY);
};

export const getAuthHeadersConfig = (
  includeCSRF: boolean,
): AxiosRequestConfig => {
  const headers = {
    User: getUsername(),
    "Access-Control-Allow-Origin": "*",
  };

  if (includeCSRF) {
    headers["X-CSRFToken"] = getCSRToken();
  }

  return {
    headers: headers,
    withCredentials: true,
  } as AxiosRequestConfig;
};
