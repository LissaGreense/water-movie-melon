import { FC, useCallback, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import Cropper, { Area } from "react-easy-crop";
import getCroppedImg from "../utils/image.ts";
import { uploadAvatar } from "../connections/internal/user.ts";
import { getUsername } from "../utils/accessToken.ts";
import "./cropperDialog.css";
import { LOGIN } from "../constants/paths.ts";
import { useNavigate } from "react-router-dom";

interface CropperDialogProps {
  visible: boolean;
  setShowCropper: (visible: boolean) => void;
  image: string | ArrayBuffer | null | undefined;
  onUploadComplete: () => void;
}

export const CropperDialog: FC<CropperDialogProps> = ({
  visible,
  setShowCropper,
  image,
  onUploadComplete,
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const navigate = useNavigate();

  const handleUploadImage = async () => {
    const croppedImage = await getCroppedImg(image, croppedAreaPixels);
    await uploadAvatar(getUsername(), croppedImage).catch((error) => {
      if (error.response.data.status === 401) {
        navigate(LOGIN);
      }
    });
    onUploadComplete();
    setShowCropper(false);
  };
  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  return (
    <Dialog
      visible={visible}
      style={{ width: "50vw", height: "30vw" }}
      onHide={() => setShowCropper(false)}
      transitionOptions={{
        timeout: 100,
        classNames: "fade",
      }}
    >
      <div className="crop-container">
        {visible && (
          <Cropper
            image={image as string}
            aspect={1}
            objectFit="vertical-cover"
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        )}
      </div>
      <div className="crop-controls">
        <Button onClick={handleUploadImage}>Załaduj</Button>
      </div>
    </Dialog>
  );
};
