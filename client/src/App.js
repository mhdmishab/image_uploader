import React, { useState, useRef } from 'react';
import axios from 'axios';
import Compressor from 'compressorjs';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

function App() {
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [showImage, setShowImage] = useState(null);
  const [file, setFile] = useState(null);
  const cropperRef = useRef(null);

  const handleImageChange = (e) => {
    const newFile = e.target.files[0];
    setFile(newFile);
    if (newFile) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(newFile);
    }
  };

  const cropImage = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      const croppedDataURL = cropper.getCroppedCanvas().toDataURL();
      compressImage(croppedDataURL);
    }
  };

  const compressImage = (dataURL) => {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    new Compressor(new Blob([ab], { type: mimeString }), {
      quality: 0.6,
      maxWidth: 800,
      maxHeight: 600,
      success: (compressedBlob) => {
        const reader = new FileReader();
        reader.onloadend = () => setCroppedImage(reader.result);
        reader.readAsDataURL(compressedBlob);
      },
      error: (err) => console.error('Compression error:', err),
    });
  };

  const handleUpload = async () => {
    if (!croppedImage || !file) return;

    try {
      const imag = {
        base64: croppedImage,
        type: file.type,
        size: file.size
      };

      const response = await axios.post('http://localhost:5000/upload', { imag });
      setShowImage(response.data.image);
      alert('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {image && (
        <div>
          <Cropper
            src={image}
            style={{ height: 400, width: '40%' }}
            initialAspectRatio={1}
            aspectRatio={1}
            guides={false}
            ref={cropperRef}
          />
          <button onClick={cropImage}>Crop and Compress Image</button>
        </div>
      )}
      {croppedImage && (
        <div>
          <img src={croppedImage} alt="Cropped" style={{ width: '200px', height: 'auto' }} />
          <button onClick={handleUpload}>Upload Image</button>
        </div>
      )}
      {showImage && (
        <div>
          <p>Uploaded image:</p>
          <img
            src={showImage}
            alt="Uploaded"
            style={{ width: '300px', height: '200px', objectFit: 'contain' }} // Adjust width and height as needed
          />
        </div>
      )}
    </div>
  );
}

export default App;
