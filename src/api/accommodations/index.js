import express from "express";
import createHttpError from "http-errors";
import AccommodationsModel from "./model.js";
import { hostOnlyMiddleware } from "../../lib/auth/hostOnly.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";

const accommodationsRouter = express.Router();

//----**** ACCESS granted to: Guests and Hosts ****----\\

//get all accommodations
accommodationsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const accommodations = await AccommodationsModel.find().populate({
      path: "host",
      select: ["name", "email"],
    });
    res.status(200).send(accommodations);
  } catch (error) {
    next(error);
  }
});
//get single accomodation
accommodationsRouter.get(
  "/:accomodationId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const accommodation = await AccommodationsModel.findById(
        req.params.accomodationId
      ).populate({ path: "host", select: ["name", "email"] });

      if (accommodation) {
        res.status(200).send(accommodation);
      } else {
        next(
          createHttpError(
            404,
            `No accommodation with id ${req.params.id} was found.`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

//----**** ACCESS granted to : Hosts ****----\\

//post new accomodation
accommodationsRouter.post(
  "/",
  JWTAuthMiddleware,
  hostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const newAccommodation = new AccommodationsModel(req.body);
      const { _id } = await newAccommodation.save();

      res.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

export default accommodationsRouter;
