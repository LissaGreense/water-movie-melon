import { Movie } from "../../types/internal/movie.ts";
import axios from "axios";
import {getAuthHeadersConfig} from "../../utils/accessToken.ts";

const backend_url = 'http://localhost:8000';
const movies_endpoint = '/movies/';

export async function getMovies(): Promise<Movie[]> {
  const config = getAuthHeadersConfig();
  try {
    const response = await axios.get<Movie[]>(backend_url + movies_endpoint, config);
    return response.data as Movie[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function postMovie(title: string, link: string, user: string | null, date_added: string, genre: string, cover_link: string, duration: number): Promise<void> {
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
    await axios.post(backend_url + movies_endpoint, data, getAuthHeadersConfig());
  } catch (error) {
    console.error(error);
  }
}