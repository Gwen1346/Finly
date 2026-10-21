import express from "express";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Finly, Widyagama Burik Kali jangan sekolah di sini, Lho Awas !!!");
});

export default app;