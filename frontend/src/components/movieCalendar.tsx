import {Calendar} from "primereact/calendar";
import {useEffect, useState} from "react";
import {NewMovieNightForm} from "./newMovieNightForm.tsx";
import {getMovieNights} from "../connections/internal/movieNight.ts";
import dayjs from "dayjs";
import {MovieNightAttend} from "./movieNightAttend.tsx";


export  const MovieCalendar = () => {
    const [date, setDate] = useState(null)
    const [nightDates, setNightDates] = useState<string[]>([]);
    const [visibleAdd, setAddVisible] = useState(false);
    const [visibleJoin, setJoinVisible] = useState(false)

    useEffect(() => {
        getMovieNights()
            .then((nights) => {
                setNightDates(nights.map(x => x.night_date.split('T')[0]));
                console.log(nights)
            })
            .catch((error) => {
                console.error('Error fetching movies:', error);
            });
    }, []);

    const dateTemplate = (calendarDate: any) => {
        const formattedDate = dayjs(new Date(calendarDate.year, calendarDate.month, calendarDate.day)).format('YYYY-MM-DD')
        if (nightDates.includes(formattedDate)) {
            return (
                <strong style={{ textDecoration: 'line-through' }}>{calendarDate.day}</strong>
            );
        }
        else {
            return (calendarDate.day)
        }
    }

    return (
        <>
            <div className={'logoBar'}>
            </div>
            <div className={'pageContentCalendar'}>
                <div className={'melonStyleCalendar'}/>
                    <Calendar value={date}
                              dateTemplate={dateTemplate}
                              onChange={(e) => {
                                  setDate(e.value);
                                  if (nightDates.includes(dayjs(e.value).format('YYYY-MM-DD').split('T')[0]))  {
                                      setJoinVisible(true);
                                  } else {
                                      setAddVisible(true);
                                  }
                              }}
                              dateFormat="yy-mm-dd" inline/>
                <div/>
                <div>
                    <NewMovieNightForm movieDate={date} isVisible={visibleAdd} setVisible={setAddVisible}/>
                </div>
                <div>
                    <MovieNightAttend movieDate={date} isVisible={visibleJoin} setVisible={setJoinVisible}/>
                </div>
            </div>
        </>
    )
}