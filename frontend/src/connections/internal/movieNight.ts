import axios from "axios";
import {Attendees, MovieNight,} from "../../types/internal/movieNight.ts";

const backend_url = 'http://localhost:8000';
const movie_nights_endpoint = '/movies/newNight';
const attendees_endpoint = '/movies/attendees';

export async function getMovieNights(): Promise<MovieNight[]> {
    try {
        const response = await axios.get<MovieNight[]>(backend_url + movie_nights_endpoint);
        console.log(response);
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
        console.log(response.data)
        return response.data
    } catch (error) {
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
        const response = await axios.post(backend_url + movie_nights_endpoint, data);
        console.log(response.status);
    } catch (error) {
        console.error(error);
    }
}

export async function joinMovieNight(night: MovieNight, user: string, accept_date: string) : Promise<void> {
    const data = {
        night: night,
        user: user,
        accept_date: accept_date,
    }
    try {
        const response = await axios.post(backend_url + attendees_endpoint, data);
        console.log(response.status);
    } catch (error){
        console.error(error);
    }
}

export async function getAttendees() : Promise<Attendees[]> {
    try {
        const response = await axios.get<Attendees[]>(backend_url + attendees_endpoint);
        console.log(response.status);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}