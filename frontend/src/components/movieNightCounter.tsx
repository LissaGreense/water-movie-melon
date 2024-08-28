import {FC, useEffect, useState} from "react";
import "./movieNightCounter.css"
import {checkForNights, getRandomMovie} from "../connections/internal/movieNight.ts";


interface MovieNightCounterProps {
  nextNightDate: Date;
}

export const MovieNightCounter: FC<MovieNightCounterProps> = ({nextNightDate}) => {
  const [nextNightTime, setNextNightTime] = useState<number>()
  const [todaysMovie, setTodaysMovie] = useState<string>("");
  const [countDown, setCountDown] = useState<number>(7);
  const [areThereNights, setAreThereNights] = useState<boolean>(false)

  useEffect(() => {
    checkForNights().then((data) => {
      console.log(data)
      setAreThereNights(data);
    })
  }, [null]);


  useEffect(() => {
    setNextNightTime((nextNightDate).getTime())
    setCountDown(nextNightDate.getTime() - (new Date()).getTime())
  }, []);

  useEffect(() => {
    getRandomMovie().then((m) => {
      setTodaysMovie(m)
    })
  }, [countDown as number <= 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(nextNightTime as number - (new Date()).getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [nextNightTime]);

  const getDaysValue = () => {
    return Math.floor((countDown as number % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24)
    );
  }

  const getHourValue = () => {
    return Math.floor((countDown as number % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
  }
  const getMinutesValue = () => {
    return Math.floor((countDown as number % (1000 * 60 * 60)) / (1000 * 60));
  }
  const getSecondsValue = () => {
    return Math.floor((countDown as number % (1000 * 60)) / 1000);
  }

  if (!areThereNights) {
    console.log(areThereNights)
    return (
        <div className={"counterContainer"}>
          <h2>Nie ma planów :|</h2>
        </div>
    )
  }else if (countDown as number <= 0) {
    return (
        <div className={"counterContainer"}>
          <h2>Oglądamy {todaysMovie}!</h2>
        </div>
    )
  }else {
    return (
        <div className={"counterContainer"}>
          <h2>{getDaysValue()}d:{getHourValue()}h:{getMinutesValue()}m:{getSecondsValue()}s</h2>
        </div>
    )
  }

}