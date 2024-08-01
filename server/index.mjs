import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import atob from 'atob'
import { body, validationResult } from 'express-validator';
const imageType = (await import('image-type')).default;

const app = express();

const isBase64 = (text) => {
  let utf8 = Buffer.from(text, 'base64').toString('utf8');
  return !(/[^\x00-\x7f]/.test(utf8));
};

const validator = () => {
  return body('image').custom((value) => {
    console.log(value);
    try {
      // Validate base64 format
      if (!isBase64(value)) {
        console.log("this error invalid base64")
        throw new Error('Invalid image format. Image data is not valid base64.');
      }

      // Extract base64 data
      const base64Data = value.replace(/^data:image\/[a-z]+;base64,/, '');
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const buffer = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        buffer[i] = binaryString.charCodeAt(i);
      }

      // Validate image type
      const type = imageType(buffer);
      if (!type || !['jpeg', 'png', 'gif'].includes(type.ext)) {
        console.log("invalid image type.Only JPEG, PNG, and GIF are allowed.")
        throw new Error('Invalid image type. Only JPEG, PNG, and GIF are allowed.');
      }

      // Validate image size (e.g., max 500KB)
      const sizeInKB = buffer.length / 1024;
      if (sizeInKB > 500) {
        throw new Error('Image size exceeds 500KB.');
      }

      return true;
    } catch (err) {
      console.error(err);
      throw new Error('Invalid image format.');
    }
  });
}

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit if needed

app.post('/upload',(req, res) => {
  console.log("here");
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   console.log("validation error",errors.array() )
  //   return res.status(400).json({ errors: errors.array() });
  // }
  console.log(req.body)
  const {imag} = req.body;
  console.log(imag)
  if (!imag) {
    console.log("no image error")
    return res.status(400).json({ message: 'No image data received' });
  }
  let image= imag.base64

  // Process the image here (e.g., save to database, etc.)
  // For demonstration, just echo the image back
  res.json({image});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
