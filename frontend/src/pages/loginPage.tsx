import {InputText} from "primereact/inputtext";
import './loginPage.css'
import {Button} from "primereact/button";
import {useState} from "react";
import {login} from "../connections/internal/authentication.ts";


export const LoginPage = () => {
  const [input, setInput] = useState({
    username: "",
    password: "",
  });

  const handleSubmitEvent = (e) => {
    e.preventDefault();
    if (input.username !== "" && input.password !== "") {
      login(input.username, input.password).then(r => console.log(r.token))
    } else {
      alert("Username and password should be filled!")
    }
  };
  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  function getLoginPanel() {
    return <div className={'loginContainer'}>
      <div className={'waterMelonPeel'}>
        <h2>
          UDOWODNIJ, ZE JESTEŚ ARBUZEM
        </h2>
      </div>
      <div>
        <InputText name={"username"} type="text" placeholder="Username" onChange={handleInput}/>
      </div>

      <div>
        <InputText name={"password"} type="password" placeholder="Password" onChange={handleInput}/>
      </div>
      <div>
        <Button label="Uroczyście przysięgam" onClick={handleSubmitEvent}/>
      </div>
    </div>;
  }

  return (
      <>
        <div className={'pageContent center'}>
          {getLoginPanel()}
        </div>
      </>
  )
}