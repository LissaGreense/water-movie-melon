import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {Accordion, AccordionTab} from "primereact/accordion";
import {postMovie} from "../connections/internal/movie.ts";
import dayjs from 'dayjs'
import {InputNumber} from "primereact/inputnumber";
import {getUsername} from "../utils/accessToken.ts";

export const NewMovieForm = () => {
  return (
      <Accordion className={"addMovies"} activeIndex={1}>
        <AccordionTab className="melonStyleContainerPeel textSansNoBorder" header={'Dodaj Film'}>
          <form onSubmit={(e: any) => {
            e.preventDefault();
            postMovie(e.target.title.value, e.target.link.value, getUsername(), dayjs().format('YYYY-MM-DD HH:mm'), e.target.genre.value, e.target.cover_link.value, e.target.duration.value);
          }}>

            <div className="melonStyleContainerPeel p-inputgroup flex-1">
              <span className="melonStyleContainerPeel p-inputgroup-addon">Tytuł</span>
              <InputText className="melonStyleContainerPeel" placeholder="eg. Superzioło" name={'title'}/>
            </div>
            <div className="melonStyleContainerPeel p-inputgroup flex-1">
              <span className="melonStyleContainerPeel p-inputgroup-addon">Gatunek</span>
              <InputText className="melonStyleContainerPeel" placeholder="eg. komedia" name={'genre'}/>
            </div>
            <div className="melonStyleContainerPeel p-inputgroup flex-1">
              <span className="melonStyleContainerPeel p-inputgroup-addon">Czas trwania</span>
              <InputNumber className="melonStyleContainerPeel" placeholder="w minutach" name={'duration'}/>
            </div>
            <div className="melonStyleContainerPeel p-inputgroup flex-1">
              <span className="melonStyleContainerPeel p-inputgroup-addon">Link do filmu</span>
              <InputText className="melonStyleContainerPeel" placeholder="eg. cda.pl/..." name={'link'}/>
            </div>
            <div className="melonStyleContainerPeel p-inputgroup flex-1">
              <span className="melonStyleContainerPeel p-inputgroup-addon">Link do okładki</span>
              <InputText className="melonStyleContainerPeel" placeholder="eg. google.com/..." name={'cover_link'}/>
            </div>
            <Button className="melonStyleContainerPeel" label="Dodaj Film" icon="pi pi-check" type={"submit"}/>
          </form>
        </AccordionTab>
      </Accordion>
  )

}

