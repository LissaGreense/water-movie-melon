import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Question, Token } from "../../types/internal/authentication.ts";
import { ResultResponse } from "../../types/internal/common.ts";
import { DEFAULT_BACKEND_URL } from "../../constants/defaults.ts";
import { getAuthHeadersConfig, getCSRToken } from "../../utils/accessToken.ts";

const backend_url = import.meta.env.VITE_APP_BACKEND_URL || DEFAULT_BACKEND_URL;
const login_endpoint = "/movies/login/";
const logout_endpoint = "/movies/logout/";
const register_endpoint = "/movies/register/";
const register_question_endpoint = "/movies/registerQuestion/";

export async function login(
  username: string,
  password: string,
): Promise<Token> {
  const data = {
    username: username,
    password: password,
  };
  const config = {
    withCredentials: true,
    headers: {
      "X-CSRFToken": getCSRToken(),
    },
  };

  const response = await axios.post<Token>(
    backend_url + login_endpoint,
    data,
    config,
  );

  return response.data as Token;
}

export async function logout(): Promise<AxiosResponse> {
  const config: AxiosRequestConfig = getAuthHeadersConfig(true);

  return await axios.post(backend_url + logout_endpoint, null, config);
}

export async function register(
  username: string,
  password: string,
  answer: string,
): Promise<ResultResponse> {
  const data = {
    username: username,
    password: password,
    answer: answer,
  };
  const config = {
    withCredentials: true,
    headers: {
      "X-CSRFToken": getCSRToken(),
    },
  };
  const response = await axios.post(
    backend_url + register_endpoint,
    data,
    config,
  );

  return response.data;
}

export async function getRegisterQuestion(): Promise<Question> {
  const response = await axios.get<Question>(
    backend_url + register_question_endpoint,
  );

  return response.data as Question;
}
