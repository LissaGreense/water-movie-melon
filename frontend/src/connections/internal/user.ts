import {
  Avatar,
  PasswordUpdate,
  Statistics,
} from "../../types/internal/user.ts";
import axios from "axios";
import { getAuthHeadersConfig } from "../../utils/accessToken.ts";
import { ResultResponse } from "../../types/internal/common.ts";

const backend_url =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:8000";
const avatar_endpoint = "/movies/userAvatar/";
const statistics_endpoint = "/movies/userStatistics/";
const password_change_endpoint = "/movies/userPassword/";

export async function getAvatar(username: string): Promise<Avatar> {
  try {
    const response = await axios.get<Avatar>(
      backend_url + avatar_endpoint + username + "/",
      getAuthHeadersConfig(),
    );
    return response.data as Avatar;
  } catch (error) {
    return { avatar_url: "" };
  }
}
export async function getStatistics(
  username: string,
): Promise<Statistics | null> {
  try {
    const response = await axios.get<Statistics>(
      backend_url + statistics_endpoint + username + "/",
      getAuthHeadersConfig(),
    );
    return response.data as Statistics;
  } catch (error) {
    return null;
  }
}

export async function uploadAvatar(
  username: string | null,
  image: Blob | unknown,
) {
  try {
    const formData = new FormData();
    formData.append("avatar", image as Blob);
    const response = await axios.post<Avatar>(
      backend_url + avatar_endpoint + username + "/",
      formData,
      getAuthHeadersConfig(),
    );
    return response.data;
  } catch (error) {
    return { error: error };
  }
}

export async function postNewPassword(
  username: string | null,
  oldPassword: string,
  newPassword: string,
): Promise<ResultResponse> {
  const data: PasswordUpdate = {
    old_password: oldPassword,
    new_password: newPassword,
  };
  const response = await axios.post<ResultResponse>(
    backend_url + password_change_endpoint + username + "/",
    data,
    getAuthHeadersConfig(),
  );

  return response.data as ResultResponse;
}
