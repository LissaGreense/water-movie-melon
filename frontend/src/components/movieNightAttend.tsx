import {Dispatch, FC, SetStateAction, useEffect, useState} from "react";
import {Dialog} from "primereact/dialog";
import {getMovieNight} from "../connections/internal/movieNight.ts";
import {Movie} from "../types/internal/movie.ts";
import {getMovies} from "../connections/internal/movie.ts";

interface MovieDateProps {
    movieDate: Date | null;
    isVisible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
}
export const MovieNightAttend: FC<MovieDateProps> = ({movieDate, isVisible, setVisible}): JSX.Element => {
    const [nightLocation, setNightLocation] = useState<string>("");

    useEffect(() => {
        getMovieNight(movieDate)
        .then((r) => {
            // TODO: when no elements returns error or something. Just handle that
            setNightLocation(r[0].location)
        })
        .catch((error) => {
            console.error('Error fetching movies:', error);
        });
    }, []);
    return (
        <Dialog visible={isVisible} onHide={() => setVisible(false)}>
            <span>Tego dnia jest już zaplanowany wieczór filmowy</span>
            <span>Możesz do niego dołączyć ;)</span>
            <span>Miejsce oglądania: {nightLocation}.</span>
        </Dialog>
    )
}