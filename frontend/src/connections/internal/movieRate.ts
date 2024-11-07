import axios from "axios";
import { getAuthHeadersConfig } from "../../utils/accessToken.ts";
import { MovieRate, MovieRateAverage } from "../../types/internal/movieRate.ts";

const backend_url =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:8000";
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
  try {
    await axios.post(
      backend_url + rates_endpoint,
      data,
      getAuthHeadersConfig(),
    );
  } catch (error) {
    console.error(error);
  }
}

export async function getRating(): Promise<MovieRate[]> {
  try {
    const response = await axios.get(backend_url + rates_endpoint);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAverageRatings(): Promise<MovieRateAverage[]> {
  try {
    const response = await axios.get(backend_url + average_rates_endpoint);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
