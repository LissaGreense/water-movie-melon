import { Movie } from "../../types/internal/movie.ts";
import axios from "axios";

const backend_url = 'http://localhost:8000';
const movies_endpoint = '/movies/';

export async function getMovies(): Promise<Movie[]> {
  try {
    const response = await axios.get<Movie[]>(backend_url + movies_endpoint);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function postMovie(title: string, link: string, user: string, date_added: string, genre: string, cover_link: string, duration: number): Promise<void> {
  const data = {
    title: title,
    link: link,
    user: user,
    date_added: date_added,
    genre: genre,
    duration: duration,
    cover_link: cover_link
  }
  try {
    await axios.post(backend_url + movies_endpoint, data);
  } catch (error) {
    console.error(error);
  }
}