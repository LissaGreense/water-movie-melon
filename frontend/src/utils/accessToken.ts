const TOKEN_KEY = "access_token";
const USER_KEY = "username";
export const saveAccessToken = (token: string, username: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};
export const getUsername = (): string | null => {
  return localStorage.getItem(USER_KEY);
};

export const clearAccessToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getAuthHeadersConfig = () => {
  return {
    headers: {
      Authorization: `Token ${getAccessToken()}`,
      User: `${getUsername()}`,
      "Access-Control-Allow-Origin": "*",
    },
  };
};
