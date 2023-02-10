import express from "express";
import createHttpError from "http-errors";
import { hostOnlyMiddleware } from "../../lib/auth/hostOnly.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import { createAccessToken } from "../../lib/auth/tools.js";
import UsersModel from "./model.js";
import AccommodationsModel from "../accommodations/model.js";

const usersRouter = express.Router();

//----**** ACCESS granted for: Guest and Hosts ****----

//register users
usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const { _id } = await newUser.save();
    if ({ _id }) {
      const payload = { _id: user._id, role: user.role };

      const accessToken = await createAccessToken(payload);
      res.send({ accessToken });
    }
  } catch (error) {
    next(error);
  }
});

//user login
usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.checkCredentials(email, password);

    if (user) {
      const payload = { _id: user._id, role: user.role };

      const accessToken = await createAccessToken(payload);
      res.send({ accessToken });
    } else {
      next(createHttpError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

//get your own user info without password
usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

//----**** ACCESS granted for: HOSTS ****----

//get list of my accomodations
usersRouter.get(
  "/me/accommodations",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const accommodations = await AccommodationsModel.find({
        host: req.user._id,
      }).populate({ path: "host", select: "email" });

      if (accommodations) {
        res.send(accommodations);
      } else {
        next(
          createHttpError(
            404,
            `No accommodations hosted by user ${req.user._id} were found.`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;
