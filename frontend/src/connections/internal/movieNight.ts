import axios, { AxiosRequestConfig } from "axios";
import { Attendees, MovieNight } from "../../types/internal/movieNight.ts";
import dayjs from "dayjs";
import { getAuthHeadersConfig } from "../../utils/accessToken.ts";
import { DEFAULT_BACKEND_URL } from "../../constants/defaults.ts";
import { Movie } from "../../types/internal/movie.ts";

const backend_url = import.meta.env.VITE_APP_BACKEND_URL || DEFAULT_BACKEND_URL;
const movie_nights_endpoint = "/movies/newNight/";
const movie_date_endpoint = "/movies/movieDate/";
const attendees_endpoint = "/movies/attendees/";
const rand_movie_endpoint = "/movies/selectedMovie/";
const night_check_endpoint = "/movies/upcomingNights/";

export async function getMovieNights(): Promise<MovieNight[]> {
  const response = await axios.get<MovieNight[]>(
    backend_url + movie_nights_endpoint,
    getAuthHeadersConfig(false),
  );

  return response.data as MovieNight[];
}

export async function getMovieNight(
  nightDate: Date | null,
): Promise<MovieNight[]> {
  const config: AxiosRequestConfig = getAuthHeadersConfig(false);
  if (nightDate !== null) {
    config["params"] = {
      date: nightDate.toISOString(),
    };
  }
  const response = await axios.get<MovieNight[]>(
    backend_url + movie_nights_endpoint,
    config,
  );
  return response.data as MovieNight[];
}

export async function postMovieNight(
  host: string | null,
  night_date: string,
  location: string,
): Promise<void> {
  const data = {
    host: host,
    night_date: night_date,
    location: location,
  };

  await axios.post(
    backend_url + movie_nights_endpoint,
    data,
    getAuthHeadersConfig(true),
  );
}

export async function joinMovieNight(
  night: MovieNight | undefined,
  user: string | null,
  accept_date: string,
): Promise<void> {
  const data = {
    night: night,
    user: user,
    accept_date: accept_date,
  };

  await axios.post(
    backend_url + attendees_endpoint,
    data,
    getAuthHeadersConfig(true),
  );
}

export async function getAttendees(): Promise<Attendees[]> {
  const response = await axios.get<Attendees[]>(
    backend_url + attendees_endpoint,
    getAuthHeadersConfig(false),
  );
  return response.data as Attendees[];
}

export async function getRandomMovie(): Promise<Movie | null> {
  const response = await axios.get(
    backend_url + rand_movie_endpoint,
    getAuthHeadersConfig(false),
  );
  return response.data;
}

export async function getMovieDate(): Promise<Date> {
  const response = await axios.get(
    backend_url + movie_date_endpoint,
    getAuthHeadersConfig(false),
  );
  return dayjs(response.data).toDate();
}

export async function checkForNights(): Promise<boolean> {
  try {
    const response = await axios.get(
      backend_url + night_check_endpoint,
      getAuthHeadersConfig(false),
    );
    return response.data as boolean;
  } catch (error) {
    console.error(error);
    return false;
  }
}
