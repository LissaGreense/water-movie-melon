import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import {
  getAttendees,
  getMovieNight,
  joinMovieNight,
} from "../connections/internal/movieNight.ts";
import { Button } from "primereact/button";
import { clearUser, getUsername } from "../utils/accessToken.ts";
import dayjs from "dayjs";
import { Attendees, MovieNight } from "../types/internal/movieNight.ts";
import { LOGIN } from "../constants/paths.ts";
import { useNavigate } from "react-router-dom";

interface MovieDateProps {
  movieDate: Date | null;
  isVisible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}
export const MovieNightAttend: FC<MovieDateProps> = ({
  movieDate,
  isVisible,
  setVisible,
}): JSX.Element => {
  const [nightLocation, setNightLocation] = useState<string>("");
  const [movieNightData, setMovieNightData] = useState<MovieNight>();
  const [attendeesList, setAttendeesList] = useState<Attendees[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMovieNight(movieDate)
      .then((data) => {
        setMovieNightData(data[0]);
      })
      .catch((error) => {
        if (error.response.data.status === 401) {
          clearUser();
          navigate(LOGIN);
        }
        console.error("Error fetching nights:", error);
      });
  }, [movieDate, navigate]);

  useEffect(() => {
    getAttendees()
      .then((attds) => {
        setAttendeesList(attds);
      })
      .catch((error) => {
        if (error.response.data.status === 401) {
          clearUser();
          navigate(LOGIN);
        }
        console.error("Error fetching attendees:", error);
      });
  }, [movieDate, navigate]);

  useEffect(() => {
    getMovieNight(movieDate)
      .then((r) => {
        if (r === null) {
          console.log("ni mom wieczorów");
        } else {
          setNightLocation(r[0].location);
        }
      })
      .catch((error) => {
        if (error.response.data.status === 401) {
          clearUser();
          navigate(LOGIN);
        }
        console.error("Error fetching movies night:", error);
      });
  }, [movieDate, navigate]);

  const handleJoinMovieNight = () => {
    joinMovieNight(
      movieNightData,
      getUsername(),
      dayjs(Date()).format("YYYY-MM-DD HH:mm"),
    );
  };

  return (
    <Dialog visible={isVisible} onHide={() => setVisible(false)}>
      <div className="text-center">
        <span>Tego dnia jest już zaplanowany wieczór filmowy</span>
      </div>
      <div className="text-center">
        <span>Możesz do niego dołączyć ;)</span>
      </div>
      <div className="text-center">
        <span>Miejsce oglądania: {nightLocation}.</span>
      </div>
      <div className="flex justify-content-center mt-3">
        <Button
          label="Dołącz"
          onClick={handleJoinMovieNight}
          disabled={
            attendeesList
              ?.map((val) => val.user)
              .includes(getUsername() as string) &&
            attendeesList
              ?.map((val) =>
                dayjs(val.night.night_date).format("ddd MMM DD YYYY"),
              )
              .includes(dayjs(movieDate).format("ddd MMM DD YYYY"))
          }
        ></Button>
      </div>
    </Dialog>
  );
};
