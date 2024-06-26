import {Dispatch, FC, SetStateAction, useEffect, useState} from "react";
import {Dialog} from "primereact/dialog";
import {Rating} from "primereact/rating";
import {Movie} from "../types/internal/movie.ts";
import {Button} from "primereact/button";
import {postRating} from "../connections/internal/movieRate.ts";
import {getUsername} from "../utils/accessToken.ts";
import {getMovieNight} from "../connections/internal/movieNight.ts";
import {getMovies} from "../connections/internal/movie.ts";

interface MovieDateProps {
    movieDate: Date | null;
    isVisible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
}

export const MovieRate: FC<MovieDateProps> = ({movieDate, isVisible, setVisible}): JSX.Element => {
    const [rating, setRating] = useState<number>();
    const [movie, setMovie] = useState<Movie>();


    //TODO tu placeholder na dodawanie ratingu, usunąc gdy losowanie będzie
    const [placeholderMovie, setPlaceholderMovie] = useState<Movie>()
    useEffect(() => {
        getMovies().then((movies) => {
            console.log('tu pa hopie')
            console.log(movies[0])
            setPlaceholderMovie(movies[0])
        })
    }, []);

    useEffect(() => {
        getMovieNight(movieDate).then((data) => {
            console.log('pa tera')
            console.log(data[0])
            setMovie(data[0].selected_movie)
        })
    }, []);

    const handleRateMovie = () => {
        postRating(
            placeholderMovie,
            getUsername(),
            rating,
        )
    }

    return (
        <Dialog visible={isVisible} onHide={() => setVisible(false)}>
            <span>Jak spodobał ci się seans filmu</span>
            <span>{movie?.title}?</span>
            <Rating value={rating} onChange={(e) => setRating(e.value)} cancel={false} stars={7}/>
            <Button label="Dodaj ocenę" onClick={handleRateMovie}></Button>
        </Dialog>
    )
}