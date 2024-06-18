import {Dispatch, FC, SetStateAction, useEffect, useState} from "react";
import {Dialog} from "primereact/dialog";
import {getAttendees, getMovieNight, joinMovieNight} from "../connections/internal/movieNight.ts";
import {Button} from "primereact/button";
import {getUsername} from "../utils/accessToken.ts";
import dayjs from "dayjs";
import {Attendees, MovieNight} from "../types/internal/movieNight.ts";

interface MovieDateProps {
    movieDate: Date | null;
    isVisible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
}
export const MovieNightAttend: FC<MovieDateProps> = ({movieDate, isVisible, setVisible}): JSX.Element => {
    const [nightLocation, setNightLocation] = useState<string>("");
    const [movieNightData, setMovieNightData] = useState<MovieNight>();
    const [attendeesList, setAttendeesList] = useState<Attendees[]>([]);

    useEffect(() => {
        getMovieNight(movieDate).then((data) => {
            setMovieNightData(data[0]);
        })
    }, [movieDate]);

    useEffect(() => {
        getAttendees().then((attds) => {
            setAttendeesList(attds);
        })
    }, [movieDate]);

    useEffect(() => {
        getMovieNight(movieDate)
        .then((r) => {
            // TODO: when no elements returns error or something. Just handle that
            setNightLocation(r[0].location);
        })
        .catch((error) => {
            console.error('Error fetching movies:', error);
        });
    }, [movieDate]);

    const handleJoinMovieNight = () => {
        joinMovieNight(
            movieNightData,
            getUsername(),
            dayjs(Date()).format('YYYY-MM-DD HH:mm')
        )
    };

    return (
        <Dialog visible={isVisible} onHide={() => setVisible(false)}>
            <span>Tego dnia jest już zaplanowany wieczór filmowy</span>
            <span>Możesz do niego dołączyć ;)</span>
            <span>Miejsce oglądania: {nightLocation}.</span>
            <Button label='Dołącz' onClick={handleJoinMovieNight} disabled={
                attendeesList?.map(val => val.user).includes(getUsername() as string) &&
                attendeesList?.map(val => dayjs(val.night.night_date).format('ddd MMM DD YYYY')).includes(dayjs(movieDate).format('ddd MMM DD YYYY'))
            }>
            </Button>
        </Dialog>
    )
}