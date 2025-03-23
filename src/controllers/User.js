import generateToken from "../../jwtToken.js";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";

const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await
        User.findOne({ email });    
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
         await newUser.save();
        res.status(201).json({ 
            message: "User created successfully",
            user: newUser

         });

    }
    catch (error) {
        console.log(error);
    }
    };
    async function GetAllUser(req, res, next) {
        const project = await User.find({})
        res.status(200).json({ 
            message: 'Project fetched successfully',
            project: project 
        });
    }
    async function DeleteAllUser(req, res, next) {
        const project = await User.deleteMany({})
        res.status(200).json({ 
            message: 'Project deleted successfully',
            project: project})    
    }

    async function Login(req, res, next) {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }   
        const token = generateToken({ id: user.email, email: user.email });
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        user.token = token;
       const response= await user.save();
        res.status(200).json({ message: "Login successful",
            token: token,
            user: response
         });
    }
    export { register, GetAllUser, DeleteAllUser, Login };