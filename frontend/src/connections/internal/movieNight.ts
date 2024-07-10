import axios from "axios";
import {Attendees, MovieNight,} from "../../types/internal/movieNight.ts";

const backend_url = 'http://localhost:8000';
const movie_nights_endpoint = '/movies/newNight';
const attendees_endpoint = '/movies/attendees';

export async function getMovieNights(): Promise<MovieNight[]> {
    try {
        const response = await axios.get<MovieNight[]>(backend_url + movie_nights_endpoint);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getMovieNight(nightDate: Date | null): Promise<MovieNight[]> {
    try {
        const response = await axios.get<MovieNight[]>(backend_url + movie_nights_endpoint, {
            params: {
                date: nightDate?.toLocaleDateString()
            }
        });
        return response.data
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function postMovieNight(host: string, night_date: string, location: string): Promise<void> {
    const data = {
        host: host,
        night_date: night_date,
        location: location,
    }
    try {
        await axios.post(backend_url + movie_nights_endpoint, data);
    } catch (error) {
        console.error(error);
    }
}

export async function joinMovieNight(night: MovieNight | undefined, user: string | null, accept_date: string) : Promise<void> {
    const data = {
        night: night,
        user: user,
        accept_date: accept_date,
    }
    try {
        await axios.post(backend_url + attendees_endpoint, data);
    } catch (error){
        console.error(error);
    }
}

export async function getAttendees() : Promise<Attendees[]> {
    try {
        const response = await axios.get<Attendees[]>(backend_url + attendees_endpoint);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}
