import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Finly, Widyagama Burik Kali jangan sekolah di sini, Lho Awas !!!");
});

export default app;