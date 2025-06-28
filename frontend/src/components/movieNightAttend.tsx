import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
  useCallback,
} from "react";
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
  const [userAttending, setUserAttending] = useState(false);
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

  const fetchAttendees = useCallback(() => {
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
  }, [navigate]);

  useEffect(() => {
    fetchAttendees();
  }, [movieDate, fetchAttendees]);

  useEffect(() => {
    if (movieDate && attendeesList) {
      setUserAttending(
        attendeesList.some(
          (attendee) =>
            attendee.user === (getUsername() as string) &&
            dayjs(attendee.night.night_date).isSame(dayjs(movieDate), "day"),
        ),
      );
    }
  }, [attendeesList, movieDate]);

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
    joinMovieNight(movieNightData, getUsername(), dayjs().toISOString()).then(
      () => {
        fetchAttendees();
      },
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
          label={userAttending ? "Dołączono" : "Dołącz"}
          onClick={handleJoinMovieNight}
          disabled={userAttending}
        ></Button>
      </div>
    </Dialog>
  );
};
