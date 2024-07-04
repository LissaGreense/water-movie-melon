import axios from "axios";
import {OmdbMovie} from "../../types/external/omdbMovie.ts";

const omdbapi_url = 'http://www.omdbapi.com/';

export async function getMoviePosterUrl(title: string): Promise<string> {
  const params = {
    t: title
  }
  try {
    const response = await axios.get<OmdbMovie>(omdbapi_url, {params});
    return response.data.Poster;
  } catch (error) {
    console.log(error)
    return "";
  }


}