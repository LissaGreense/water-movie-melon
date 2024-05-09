import {Accordion, AccordionTab} from "primereact/accordion";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {postMovieNight} from "../connections/internal/movieNight.ts";
import {FC, useState} from "react";
import {Calendar} from "primereact/calendar";
import dayjs from "dayjs";


interface MovieDateProps {
    movieDate: Date;
}
export const NewMovieNightForm: FC<MovieDateProps> = ({movieDate}): JSX.Element => {
    const [nightTime, setNightTime] = useState();

    return (
        <Accordion className={"addMovieNight"} activeIndex={1}>
            <AccordionTab header={'Dodaj Wieczór Filmowy'}>
                <form onSubmit={(e: any) => {
                    e.preventDefault();
                    postMovieNight('test_user', dayjs(movieDate).format('YYYY-MM-DD ')+dayjs(nightTime).format('HH:mm'), e.target.location.value);
                }}>

                    <div className="p-inputgroup flex-1">
                        <span className="p-inputgroup-addon">Data Wieczoru</span>
                        <Calendar value={movieDate} dateFormat={'dd-mm-yy'} disabled/>
                        <Calendar value={nightTime} onChange={(e) => setNightTime(e.value)} timeOnly hourFormat="24"/>
                    </div>
                    <div className="p-inputgroup flex-1">
                        <span className="p-inputgroup-addon">Lokacja</span>
                        <InputText placeholder="eg. chata starej pepe" name={'location'}/>
                    </div>
                    <Button label="Dodaj Wieczór" icon="pi pi-check" type={"submit"}/>
                </form>
            </AccordionTab>
        </Accordion>
    )

}