import {Area} from "react-easy-crop";

const createImage = (url: string | ArrayBuffer | undefined): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        if (typeof url === "string") {
            image.src = url;
        }
    });

const getCroppedImg = async (imageSrc: string | ArrayBuffer | undefined, crop: Area | null): Promise<unknown | Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    const { x, y, width, height } = crop;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (blob) {
                (blob as any).name = 'cropped.jpg';
                resolve(blob);
            } else {
                resolve(null);
            }
        }, 'image/jpeg');
    });
};

export default getCroppedImg;
