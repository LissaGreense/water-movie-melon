import {InputText} from "primereact/inputtext";
import './loginPage.css'
import {Button} from "primereact/button";
import {useState} from "react";
import {login} from "../connections/internal/authentication.ts";
import {useNavigate} from "react-router-dom";
import {clearAccessToken, getAccessToken, saveAccessToken} from "../utils/accessToken.ts";
import {LOGIN} from "../constants/paths.ts";


export const LoginPage = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    username: "",
    password: "",
  });

  const handleSubmitEvent = (e: any) => {
    e.preventDefault();
    if (input.username !== "" && input.password !== "") {
      login(input.username, input.password).then(r => {
        if (r.token === '') {
          alert("Ojoj, chyba nie jesteś arbuzem...")
        } else {
          saveAccessToken(r.token, input.username);
          navigate(LOGIN);
        }
      })
    } else {
      alert("Username and password should be filled!")
    }
  };
  const handleLogoutEvent = (e: any) => {
    e.preventDefault();
    clearAccessToken();
    navigate(LOGIN);
  };
  const handleInput = (e: any) => {
    const {name, value} = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const getLoginPanel = () => {
    if (getAccessToken() === null) {
      return <div className={'loginContainer'}>
        <div className={'waterMelonPeel'}>
          <h2>
            UDOWODNIJ, ZE JESTEŚ ARBUZEM
          </h2>
        </div>
        <form>
          <div>
            <InputText name={"username"} type="text" placeholder="Username" onChange={handleInput}/>
          </div>

          <div>
            <InputText name={"password"} type="password" placeholder="Password"
                       onChange={handleInput} autoComplete="on"/>
          </div>
          <div>
            <Button label="Uroczyście przysięgam" onClick={handleSubmitEvent}/>
          </div>
        </form>

      </div>;
    } else {
      return <div className={'loginContainer'}>
        <div className={'waterMelonPeel'}>
          <h2>
            JUŻ UDOWODNIŁEŚ SWOJĄ WARTOŚĆ
          </h2>
        </div>

        <div>
          <Button label="Wystarczy Arbużenia" onClick={handleLogoutEvent}/>
        </div>
      </div>
    }

  }

  return (
      <>
        <div className={'pageContent center'}>
          {getLoginPanel()}
        </div>
      </>
  )
}