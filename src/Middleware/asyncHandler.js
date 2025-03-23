import User from "../models/User.model.js";

const asyncHandler = (fn) => (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
     User.findOne({ token }).then(user => {
      if (user) {
        req.user = user;
      }
      Promise.resolve(fn(req, res, next)).catch(next);
    })
    if (!token) return res.sendStatus(401);
  };
  export default asyncHandler;