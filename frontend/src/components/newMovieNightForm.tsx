import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { postMovieNight } from "../connections/internal/movieNight.ts";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import dayjs from "dayjs";
import { Dialog } from "primereact/dialog";
import { getUsername } from "../utils/accessToken.ts";
import { getMovies } from "../connections/internal/movie.ts";

interface MovieDateProps {
  movieDate: Date | null;
  isVisible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export const NewMovieNightForm: FC<MovieDateProps> = ({
  movieDate,
  isVisible,
  setVisible,
}): JSX.Element => {
  const [nightTime, setNightTime] = useState<Date>();
  const [availableMovies, setAvailableMovies] = useState<boolean>(false);

  useEffect(() => {
    getMovies({ watched: false }).then((movies) => {
      if (movies.length > 0) {
        setAvailableMovies(true);
      } else {
        setAvailableMovies(false);
      }
    });
  }, [isVisible]);

  if (availableMovies) {
    return (
      <Dialog visible={isVisible} onHide={() => setVisible(false)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const target = e.currentTarget;
            const combinedDateTime = dayjs(movieDate)
              .hour(dayjs(nightTime).hour())
              .minute(dayjs(nightTime).minute())
              .second(0)
              .millisecond(0);

            postMovieNight(
              getUsername() as string,
              combinedDateTime.toISOString(),
              target.location.value,
            );
          }}
        >
          <div className="p-inputgroup flex-1 m-2">
            <span className="p-inputgroup-addon">Data Wieczoru</span>
            <Calendar value={movieDate} dateFormat={"dd-mm-yy"} disabled />
            <Calendar
              value={nightTime}
              onChange={(e) => setNightTime(e.value as Date | undefined)}
              timeOnly
              hourFormat="24"
            />
          </div>
          <div className="p-inputgroup flex-1 m-2">
            <span className="p-inputgroup-addon">Lokacja</span>
            <InputText placeholder="eg. chata starej pepe" name={"location"} />
          </div>
          <Button
            className="m-2"
            label="Dodaj Wieczór"
            icon="pi pi-check"
            type={"submit"}
          />
        </form>
      </Dialog>
    );
  } else {
    return (
      <Dialog visible={isVisible} onHide={() => setVisible(false)}>
        <span>Nie ma już żadnych filmów do obejrzenia,</span>
        <span> aby zaplanować wieczór filmowy dodaj jakiś film.</span>
      </Dialog>
    );
  }
};
