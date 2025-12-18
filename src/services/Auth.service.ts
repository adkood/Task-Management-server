import { AppDataSource } from "../data-source";
import { LoginDto } from "../dtos/Login.dto";
import { SignupDto } from "../dtos/Signup.dto";
import { User } from "../entities/User";
import { HttpError } from "../utils/HttpError";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/Jwt";

export const registerUser = async (data: SignupDto) => {
    try {

        const { name, username, password } = data;
        
        console.log(name, username, password);
        
        if(name == null || username == null || password == null) {
            throw new HttpError(400, "name, username or password is missing");
        }
        
        const userRepo = AppDataSource.getRepository(User);

        const userExist = await userRepo.findOne({ where: { username } });

        if(userExist != null) {
            throw new HttpError(400, "User with this username already exists");
        } 

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = userRepo.create({
            name,
            username,
            password: hashedPassword,
        });

        await userRepo.save(newUser);

        return {
            status: "success",
            message: "User registered",
            data: {
                user: newUser
            }
        }

    } catch (error) {

        if(error instanceof HttpError) {
            throw error;
        }

        throw new HttpError(500, "Something went wrong");
    }
}

const JWT_SECRET = process.env.JWT_SECRET;

// const generateToken = (id: string) => {
//     if(JWT_SECRET == null) {
//         throw new HttpError(400, "JWT SECRET is missing");
//     }
//     return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1d" });
// }

export const loginUser = async (data: LoginDto) => {
    try {

        const { username, password } = data;

        if(username == null || password == null) {
            throw new HttpError(400, "name, username or password is missing");
        }

        const userRepo = AppDataSource.getRepository(User);

        const user = await userRepo.findOne({ where: { username } });
        
        if(!user) {
            throw new HttpError(400, "User does not exist with this username");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);        

        if(!passwordMatch) {
            throw new HttpError(400, "Invalid username or password");
        }

        const token = generateAccessToken({id: user.id, username: user.username});

        return {
            status: "success", 
            message: "User logged in",
            data: {
                user
            }
        }
    } catch(error) {

        if(error instanceof HttpError) {
            throw error;
        }

        throw new HttpError(500, "something went wrong");
    }
}