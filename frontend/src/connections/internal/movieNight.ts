import axios, { AxiosRequestConfig } from "axios";
import { Attendees, MovieNight } from "../../types/internal/movieNight.ts";
import dayjs from "dayjs";
import { getAuthHeadersConfig } from "../../utils/accessToken.ts";
import { DEFAULT_BACKEND_URL } from "../../constants/defaults.ts";

const backend_url = import.meta.env.VITE_APP_BACKEND_URL || DEFAULT_BACKEND_URL;
const movie_nights_endpoint = "/movies/newNight/";
const movie_date_endpoint = "/movies/movieDate/";
const attendees_endpoint = "/movies/attendees/";
const rand_movie_endpoint = "/movies/selectedMovie/";
const night_check_endpoint = "/movies/upcomingNights/";

export async function getMovieNights(): Promise<MovieNight[]> {
  try {
    const response = await axios.get<MovieNight[]>(
      backend_url + movie_nights_endpoint,
      getAuthHeadersConfig(),
    );

    return response.data as MovieNight[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getMovieNight(
  nightDate: Date | null,
): Promise<MovieNight[]> {
  const config: AxiosRequestConfig = getAuthHeadersConfig();
  if (nightDate !== null) {
    config["params"] = {
      date: nightDate.toLocaleDateString(),
    };
  }
  try {
    const response = await axios.get<MovieNight[]>(
      backend_url + movie_nights_endpoint,
      config,
    );
    return response.data as MovieNight[];
  } catch (error) {
    console.error(error);
    return [];
  }
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
  try {
    await axios.post(
      backend_url + movie_nights_endpoint,
      data,
      getAuthHeadersConfig(),
    );
  } catch (error) {
    console.error(error);
  }
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
  console.log(night);
  try {
    await axios.post(
      backend_url + attendees_endpoint,
      data,
      getAuthHeadersConfig(),
    );
  } catch (error) {
    console.error(error);
  }
}

export async function getAttendees(): Promise<Attendees[]> {
  try {
    const response = await axios.get<Attendees[]>(
      backend_url + attendees_endpoint,
      getAuthHeadersConfig(),
    );
    return response.data as Attendees[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getRandomMovie(): Promise<string> {
  try {
    const response = await axios.get(
      backend_url + rand_movie_endpoint,
      getAuthHeadersConfig(),
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return "";
  }
}

export async function getMovieDate(): Promise<Date> {
  try {
    const response = await axios.get(
      backend_url + movie_date_endpoint,
      getAuthHeadersConfig(),
    );
    return dayjs(response.data).toDate();
  } catch (error) {
    console.error(error);
    return new Date();
  }
}

export async function checkForNights(): Promise<boolean> {
  try {
    const response = await axios.get(
      backend_url + night_check_endpoint,
      getAuthHeadersConfig(),
    );
    return response.data as boolean;
  } catch (error) {
    console.error(error);
    return false;
  }
}
