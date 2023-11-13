import express from 'express';
import cors from 'cors';
import ApiRouter from './v1/routes';
const app = express();

const Whitelist = ["http://localhost:5173/"];
app.use(express.json());
app.use(cors({origin:Whitelist, exposedHeaders:"X-Auth-Token"}));

app.use('/api/v1', ApiRouter);

// catch all route
app.use((_req,res) => {
    res.status(404).json({message: 'invalid route'});
})
export default app;
