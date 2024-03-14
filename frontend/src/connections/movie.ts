import { Movie } from "../types/movie.ts";
import axios from "axios";

const backend_url = 'http://localhost:8000';
const movies_endpoint = '/movies/';

export async function getMovies(): Promise<Movie[]> {
  try {
    const response = await axios.get<Movie[]>(backend_url + movies_endpoint);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function postMovie(title: string, link: string, user: string, date_added: string, genre: string): Promise<void> {
  const data = {
    title: title,
    link: link,
    user: user,
    date_added: date_added,
    genre: genre,
  }
  try {
    const response = await axios.post(backend_url + movies_endpoint, data);
    console.log(response.status);
  } catch (error) {
    console.error(error);
  }
}