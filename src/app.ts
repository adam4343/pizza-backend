import { orderRouter } from './routes/order.routes';
import { cartRouter } from './routes/cart.routes';
import { pizzaRouter } from './routes/pizza.routes';
import { authRouter } from './routes/auth.routes';
import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();

app.use(express.json());
app.use(cookieParser(process.env.SECRET_KEY));
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use('/auth', authRouter);
app.use('/pizza', pizzaRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);

const port = 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });