import express from 'express';
import auth from './auth'
const Router = express.Router();
Router.get("/", (_req,res) => {
    res.json({message: "welcome to v1 of the letureDeck api!"})
});
Router.use('/auth', auth)
export default Router;