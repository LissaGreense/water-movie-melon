import { Menu } from 'primereact/menu';

import { MenuItem } from 'primereact/menuitem';
import {Avatar} from "primereact/avatar";


export default function MovieHomePage() {
const itemRenderer = (item: any) => (
        <div className='p-menuitem-content'>
            <a className="flex align-items-center p-menuitem-link">
                <span className={item.icon} />
                <span className="mx-2">{item.label}</span>
            </a>
        </div>
    );
    let items: MenuItem[] = [
        {
            template: () => {
                return (
                    <button>
                        <Avatar label='u' className="mr-2" shape="circle" />
                        <div className="flex flex-column align">
                            <span className="font-bold">Twoja Stara</span>
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
                    label: 'Ustawienia',
                    template: itemRenderer
                },
                {
                    label: 'Wyloguj',
                    template: itemRenderer
                }
            ]
        },
        {
            label: 'Filmy',
            items: [
                {
                    label: 'Dodaj Film',
                    template: itemRenderer
                },
                {
                    label: 'Oceń Film',
                    template: itemRenderer
                },
                {
                    label: 'Wieczory',
                    template: itemRenderer
                },
            ]
        },
        {
            separator: true
        }
    ]

    return (
        <div className="card flex justify-content-center">
            <Menu model={items} className="w-full md:w-15rem"  />
        </div>
    )
}