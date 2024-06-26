import {Avatar} from "../../types/internal/user.ts";
import axios from "axios";

const backend_url = 'http://localhost:8000';
const avatar_endpoint = '/movies/userAvatar';


export async function getAvatar(username: string): Promise<Avatar> {
    try {
        const response = await axios.get<Avatar>(backend_url + avatar_endpoint + '/' + username);
        return response.data as Promise<Avatar>;
    } catch (error) {
        return {"avatar_url": ""};
    }
}

export async function uploadAvatar(username: string | null, image) {
    try {
        const formData = new FormData();
        formData.append('avatar', image);

        const response = await axios.post<Avatar>(backend_url + avatar_endpoint + '/' + username
        , formData);
        return response.data;
    } catch (error) {
        return {"error": error};
    }
}