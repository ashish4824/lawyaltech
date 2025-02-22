import express from 'express';
import { deleteContact, getContact, postContact } from '../controllers/Controller.js';

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
router.get('/deleteContact', asyncHandler(deleteContact));
router.get('/', asyncHandler(getContact));
router.post('/', asyncHandler(postContact));
export default router;
