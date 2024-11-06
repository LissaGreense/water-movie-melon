import { Menu } from "primereact/menu";
import { MenuItem, MenuItemCommandEvent } from "primereact/menuitem";
import { Avatar } from "primereact/avatar";
import {
  clearAccessToken,
  getAccessToken,
  getUsername,
} from "../utils/accessToken.ts";
import { useNavigate } from "react-router-dom";
import {
  ACCOUNT,
  CALENDAR,
  HOMEPAGE,
  LOGIN,
  MOVIES,
} from "../constants/paths.ts";
import React, { useEffect, useState } from "react";
import { getAvatar } from "../connections/internal/user.ts";

export default function MovieMenu() {
  const backend_url = "http://localhost:8000";
  const [avatar, setAvatar] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    getAvatar(getUsername() as string).then((r) => {
      if (r.avatar_url == "") {
        alert("Error fetching avatar...");
      }
      setAvatar(backend_url + r.avatar_url);
    });
  }, []);

  const itemRenderer = (item: MenuItem) => (
    <div className="p-menuitem-content">
      <a
        className="flex align-items-center p-menuitem-link"
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();

          if (item.command) {
            item.command({
              originalEvent: e,
              item,
            } as MenuItemCommandEvent);
          }
        }}
      >
        <span className={item.icon} />
        <span className="textSans">{item.label}</span>
      </a>
    </div>
  );
  const itemsLogged: MenuItem[] = [
    {
      template: () => {
        return (
          <button onClick={() => navigate(ACCOUNT)}>
            <Avatar image={avatar} label="u" className="mr-2" shape="circle" />
            <div className="flex flex-column align">
              <span className="font-bold">{getUsername()}</span>
            </div>
          </button>
        );
      },
    },
    {
      separator: true,
    },
    {
      label: "Konto",
      items: [
        {
          label: "Wyloguj",
          template: itemRenderer,
          command: () => {
            clearAccessToken();
            navigate(HOMEPAGE);
          },
        },
      ],
    },
    {
      label: "Filmy",
      items: [
        {
          label: "Filmy",
          template: itemRenderer,
          command: () => {
            navigate(MOVIES);
          },
        },
        {
          label: "Kalendarz",
          template: itemRenderer,
          command: () => {
            navigate(CALENDAR);
          },
        },
      ],
    },
    {
      separator: true,
    },
  ];
  const itemsNotLogged: MenuItem[] = [
    {
      label: "",
      items: [
        {
          label: "Zaloguj",
          template: itemRenderer,
          command: () => {
            navigate(LOGIN);
          },
        },
      ],
    },
  ];
  return (
    <div className="card flex flex-column md:flex-row align-content-end">
      <Menu
        model={getAccessToken() ? itemsLogged : itemsNotLogged}
        className="flex flex-column md:flex-row align-content-end"
      />
    </div>
  );
}
