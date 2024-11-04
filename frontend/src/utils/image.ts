import { Area } from "react-easy-crop";

const createImage = (
  url: string | ArrayBuffer | null | undefined,
): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    if (typeof url === "string") {
      image.src = url;
    }
  });

const getCroppedImg = async (
  imageSrc: string | ArrayBuffer | null | undefined,
  crop: Area | null,
): Promise<Blob | null> => {
  if (!crop || !imageSrc) {
    return null;
  }

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        (blob as any).name = "cropped.jpg";
        resolve(blob);
      } else {
        resolve(null);
      }
    }, "image/jpeg");
  }) as Promise<Blob> | Promise<null>;
};

export default getCroppedImg;
