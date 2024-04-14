import axios from "axios";
import {MovieNight} from "../../types/internal/movieNight.ts";

const backend_url = 'http://localhost:8000';
const movie_nights_endpoint = '/movies/newNight';

export async function getMovies(): Promise<MovieNight[]> {
    try {
        const response = await axios.get<MovieNight[]>(backend_url + movie_nights_endpoint);
        console.log(response);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function postMovieNight(host: string, night_date: string, location: string): Promise<void> {
    const data = {
        host: host,
        night_date: night_date,
        location: location,
    }
    try {
        const response = await axios.post(backend_url + movie_nights_endpoint, data);
        console.log(response.status);
    } catch (error) {
        console.error(error);
    }
}