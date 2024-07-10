import {Movie} from "../../types/internal/movie.ts";
import axios from "axios";

const backend_url = 'http://localhost:8000';
const rates_endpoint = '/movies/rate'

export async function postRating(movie: Movie | undefined, user: string | null, rating: number | undefined | null): Promise<void> {
    const data = {
        movie: movie,
        user: user,
        rating: rating,
    }
    try {
        await axios.post(backend_url + rates_endpoint, data);
    } catch (error) {
        console.error(error)
    }
}