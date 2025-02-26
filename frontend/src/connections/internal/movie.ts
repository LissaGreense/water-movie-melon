import { Movie } from "../../types/internal/movie.ts";
import axios, { AxiosRequestConfig } from "axios";
import { getAuthHeadersConfig } from "../../utils/accessToken.ts";
import { DEFAULT_BACKEND_URL } from "../../constants/defaults.ts";

const backend_url = import.meta.env.VITE_APP_BACKEND_URL || DEFAULT_BACKEND_URL;
const movies_endpoint = "/movies/";

interface movieParams {
  random?: boolean;
  watched?: boolean;
  limit?: number;
  search?: string;
  orderBy?: {
    type?: string;
    ascending?: boolean;
  };
}

export async function getMovies(params: movieParams): Promise<Movie[]> {
  const config: AxiosRequestConfig = {
    params: params,
  };
  const response = await axios.get<Movie[]>(
    backend_url + movies_endpoint,
    config,
  );

  return response.data as Movie[];
}

export async function postMovie(movie: Movie): Promise<void> {
  await axios.post(
    backend_url + movies_endpoint,
    movie,
    getAuthHeadersConfig(true),
  );
}
