const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());
const morgan = require("morgan");

const dotenv = require("dotenv");
const handleError = require("./Middlewares/handleError");
const connectMongose = require("./ConnectDatabase/ConnectDatabase");
const nodemailerTransport = require("./NodemailerConfig/nodemailer");
const userRouter = require("./Router/userRouter");
const adminRouter = require("./Router/adminRouter");
// require("nodemailer");
// require("./NodemailerConfig/nodemailer")
dotenv.config();   

const port = process.env.PORT   
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));       
      
app.listen(port, () => {
  console.log(`Port Running at ${port}`);
});    
connectMongose();   

app.get("/", (req, res) => {
  res.send("Heloooo Emmanuel");   
});

app.use("/user", userRouter);
app.use("/admin", adminRouter);

app.use("/{*any}", handleError);

app.all("/{*any}", (req, res) => {
  res.status(500).json({
    Message: `${req.method} ${req.originalUrl} is not a vaild endpoint on this server`,
  });
});
