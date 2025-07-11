import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Rating } from "primereact/rating";
import { Button } from "primereact/button";
import { postRating } from "../connections/internal/movieRate.ts";
import { clearUser, getUsername } from "../utils/accessToken.ts";
import { getMovieNight } from "../connections/internal/movieNight.ts";
import { LOGIN } from "../constants/paths.ts";
import { useNavigate } from "react-router-dom";

interface MovieDateProps {
  movieDate: Date | null;
  isVisible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export const MovieRate: FC<MovieDateProps> = ({
  movieDate,
  isVisible,
  setVisible,
}): JSX.Element => {
  const [rating, setRating] = useState<number | undefined>();
  const [movieTitle, setMovieTitle] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    getMovieNight(movieDate)
      .then((night) => {
        setMovieTitle(night[0].selected_movie.title);
      })
      .catch((error) => {
        if (error.response.data.status === 401) {
          clearUser();
          navigate(LOGIN);
        }
      });
  }, [movieDate, navigate]);

  const handleRateMovie = () => {
    postRating(movieTitle, getUsername(), rating).catch((error) => {
      if (error.response.data.status === 401) {
        navigate(LOGIN);
      }
    });
  };

  return (
    <Dialog visible={isVisible} onHide={() => setVisible(false)}>
      <div className="text-center">
        <span>Jak spodobał ci się seans filmu {movieTitle}?</span>
      </div>
      <div className="flex justify-content-center my-3">
        <Rating
          value={rating}
          onChange={(e) => setRating(e.value as number | undefined)}
          cancel={false}
          stars={7}
        />
      </div>
      <div className="flex justify-content-center">
        <Button label="Dodaj ocenę" onClick={handleRateMovie}></Button>
      </div>
    </Dialog>
  );
};
