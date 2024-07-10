import {Movie} from "./movie.ts";

export interface MovieNight {
    host: string;
    night_date: string;
    location: string;
    selected_movie: Movie;
}

export interface Attendees {
    night: MovieNight;
    user: string;
    accept_date: string;
}