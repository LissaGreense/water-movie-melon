import {Dispatch, FC, SetStateAction, useEffect, useState} from "react";
import {Dialog} from "primereact/dialog";
import {Rating} from "primereact/rating";
import {Button} from "primereact/button";
import {postRating} from "../connections/internal/movieRate.ts";
import {getUsername} from "../utils/accessToken.ts";
import {getMovieNight} from "../connections/internal/movieNight.ts";

interface MovieDateProps {
    movieDate: Date | null;
    isVisible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
}

export const MovieRate: FC<MovieDateProps> = ({movieDate, isVisible, setVisible}): JSX.Element => {
    const [rating, setRating] = useState<number | undefined>();
    const [movieNightTitle, setMovieNightTitle] = useState<string>('')

    useEffect(() => {
        getMovieNight(movieDate).then((data) => {
            console.log("ssss")
            console.log(data)
            setMovieNightTitle(data[0].selected_movie as string)
        })
    }, []);


    const handleRateMovie = () => {
        postRating(
            movieNightTitle,
            getUsername(),
            rating,
        )
    }


    return (
        <Dialog visible={isVisible} onHide={() => setVisible(false)}>
            <span>Jak spodobał ci się seans filmu</span>
            <span>{movieNightTitle}?</span>
            <Rating value={rating} onChange={(e) => setRating(e.value as number | undefined)} cancel={false} stars={7}/>
            <Button label="Dodaj ocenę" onClick={handleRateMovie}></Button>
        </Dialog>
    )
}