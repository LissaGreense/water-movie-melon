import "./accountPage.css";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { clearAccessToken, getUsername } from "../utils/accessToken.ts";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../constants/paths.ts";
import {
  getAvatar,
  getStatistics,
  uploadAvatar,
} from "../connections/internal/user.ts";
import { useCallback, useEffect, useState } from "react";
import { FileUpload } from "primereact/fileupload";
import Cropper, { Area } from "react-easy-crop";
import { Dialog } from "primereact/dialog";
import getCroppedImg from "../utils/image.ts";
import { Statistics } from "../types/internal/user.ts";

export const AccountPage = () => {
  const navigate = useNavigate();
  const backend_url = "http://localhost:8000";
  const [avatar, setAvatar] = useState<string>("");
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<
    string | ArrayBuffer | null
  >();
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [userStatistics, setUserStatistics] = useState<Statistics | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const handleLogoutEvent = (e: any) => {
    e.preventDefault();
    clearAccessToken();
    navigate(LOGIN);
  };
  const handleAvatarChangeError = () => {
    alert("Cos poszło nie tak kiedy dodawałeś swoją arbuzową fotę!");
  };
  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropImage = (e: { files: File[] }) => {
    const file = e.files.pop();
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setCurrentImage(reader.result);
      };
    }
    setShowCropper(true);
    setCurrentImage(undefined);
  };

  const handleUploadImage = async () => {
    const croppedImage = await getCroppedImg(currentImage, croppedAreaPixels);
    await uploadAvatar(getUsername(), croppedImage);
    setShowCropper(false);
  };

  useEffect(() => {
    getAvatar(getUsername() as string).then((r) => {
      if (r.avatar_url == "") {
        alert("Error fetching avatar...");
      }
      setAvatar(backend_url + r.avatar_url);
    });
  }, [showCropper]);

  useEffect(() => {
    getStatistics(getUsername() as string).then(async (r) => {
      if (r === null) {
        alert("Error fetching statistics...");
      } else {
        setUserStatistics(await r);
      }
    });
  }, []);

  return (
    <div className={"pageContent center"}>
      <Dialog
        visible={showCropper}
        style={{ width: "50vw", height: "30vw" }}
        onHide={() => setShowCropper(false)}
      >
        <div className="crop-container">
          {showCropper && (
            <Cropper
              image={currentImage as string}
              aspect={1}
              objectFit="vertical-cover"
              onCropChange={setCrop}
              crop={crop}
              zoom={zoom}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          )}
        </div>
        <div className="crop-controls">
          <Button onClick={handleUploadImage}>Załaduj</Button>
        </div>
      </Dialog>
      <div className={"accountContainer"}>
        <div className={"watermelonPeel"}>
          <h2>KONTO</h2>
        </div>
        <div className={"userSummary"}>
          <div className={"half-left"}>
            <div className={"avatar-space"}>
              <Image src={avatar} height={"150px"} />
              <FileUpload
                mode="basic"
                name="avatar"
                accept="image/*"
                maxFileSize={1000000}
                auto
                chooseLabel="ZMIEŃ AVATAR"
                onError={handleAvatarChangeError}
                customUpload={true}
                onSelect={handleCropImage}
              />
            </div>
            <h4>ID: {getUsername()}</h4>
          </div>
          <div className={"half-right"}>
            <Button>ZMIEŃ HASŁO</Button>
            <Button onClick={(e) => handleLogoutEvent(e)}>WYLOGUJ</Button>
          </div>
        </div>
        <div className={"statistics"}>
          <h3>DODANE FILMY: {userStatistics?.added_movies}</h3>
          <h3>FILMY Z OCENĄ 7: {userStatistics?.seven_rated_movies}</h3>
          <h3>OBEJRZANE FILMY: {userStatistics?.watched_movies}</h3>
          <h3>HOSTOWANE WIECZORY: {userStatistics?.hosted_movie_nights}</h3>
          <h3>
            NAJWYŻEJ OCENIANY FILM:{" "}
            {userStatistics?.highest_rated_movie
              ? userStatistics.highest_rated_movie
              : "Brak danych"}
          </h3>
          <h3>
            NAJNIŻEJ OCENIANY FILM:{" "}
            {userStatistics?.lowest_rated_movie
              ? userStatistics.lowest_rated_movie
              : "Brak danych"}
          </h3>
        </div>
      </div>
    </div>
  );
};
