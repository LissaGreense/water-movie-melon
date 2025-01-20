import { FC, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { postNewPassword } from "../connections/internal/user.ts";
import { getUsername } from "../utils/accessToken.ts";
import { ResultResponse } from "../types/internal/common.ts";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../constants/paths.ts";

interface PasswordChangeDialogProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const PasswordChangeDialog: FC<PasswordChangeDialogProps> = ({
  visible,
  setVisible,
}) => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");
  const navigate = useNavigate();

  const handlePasswordChange = async () => {
    await postNewPassword(getUsername(), oldPassword, newPassword)
      .then((r: ResultResponse) => {
        if (r["result"] == "OK") {
          setVisible(false);
        }
      })
      .catch((error) => {
        if (error.response.data.status === 401) {
          navigate(LOGIN);
        } else {
          alert(
            "Wystąpił błąd przy zmianie hasła: " +
              error["response"]["data"]["error"],
          );
        }
      });
  };

  return (
    <Dialog visible={visible} onHide={() => setVisible(false)}>
      <div className="password-container">
        {visible && (
          <form className="password-form">
            <p>Stare hasło:</p>
            <Password
              name="old_password"
              type="password"
              placeholder="Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <p>Nowe hasło:</p>
            <Password
              name="new_password"
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </form>
        )}
      </div>
      <div className="password-controls">
        <Button onClick={handlePasswordChange}>Zmień Hasło</Button>
      </div>
    </Dialog>
  );
};
