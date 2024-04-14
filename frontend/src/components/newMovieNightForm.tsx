import {Accordion, AccordionTab} from "primereact/accordion";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {postMovieNight} from "../connections/internal/movieNight.ts";
import {Calendar} from "primereact/calendar";

export const NewMovieNightForm = () => {
    return (
        <Accordion className={"addMovieNight"} activeIndex={1}>
            <AccordionTab header={'Dodaj Wieczór Filmowy'}>
                <form onSubmit={(e: any) => {
                    e.preventDefault();
                    postMovieNight('test_user', e.target.night_date.value, e.target.location.value);
                }}>

                    <div className="p-inputgroup flex-1">
                        <span className="p-inputgroup-addon">Data Wieczoru</span>
                        <Calendar name={'night_date'} dateFormat="yy-mm-dd"/>
                    </div>
                    <div className="p-inputgroup flex-1">
                        <span className="p-inputgroup-addon">Lokacja</span>
                        <InputText placeholder="eg. komedia" name={'location'}/>
                    </div>
                    <Button label="Dodaj Film" icon="pi pi-check" type={"submit"}/>
                </form>
            </AccordionTab>
        </Accordion>
    )

}