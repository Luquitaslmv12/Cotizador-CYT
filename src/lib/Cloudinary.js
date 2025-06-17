import axios from "axios";

export const uploadFile = async (file, type = "image") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "Cotizador-escher");

  // Cambiar URL según el tipo, para Cloudinary se usa "image/upload" o "video/upload" (audio entra como video)
  let url = "https://api.cloudinary.com/v1_1/dysffcbvv/image/upload";
  if (type === "audio") {
    // En Cloudinary, audio se suele subir a "video/upload"
    url = "https://api.cloudinary.com/v1_1/dysffcbvv/video/upload";
  }

  const res = await axios.post(url, formData);

  return res.data.secure_url;
};