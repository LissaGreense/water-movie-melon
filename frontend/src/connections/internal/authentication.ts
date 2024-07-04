import axios from "axios";
import {Token} from "../../types/internal/authentication.ts";

const backend_url = 'http://localhost:8000';
const login_endpoint = '/movies/login';


export async function login(username: string, password: string): Promise<Token> {
  const data = {
    username: username,
    password: password
  }
  try {
    const response = await axios.post<Token>(backend_url + login_endpoint, data);
    return response.data;
  } catch (error) {
    console.error(error);
    return {"token": ""};
  }
}