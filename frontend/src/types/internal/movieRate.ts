import { Movie } from "./movie.ts";

export interface MovieRate {
  movie: Movie;
  user: string;
  rating: number;
}

export interface MovieRateAverage {
  movie: Movie;
  rating: number;
}
