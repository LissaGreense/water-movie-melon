import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { postMovieNight } from "../connections/internal/movieNight.ts";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { Calendar } from "primereact/calendar";
import dayjs from "dayjs";
import { Dialog } from "primereact/dialog";
import { getUsername } from "../utils/accessToken.ts";

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

  return (
    <Dialog visible={isVisible} onHide={() => setVisible(false)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.currentTarget;
          postMovieNight(
            getUsername() as string,
            dayjs(movieDate).format("YYYY-MM-DD ") +
              dayjs(nightTime).format("HH:mm"),
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
};
