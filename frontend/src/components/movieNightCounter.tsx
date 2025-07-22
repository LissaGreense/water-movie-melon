import { FC, useEffect, useState } from "react";
import "./movieNightCounter.css";
import {
  checkForNights,
  getSelectedMovie,
} from "../connections/internal/movieNight.ts";
import { Movie } from "../types/internal/movie.ts";

interface MovieNightCounterProps {
  nextNightDate: Date | null;
}

export const MovieNightCounter: FC<MovieNightCounterProps> = ({
  nextNightDate,
}) => {
  const [nextNightTime, setNextNightTime] = useState<number>();
  const [todayMovie, setTodayMovie] = useState<Movie>();
  const [countDown, setCountDown] = useState<number>(7);
  const [areThereNights, setAreThereNights] = useState<boolean>(false);
  const millisecondsInYear = 1000 * 60 * 60 * 24 * 365;
  const millisecondsInDay = 1000 * 60 * 60 * 24;
  const millisecondsInHour = 1000 * 60 * 60;
  const millisecondsInMinute = 1000 * 60;
  const millisecondsInSecond = 1000;

  const isCountDownFinished = (countDown as number) <= 0;

  const shouldShowSelectedMovie = (): boolean => {
    if (!todayMovie) return false;
    if (!nextNightDate) return false;

    // Show when countdown is finished (<= 0) and within 1 hour after movie night time
    if (countDown > 0) return false;

    // Show for at least 1 hour after movie night time
    const hourAfterNight = nextNightDate.getTime() + millisecondsInHour;
    return new Date().getTime() <= hourAfterNight;
  };

  useEffect(() => {
    try {
      checkForNights().then((data) => {
        setAreThereNights(data);
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (nextNightDate) {
      const nightTime = nextNightDate.getTime();
      const initialCountDown = nightTime - new Date().getTime();
      setNextNightTime(nightTime);
      setCountDown(initialCountDown);
    } else {
      setNextNightTime(undefined);
      setCountDown(0);
    }
  }, [nextNightDate]);

  useEffect(() => {
    const fetchSelectedMovie = () => {
      try {
        getSelectedMovie().then((m) => {
          if (m) {
            setTodayMovie(m);
          } else {
            setTodayMovie(undefined);
          }
        });
      } catch (error) {
        console.error("fetchSelectedMovie error:", error);
      }
    };

    // Only fetch when countdown reaches 0
    if (countDown <= 0) {
      fetchSelectedMovie();
    }
  }, [countDown]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (nextNightTime) {
        const newCountDown = nextNightTime - new Date().getTime();
        setCountDown(newCountDown);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextNightTime]);

  const getCountdownValues = () => {
    if (!nextNightTime || countDown <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(
        ((countDown as number) % millisecondsInYear) / millisecondsInDay,
      ),
      hours: Math.floor(
        ((countDown as number) % millisecondsInDay) / millisecondsInHour,
      ),
      minutes: Math.floor(
        ((countDown as number) % millisecondsInHour) / millisecondsInMinute,
      ),
      seconds: Math.floor(
        ((countDown as number) % millisecondsInMinute) / millisecondsInSecond,
      ),
    };
  };

  const getDaysValue = () => getCountdownValues().days;
  const getHourValue = () => getCountdownValues().hours;
  const getMinutesValue = () => getCountdownValues().minutes;
  const getSecondsValue = () => getCountdownValues().seconds;

  if (!areThereNights) {
    return (
      <div className={"counterContainer"}>
        <h2>Nie ma planów :|</h2>
      </div>
    );
  } else if (shouldShowSelectedMovie()) {
    return (
      <>
        <div className={"counterContainer"}>
          <h2>Oglądamy {todayMovie?.title}!</h2>
        </div>
        <div className={"movieChosenCover"}>
          <img
            className={isCountDownFinished ? "movieChosenCoverAnimation" : ""}
            src={todayMovie?.cover_link}
            alt={"Dzisiejszy film"}
          />
        </div>
      </>
    );
  } else {
    return (
      <div className={"counterContainer"}>
        <h2>
          {getDaysValue()}d:{getHourValue()}h:{getMinutesValue()}m:
          {getSecondsValue()}s
        </h2>
      </div>
    );
  }
};
