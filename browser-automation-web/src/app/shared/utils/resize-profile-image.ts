/** Max edge length after resize (keeps avatars sharp without huge data URLs). */
const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.88;

/**
 * Downscale an image file for profile storage. Original file size is not limited.
 */
export function resizeProfileImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      const longest = Math.max(width, height);
      if (longest > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / longest;
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not process image'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const usePng = file.type === 'image/png';
      const dataUrl = usePng
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load image'));
    };

    img.src = objectUrl;
  });
}
