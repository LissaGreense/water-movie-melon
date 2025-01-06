import { InputText } from "primereact/inputtext";
import "./loginPage.css";
import { Button } from "primereact/button";
import React, { ChangeEvent, MouseEventHandler, useState } from "react";
import { login, logout } from "../connections/internal/authentication.ts";
import { useNavigate } from "react-router-dom";
import { clearUser, getUsername, setUsername } from "../utils/accessToken.ts";
import { HOMEPAGE, LOGIN } from "../constants/paths.ts";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    username: "",
    password: "",
  });

  const handleSubmitEvent: MouseEventHandler<HTMLElement> = (e) => {
    e.preventDefault();
    if (input.username !== "" && input.password !== "") {
      login(input.username, input.password)
        .then((r) => {
          console.log("eo");
          setUsername(input.username);
          navigate(HOMEPAGE);
        })
        .catch(() => {
          alert("Ojoj, chyba nie jesteś arbuzem...");
        });
    } else {
      alert("Username and password should be filled!");
    }
  };
  const handleLogoutEvent = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    logout()
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        clearUser();
        navigate(LOGIN);
      });
  };
  const handleInput = (e: ChangeEvent) => {
    const { name, value } = e.currentTarget as HTMLInputElement;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const getLoginPanel = () => {
    if (getUsername() == undefined) {
      return (
        <div className={"loginContainer melonStyleContainerFruit"}>
          <div className={"topLoginBar melonStyleContainerPeel"}>
            <h2>UDOWODNIJ, ZE JESTEŚ ARBUZEM</h2>
          </div>
          <form>
            <div>
              <InputText
                name={"username"}
                type="text"
                className="m-2"
                placeholder="Username"
                onChange={handleInput}
              />
            </div>

            <div>
              <InputText
                name={"password"}
                type="password"
                className="m-2"
                placeholder="Password"
                onChange={handleInput}
                autoComplete="on"
              />
            </div>
            <div>
              <Button
                className="m-2"
                label="Uroczyście przysięgam"
                onClick={handleSubmitEvent}
              />
            </div>
          </form>
        </div>
      );
    } else {
      return (
        <div className={"loginContainer melonStyleContainerFruit"}>
          <div className={"topLoginBar melonStyleContainerPeel"}>
            <h2>JUŻ UDOWODNIŁEŚ SWOJĄ WARTOŚĆ</h2>
          </div>

          <div className="m-2">
            <Button label="Wystarczy Arbużenia" onClick={handleLogoutEvent} />
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className={"pageContent center"}>{getLoginPanel()}</div>
    </>
  );
};
