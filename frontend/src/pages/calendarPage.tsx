import { Calendar, CalendarDateTemplateEvent } from "primereact/calendar";
import { useEffect, useState } from "react";
import { NewMovieNightForm } from "../components/newMovieNightForm.tsx";
import { getMovieNights } from "../connections/internal/movieNight.ts";
import dayjs from "dayjs";
import { MovieNightAttend } from "../components/movieNightAttend.tsx";
import { MovieRate } from "../components/movieRate.tsx";
import { FormEvent } from "primereact/ts-helpers";
import "./calendarPage.css";

export const CalendarPage = () => {
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
  }, [visibleAdd, visibleJoin, visibleRate]);

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
    const currentDate = new Date();
    setDate(e.value);
    if (
      nightDates.includes(dayjs(e.value).format(dateFormat).split("T")[0]) &&
      dayjs(currentDate.setDate(currentDate.getDate() - 1)) > dayjs(e.value)
    ) {
      setRateVisible(true);
    } else if (
      nightDates.includes(dayjs(e.value).format(dateFormat).split("T")[0])
    ) {
      setJoinVisible(true);
    } else if (
      dayjs(currentDate.setDate(currentDate.getDate() - 1)) < dayjs(e.value)
    ) {
      setAddVisible(true);
    }
  };

  const showDialog = () => {
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
  };

  return (
    <>
      <div className={"pageContentCalendar center"}>
        <Calendar
          value={date}
          dateTemplate={dateTemplate}
          onChange={handleJoinOrAdd}
          dateFormat="yy-mm-dd"
          inline
          selectionMode="single"
        />
        <div>{showDialog()}</div>
      </div>
    </>
  );
};
