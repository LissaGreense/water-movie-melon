import { Calendar } from "primereact/calendar";
import { useEffect, useState } from "react";
import { NewMovieNightForm } from "./newMovieNightForm.tsx";
import { getMovieNights } from "../connections/internal/movieNight.ts";
import dayjs from "dayjs";
import { MovieNightAttend } from "./movieNightAttend.tsx";
import { MovieRate } from "./movieRate.tsx";

export const MovieCalendar = () => {
  const dateFormat = "YYYY-MM-DD";
  const [date, setDate] = useState<Date | null>(null);
  const [nightDates, setNightDates] = useState<string[]>([]);
  const [visibleAdd, setAddVisible] = useState<boolean>(false);
  const [visibleJoin, setJoinVisible] = useState<boolean>(false);
  const [visibleRate, setRateVisible] = useState<boolean>(false);

  useEffect(() => {
    getMovieNights()
      .then((nights) => {
        setNightDates(nights.map((x) => x.night_date?.split("T")[0]));
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
      });
  }, []);

  const dateTemplate = (calendarDate: any) => {
    const formattedDate = dayjs(
      new Date(calendarDate.year, calendarDate.month, calendarDate.day),
    ).format(dateFormat);
    if (nightDates.includes(formattedDate)) {
      return (
        <strong style={{ textDecoration: "line-through" }}>
          {calendarDate.day}
        </strong>
      );
    } else {
      return calendarDate.day;
    }
  };

  const handleJoinOrAdd = (e: any) => {
    setDate(e.value);
    if (
      nightDates.includes(dayjs(e.value).format(dateFormat).split("T")[0]) &&
      dayjs(Date()) > dayjs(e.value)
    ) {
      setRateVisible(true);
    } else if (
      nightDates.includes(dayjs(e.value).format(dateFormat).split("T")[0])
    ) {
      setJoinVisible(true);
    } else {
      setAddVisible(true);
    }
  };

  return (
    <>
      <div className={"logoBar"}></div>
      <div className={"pageContentCalendar"}>
        <div className={"melonStyleCalendar"} />
        <Calendar
          value={date}
          dateTemplate={dateTemplate}
          onChange={handleJoinOrAdd}
          dateFormat="yy-mm-dd"
          inline
        />
        <div />
        <div>
          <NewMovieNightForm
            movieDate={date}
            isVisible={visibleAdd}
            setVisible={setAddVisible}
          />
        </div>
        <div>
          <MovieNightAttend
            movieDate={date}
            isVisible={visibleJoin}
            setVisible={setJoinVisible}
          />
        </div>
        <div>
          <MovieRate
            movieDate={date}
            isVisible={visibleRate}
            setVisible={setRateVisible}
          />
        </div>
      </div>
    </>
  );
};
