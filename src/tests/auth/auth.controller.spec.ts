import { signup, login } from "../../controllers/Auth.controller";
import { registerUser, loginUser } from "../../services/Auth.service";
import { HttpError } from "../../utils/HttpError";

jest.mock("../../services/Auth.service");

describe("Auth Controller", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ---------------------------
  // Signup tests
  // ---------------------------
  describe("signup", () => {
    it("should register a user successfully", async () => {
      const mockData = { id: "123", name: "Test User" };
      (registerUser as jest.Mock).mockResolvedValue(mockData);

      req.body = { name: "Test User", email: "test@test.com", password: "pass123" };

      await signup(req, res, next);

      expect(registerUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "User registered successfully",
        data: mockData
      });
    });

    it("should return HttpError if registration fails", async () => {
      const error = new HttpError(400, "User already exists");
      (registerUser as jest.Mock).mockRejectedValue(error);

      req.body = { name: "Test User", email: "test@test.com", password: "pass123" };

      await signup(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "User already exists",
        data: null
      });
    });

    it("should return 500 if unknown error occurs", async () => {
      (registerUser as jest.Mock).mockRejectedValue(new Error("DB error"));

      req.body = { name: "Test User", email: "test@test.com", password: "pass123" };

      await signup(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Internal server error",
        data: null
      });
    });
  });

  // ---------------------------
  // Login tests
  // ---------------------------
  describe("login", () => {
    it("should login a user and set cookie", async () => {
      const mockData = { token: "abc123", id: "123", name: "Test User" };
      (loginUser as jest.Mock).mockResolvedValue(mockData);

      req.body = { email: "test@test.com", password: "pass123" };

      await login(req, res, next);

      expect(loginUser).toHaveBeenCalledWith(req.body);
      expect(res.cookie).toHaveBeenCalledWith("token", "abc123", expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "User logged in successfully",
        data: { id: "123", name: "Test User" }
      });
    });

    it("should return HttpError if login fails", async () => {
      const error = new HttpError(401, "Invalid credentials");
      (loginUser as jest.Mock).mockRejectedValue(error);

      req.body = { email: "test@test.com", password: "wrongpass" };

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid credentials",
        data: null
      });
    });

    it("should return 500 if unknown error occurs", async () => {
      (loginUser as jest.Mock).mockRejectedValue(new Error("DB error"));

      req.body = { email: "test@test.com", password: "pass123" };

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Internal server error",
        data: null
      });
    });
  });
});
