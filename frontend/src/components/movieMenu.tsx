import {Menu} from 'primereact/menu';
import {MenuItem} from 'primereact/menuitem';
import {Avatar} from "primereact/avatar";
import {clearAccessToken, getAccessToken, getUsername} from "../utils/accessToken.ts";
import {useNavigate} from "react-router-dom";
import {ACCOUNT, CALENDAR, HOMEPAGE, LOGIN, MOVIES, NEW_MOVIE} from "../constants/paths.ts";
import {getRandomMovie} from "../connections/internal/movieNight.ts";


export default function MovieMenu() {
  const navigate = useNavigate();
  const itemRenderer = (item: any) => (
      <div className='p-menuitem-content'>
        <a className="flex align-items-center p-menuitem-link" onClick={item.command}>
          <span className={item.icon}/>
          <span className="textSans">{item.label}</span>
        </a>
      </div>
  );
  const itemsLogged: MenuItem[] = [
    {
      template: () => {
        return (
            <button onClick={() => navigate(ACCOUNT)}>
              <Avatar label='u' className="mr-2" shape="circle"/>
              <div className="flex flex-column align">
                <span className="font-bold">{getUsername()}</span>
              </div>
            </button>
        );
      }
    },
    {
      separator: true
    },
    {
      label: 'Konto',
      items: [
        {
          label: 'Wyloguj',
          template: itemRenderer,
          command: () => {
            clearAccessToken();
            navigate(HOMEPAGE);
          }
        }
      ]
    },
    {
      label: 'Filmy',
      items: [
        {
          label: 'Filmy',
          template: itemRenderer,
          command:() => {
            navigate(MOVIES)
          }
        },
        {
          label: 'Dodaj Film',
          template: itemRenderer,
          command:() => {
            navigate(NEW_MOVIE)
          }
        },
        {
          label: 'Kalendarz',
          template: itemRenderer,
          command:() => {
            navigate(CALENDAR)
          }
        },
        {
          label: 'guzikdoklikania',
          template: itemRenderer,
          command:() => {
            getRandomMovie()
          }
        },
      ]
    },
    {
      separator: true
    }
  ]
  const itemsNotLogged: MenuItem[] = [
    {
      label: '',
      items: [
        {
          label: 'Zaloguj',
          template: itemRenderer,
          command: () => {
            navigate(LOGIN);
          }
        }
      ]
    },
  ]
  return (
      <div className="card flex flex-column md:flex-row align-content-end">
        <Menu model={getAccessToken() ? itemsLogged : itemsNotLogged} className="flex flex-column md:flex-row align-content-end"/>
      </div>
  )
}