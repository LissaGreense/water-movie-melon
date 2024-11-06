import { Calendar, CalendarDateTemplateEvent } from "primereact/calendar";
import { useEffect, useState } from "react";
import { NewMovieNightForm } from "./newMovieNightForm.tsx";
import { getMovieNights } from "../connections/internal/movieNight.ts";
import dayjs from "dayjs";
import { MovieNightAttend } from "./movieNightAttend.tsx";
import { MovieRate } from "./movieRate.tsx";
import { FormEvent } from "primereact/ts-helpers";

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

  const dateTemplate = (calendarDate: CalendarDateTemplateEvent) => {
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

  const handleJoinOrAdd = (e: FormEvent) => {
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

  function showDialog() {
    if (visibleAdd) {
      return (
        <NewMovieNightForm
          movieDate={date}
          isVisible={visibleAdd}
          setVisible={setAddVisible}
        />
      );
    } else if (visibleJoin) {
      return (
        <MovieNightAttend
          movieDate={date}
          isVisible={visibleJoin}
          setVisible={setJoinVisible}
        />
      );
    } else if (visibleRate) {
      return (
        <MovieRate
          movieDate={date}
          isVisible={visibleRate}
          setVisible={setRateVisible}
        />
      );
    }
  }

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
          selectionMode="single"
        />
        <div />
        <div>{showDialog()}</div>
      </div>
    </>
  );
};
