import {Movie} from "../types/movie.ts";
import axios from "axios";

var backend_url = 'http://localhost:8000'
var movies_endpoint = '/movies'

export async function getMovies(): Promise<Movie[]> {

    axios.get<Movie[]>(backend_url + movies_endpoint)
        .then((response) => {
            return (response.data)
        }).catch((error) => {
            console.error(error)
            return [];
        }
    )
    return []
}