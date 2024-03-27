import {FC, useEffect, useState} from "react";


interface MovieNightCounterProps {
  nextNightDate: Date;
}

export const MovieNightCounter: FC<MovieNightCounterProps> = ({nextNightDate}) => {
  const nextNightTime = nextNightDate.getTime();
  const [countDown, setCountDown] = useState(
      nextNightTime - new Date().getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(nextNightTime - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [nextNightTime]);

  const getHourValue = () => {
    return Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
  }
  const getMinutesValue = () => {
    return Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  }
  const getSecondsValue = () => {
    return Math.floor((countDown % (1000 * 60)) / 1000);
  }

  if (countDown <= 0) {
    return (
        <div>
          Oglądamy!
        </div>
    )
  } else {
    return (
        <div>
          {getHourValue()}:{getMinutesValue()}:{getSecondsValue()}
        </div>
    )
  }

}