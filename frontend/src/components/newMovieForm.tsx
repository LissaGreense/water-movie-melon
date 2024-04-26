import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {Accordion, AccordionTab} from "primereact/accordion";
import {postMovie} from "../connections/internal/movie.ts";
import dayjs from 'dayjs'
import {InputNumber} from "primereact/inputnumber";

export const NewMovieForm = () => {
  return (
      <Accordion className={"addMovies"} activeIndex={1}>
        <AccordionTab header={'Dodaj Film'}>
          <form onSubmit={(e: any) => {
            e.preventDefault();
            postMovie(e.target.title.value, e.target.link.value,'testUser', dayjs().format('YYYY-MM-DD HH:mm'), e.target.genre.value, e.target.cover_link.value, e.target.duration.value);
          }}>

            <div className="p-inputgroup flex-1">
              <span className="p-inputgroup-addon">Tytuł</span>
              <InputText placeholder="eg. Superzioło" name={'title'}/>
            </div>
            <div className="p-inputgroup flex-1">
              <span className="p-inputgroup-addon">Gatunek</span>
              <InputText placeholder="eg. komedia" name={'genre'}/>
            </div>
            <div className="p-inputgroup flex-1">
              <span className="p-inputgroup-addon">Czas trwania</span>
              <InputNumber placeholder="w minutach" name={'duration'}/>
            </div>
            <div className="p-inputgroup flex-1">
              <span className="p-inputgroup-addon">Link do filmu</span>
              <InputText placeholder="eg. cda.pl/..." name={'link'}/>
            </div>
            <div className="p-inputgroup flex-1">
              <span className="p-inputgroup-addon">Link do okładki</span>
              <InputText placeholder="eg. google.com/..." name={'cover_link'}/>
            </div>
            <Button label="Dodaj Film" icon="pi pi-check" type={"submit"}/>
          </form>
        </AccordionTab>
      </Accordion>
  )

}

