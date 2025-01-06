export interface Avatar {
  avatar_url: string;
}

export interface Statistics {
  added_movies: number;
  seven_rated_movies: number;
  watched_movies: number;
  hosted_movie_nights: number;
  highest_rated_movie: string | null;
  lowest_rated_movie: string | null;
  movie_tickets: number;
}

export interface PasswordUpdate {
  old_password: string;
  new_password: string;
}
