import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Utility to convert images to webp
export const convertImagesToWebp = async (files) => {
  const convertedFiles = {};

  for (const field in files) {
    convertedFiles[field] = [];

    for (const file of files[field]) {
      const originalPath = file.path;
      const newFilename = `${path.parse(file.filename).name}.webp`;
      const newPath = path.join(path.dirname(file.path), newFilename);

      try {
        await sharp(originalPath)
          .webp({ quality: 50 })
          .toFile(newPath);

        fs.unlinkSync(originalPath); // remove original

        convertedFiles[field].push({
          ...file,
          filename: newFilename,
          path: newPath,
        });
      } catch (err) {
        console.error(`Error converting ${file.originalname}:`, err);
      }
    }
  }

  return convertedFiles;
};
