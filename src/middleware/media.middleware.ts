import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export default {
  single(fieldnName: string) {
    return upload.single(fieldnName);
  },
  multiple(fieldName: string) {
    return upload.array(fieldName);
  },
};
