import express from 'express';
const Router = express.Router();
Router.get("/", (_req,res) => {
    res.json({message: "welcome to v1 of the letureDeck api!"})
});

export default Router;