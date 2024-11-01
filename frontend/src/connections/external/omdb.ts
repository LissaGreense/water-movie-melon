import axios from "axios";
import {OmdbSearchResponse} from "../../types/external/omdbMovie.ts";

const omdbapi_url = 'http://www.omdbapi.com/';

export async function getMoviePosterUrl(title: string): Promise<OmdbSearchResponse|null> {
  const params = {
    s: title,
    apikey: "7a4b0bbd"
  }
  try {
    const response = await axios.get<OmdbSearchResponse>(omdbapi_url, {params});
    return response.data;
  } catch (error) {
    console.log(error)
    return null;
  }
}