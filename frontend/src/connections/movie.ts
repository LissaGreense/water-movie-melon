import {Movie} from "../types/movie.ts";
import axios from "axios";

var backend_url = 'http://localhost:8000'
var movies_endpoint = '/movies'

export async function getMovies(): Promise<Movie[]> {
        try {
            const response = await axios.get<Movie[]>(backend_url + movies_endpoint);
            console.log(response)
            return (response.data)
        }catch(error) {
            console.error(error)
            return [];
        }
}

export function postMovie(title: string, link: string, user: string, date_added: string, genre: string) {
        try {
            const response = await axios.post(backend_url + movies_endpoint, {
                title:
                link:
                user:
                date_added:
                genre:
            });
        }catch(error) {
            console.error(error)
        }
}