export interface Movie {
  title: string;
  link: string;
  user: string;
  date_added: string;
  genre: string;
  cover_link: string;
  duration: number;
}

export interface MovieSearchQuery {
  search?: string;
  orderBy?: {
    type?: string;
    ascending?: boolean;
  }
}