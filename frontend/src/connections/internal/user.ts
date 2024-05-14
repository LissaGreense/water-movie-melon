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