import {Avatar, Statistics} from "../../types/internal/user.ts";
import axios from "axios";

const backend_url = 'http://localhost:8000';
const avatar_endpoint = '/movies/userAvatar';
const statistics_endpoint = '/movies/userStatistics';


export async function getAvatar(username: string): Promise<Avatar> {
    try {
        const response = await axios.get<Avatar>(backend_url + avatar_endpoint + '/' + username);
        return response.data;
    } catch (error) {
        return {"avatar_url": ""};
    }
}
export async function getStatistics(username: string): Promise<Promise<Statistics> | null> {
    try {
        const response = await axios.get<Statistics>(backend_url + statistics_endpoint + '/' + username);
        return response.data;
    } catch (error) {
        return null;
    }
}

export async function uploadAvatar(username: string | null, image: Blob | unknown) {
    try {
        const formData = new FormData();
        formData.append('avatar', image as Blob);

        const response = await axios.post<Avatar>(backend_url + avatar_endpoint + '/' + username
        , formData);
        return response.data;
    } catch (error) {
        return {"error": error};
    }
}