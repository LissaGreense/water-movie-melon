export interface Movie {
  title: string;
  link: string;
  user: string;
  date_added: string;
  genre: string;
  cover_link: string;
  duration: number;
  movie_selected_at?: string; // Optional - only present for selected movies
  night_date?: string; // Optional - only present for selected movies
}

export interface MovieSearchQuery {
  search?: string;
  orderBy?: {
    type?: string;
    ascending?: boolean;
  };
}
