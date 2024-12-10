import { Movie } from "../../types/internal/movie.ts";
import axios, { AxiosRequestConfig } from "axios";
import { getAuthHeadersConfig } from "../../utils/accessToken.ts";
import { DEFAULT_BACKEND_URL } from "../../constants/defaults.ts";

const backend_url = import.meta.env.VITE_APP_BACKEND_URL || DEFAULT_BACKEND_URL;
const movies_endpoint = "/movies/";

export async function getMovies(randomUnwatched: boolean): Promise<Movie[]> {
  const config: AxiosRequestConfig = getAuthHeadersConfig();
  if (randomUnwatched) {
    config["params"] = {
      randomUnwatched: randomUnwatched,
    };
  }
  try {
    const response = await axios.get<Movie[]>(
      backend_url + movies_endpoint,
      config,
    );
    return response.data as Movie[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function postMovie(movie: Movie): Promise<void> {
  await axios.post(
    backend_url + movies_endpoint,
    movie,
    getAuthHeadersConfig(),
  );
}
