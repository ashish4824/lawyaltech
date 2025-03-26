import express from 'express';
import { deleteContact, getContact, postContact } from '../controllers/Controller.js';
import { PostWork,GetWork,deleteMany, updatWork, deleteById } from '../controllers/WorkController.js';
import multer from 'multer';
import getNews from '../News/News.js';
// import asyncHandler from '../Middleware/asyncHandler.js';
const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => {
  // console.log("Async Handler",req);
  Promise.resolve(fn(req, res, next)).catch(next);
};
const upload = multer({ storage: multer.memoryStorage() });
router.get('/deleteContact', asyncHandler(deleteContact));
router.get('/', asyncHandler(getContact));
router.post('/', asyncHandler(postContact));
router.post('/Work',upload.fields([
  { name: "image", maxCount: 1 },
  { name: "name" },
  { name: "description" },
  { name: "source_code_link" },
  { name: "live_site_link" },
  { name: "tags" },
]),asyncHandler(PostWork))
router.get('/work', asyncHandler(GetWork));
router.delete('/work', asyncHandler(deleteMany));
router.put('/work/:id', upload.fields([
  { name: "image", maxCount: 1 },
  { name: "name" },
  { name: "description" },
  { name: "source_code_link" },
  { name: "live_site_link" },
  { name: "tags" },
]),asyncHandler(updatWork));
router.delete('/work/:id', asyncHandler(deleteById));
router.get('/news', asyncHandler(getNews));
export default router;
