"use client";
import { useRef } from "react";
import Image from "next/image";
const ImageUpload = ({ player, index, onImageChange }) => {
  const fileInputRef = useRef();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    onImageChange(index, imageUrl);
  };
  return (
    <div
      className="cursor-pointer"
      onClick={() => fileInputRef.current.click()}
    >
      <Image
        src={player.image}
        alt={player.name}
        width={32}
        height={32}
        className="rounded-full border"
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
    </div>
  );
}
 

export default ImageUpload