import axios from "axios";
import {Question, Token} from "../../types/internal/authentication.ts";

const backend_url = 'http://localhost:8000';
const login_endpoint = '/movies/login';
const register_endpoint = '/movies/register';
const register_question_endpoint = '/movies/registerQuestion';


export async function login(username: string, password: string): Promise<Token> {
  const data = {
    username: username,
    password: password
  }
  try {
    const response = await axios.post<Token>(backend_url + login_endpoint, data);
    return response.data as Token;
  } catch (error) {
    return {"token": ""};
  }
}

export async function register(username: string, password: string, answer: string) {
  const data = {
    username: username,
    password: password,
    answer: answer
  }
  try {
    const response = await axios.post(backend_url + register_endpoint, data);

    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getRegisterQuestion(): Promise<Question> {
  try {
    const response = await axios.get<Question>(backend_url + register_question_endpoint);

    return response.data as Question;
  } catch (error) {

    return error.data;
  }
}