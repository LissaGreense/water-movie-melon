export interface MovieNight {
    host: string;
    night_date: string;
    location: string;
}

export interface Attendees {
    night: MovieNight;
    user: string;
    accept_date: string;
}