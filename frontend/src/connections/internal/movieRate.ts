import axios from "axios";
import { getAuthHeadersConfig } from "../../utils/accessToken.ts";
import { MovieRate, MovieRateAverage } from "../../types/internal/movieRate.ts";
import { DEFAULT_BACKEND_URL } from "../../constants/defaults.ts";

const backend_url = import.meta.env.VITE_APP_BACKEND_URL || DEFAULT_BACKEND_URL;
const rates_endpoint = "/movies/rate/";
const average_rates_endpoint = "/movies/average_ratings";

export async function postRating(
  movie: string,
  user: string | null,
  rating: number | undefined | null,
): Promise<void> {
  const data = {
    movie: movie,
    user: user,
    rating: rating,
  };

  await axios.post(
    backend_url + rates_endpoint,
    data,
    getAuthHeadersConfig(true),
  );
}

export async function getRating(): Promise<MovieRate[]> {
  const response = await axios.get(backend_url + rates_endpoint);

  return response.data;
}

export async function getAverageRatings(): Promise<MovieRateAverage[]> {
  const response = await axios.get(backend_url + average_rates_endpoint);

  return response.data;
}
