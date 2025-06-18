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
import React, { useCallback, useEffect, useState } from "react";
import { getAvatar } from "../connections/internal/user.ts";
import "./movieMenu.css";
import { Menu } from "primereact/menu";
import { logout } from "../connections/internal/authentication.ts";
import { DEFAULT_BACKEND_URL } from "../constants/defaults.ts";

export default function MovieMenu() {
  const [avatar, setAvatar] = useState<string>("");
  const navigate = useNavigate();

  const fetchAvatar = useCallback(() => {
    const username = getUsername();
    if (username) {
      getAvatar(username as string)
        .then((r) => {
          if (r.avatar_url == "") {
            console.error("Error fetching avatar...");
          }
          setAvatar(DEFAULT_BACKEND_URL + r.avatar_url);
        })
        .catch((error) => {
          if (error.response.status === 403) {
            clearUser();
            navigate(LOGIN);
          } else {
            console.error("Error fetching avatar...");
          }
          setAvatar("");
        });
    } else {
      setAvatar("");
    }
  }, [navigate]);

  useEffect(() => {
    fetchAvatar();

    window.addEventListener("avatarUpdated", fetchAvatar);

    return () => {
      window.removeEventListener("avatarUpdated", fetchAvatar);
    };
  }, [fetchAvatar]);

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
        logout()
          .catch((err) => {
            console.error(err);
          })
          .finally(() => {
            clearUser();
            navigate(HOMEPAGE);
          });
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
