import axios from "axios";
import {Attendees, MovieNight,} from "../../types/internal/movieNight.ts";
import dayjs from "dayjs";

const backend_url = 'http://localhost:8000';
const movie_nights_endpoint = '/movies/newNight';
const movie_date_endpoint = '/movies/movieDate';
const attendees_endpoint = '/movies/attendees';
const rand_movie_endpoint = '/movies/selectedMovie'
const night_check_endpoint = '/movies/upcomingNights'

export async function getMovieNights(): Promise<MovieNight[]> {
    try {
        const response = await axios.get<MovieNight[]>(backend_url + movie_nights_endpoint);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getMovieNight(nightDate: Date | null) {
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

export async function postMovieNight(host: string | null, night_date: string, location: string): Promise<void> {
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

export async function getRandomMovie(): Promise<string> {
    try {
        const response = await axios.get(backend_url + rand_movie_endpoint)
        return response.data
    } catch (error) {
        console.error(error)
        return ''
    }
}

export async function getMovieDate(): Promise<Date> {
    try {
        const response = await axios.get(backend_url + movie_date_endpoint)
        return dayjs(response.data).toDate()
    } catch (error) {
        console.error(error)
        return new Date()
    }
}

export async function checkForNights(): Promise<boolean> {
    try {
        const response = await axios.get(backend_url + night_check_endpoint)
        return response.data as boolean
    } catch (error) {
        console.error(error)
        return false
    }
}
