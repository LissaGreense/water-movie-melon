import {Movie} from "../../types/internal/movie.ts";
import axios from "axios";

const backend_url = 'http://localhost:8000';
const rates_endpoint = '/movies/rate'

export async function postRating(movie: Movie, user: string, rating: number): Promise<void> {
    const data = {
        movie: movie,
        user: user,
        rating: rating,
    }
    try {
        const response = await axios.post(backend_url + rates_endpoint, data);
        console.log(response.status);
    } catch (error) {
        console.error(error)
    }
}