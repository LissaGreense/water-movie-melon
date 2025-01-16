import { MenuItem, MenuItemCommandEvent } from "primereact/menuitem";
import { Avatar } from "primereact/avatar";
import { clearUser, getUsername } from "../utils/accessToken.ts";
import { useNavigate } from "react-router-dom";
import {
  ACCOUNT,
  CALENDAR,
  HOMEPAGE,
  LOGIN,
  MOVIES,
  REGISTER,
} from "../constants/paths.ts";
import React, { useEffect, useState } from "react";
import { getAvatar } from "../connections/internal/user.ts";
import "./movieMenu.css";
import { Menu } from "primereact/menu";

export default function MovieMenu() {
  const backend_url = "http://localhost:8000";
  const [avatar, setAvatar] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (getUsername()) {
      getAvatar(getUsername() as string)
        .then((r) => {
          if (r.avatar_url == "") {
            alert("Error fetching avatar...");
          }
          setAvatar(backend_url + r.avatar_url);
        })
        .catch((error) => {
          if (error.response.status === 403) {
            clearUser();
          } else {
            alert("Error fetching avatar...");
          }
        });
    } else {
      setAvatar("");
    }
  }, [getUsername()]);

  const itemRenderer = (item: MenuItem) => (
    <div className="p-menuitem-content">
      <a
        className="align-items-center p-menuitem-link seed"
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
        <span>{item.label}</span>
      </a>
    </div>
  );
  const itemsLogged: MenuItem[] = [
    {
      template: () => {
        return (
          <div onClick={() => navigate(ACCOUNT)} className="center">
            <div>
              <Avatar
                image={avatar}
                className="cursor-pointer"
                label="u"
                shape="circle"
                size="large"
              />
            </div>
            <span className="font-bold cursor-pointer">{getUsername()}</span>
          </div>
        );
      },
    },
    {
      label: "Kokpit",
      template: itemRenderer,
      command: () => {
        navigate(HOMEPAGE);
      },
    },
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
    {
      label: "Wyloguj",
      template: itemRenderer,
      command: () => {
        clearUser();
        navigate(HOMEPAGE);
      },
    },
  ];
  const itemsNotLogged: MenuItem[] = [
    {
      label: "Zaloguj",
      template: itemRenderer,
      command: () => {
        navigate(LOGIN);
      },
    },
    {
      label: "Zarejestruj",
      template: itemRenderer,
      command: () => {
        navigate(REGISTER);
      },
    },
  ];
  return (
    <Menu
      className={"vertical-menu"}
      model={getUsername() ? itemsLogged : itemsNotLogged}
    />
  );
}
