import { FC, useEffect, useState } from "react";
import "./movieNightCounter.css";
import {
  checkForNights,
  getRandomMovie,
} from "../connections/internal/movieNight.ts";
import { Movie } from "../types/internal/movie.ts";
import "./bucketWithCovers.css"

interface MovieNightCounterProps {
  nextNightDate: Date;
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

  const isCountDownFinished = (countDown as number) <= 0;

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
    setNextNightTime(nextNightDate.getTime());
    setCountDown(nextNightDate.getTime() - new Date().getTime());
  }, [nextNightDate]);

  useEffect(() => {
    try {
      getRandomMovie().then((m) => {
        if (m) {
          setTodayMovie(m);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, [isCountDownFinished]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown((nextNightTime as number) - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [nextNightTime]);

  const getDaysValue = () => {
    return Math.floor(
      ((countDown as number) % millisecondsInYear) / millisecondsInDay,
    );
  };

  // TODO: @LissaGreense this part "(1000 * 60 * 60 * 24)) / (1000 * 60 * 60)" is not clear. Move it to func/var and name properly. As a developer we shouldn't write complex code to check others intelligence ;P
  const getHourValue = () => {
    return Math.floor(
      ((countDown as number) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
  };
  const getMinutesValue = () => {
    return Math.floor(((countDown as number) % (1000 * 60 * 60)) / (1000 * 60));
  };
  const getSecondsValue = () => {
    return Math.floor(((countDown as number) % (1000 * 60)) / 1000);
  };

  if (!areThereNights) {
    return (
      <div className={"counterContainer"}>
        <h2>Nie ma planów :|</h2>
      </div>
    );
  } else if ((countDown as number) <= 0) {
    return (
      <>
        <div className={"counterContainer"}>
          <h2>Oglądamy {todayMovie?.title}!</h2>
        </div>
        <div className={"movieChosenCover"}>
          <img className={isCountDownFinished ? "movieChosenCoverAnimation" : ""} src={todayMovie?.cover_link} alt={"Dzisiejszy film"}/>
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
