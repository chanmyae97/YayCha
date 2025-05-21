const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {auth} = require("../middlewares/auth");

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: "Authentication required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ msg: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

router.post("/login", async (req, res) =>{
    const {username, password} = req.body;

    if(!username || !password) {
        return res.status(400).json({ msg: "username and password required"});
    }
    
    try {
        const user = await prisma.user.findUnique({
            where: {username},
        });

        if(!user) {
            return res.status(401).json({ msg: "incorrect username or password"});
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch) {
            return res.status(401).json({ msg: "incorrect username or password"});
        }

        const token = jwt.sign(user, process.env.JWT_SECRET);
        return res.json({ token, user});
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ msg: "Error during login" });
    }
});

router.get("/users", async (req, res) => {
    const data = await prisma.user.findMany({
        include: {posts: true, comments: true},
        orderBy: { id: "desc"},
        take: 20,
    });

    res.json(data);
});

router.get("/users/:id", authenticateToken, async (req, res) => {
    try {
        const {id} = req.params;
        const data = await prisma.user.findFirst({
            where: {id : Number(id)},
            include: { posts : true, comments: true},
        });

        if (!data) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json(data);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ msg: "Error fetching user data" });
    }
});

router.post("/users", async (req, res) => {
    try {
        console.log('Request body:', req.body);
        
        if (!req.body) {
            return res.status(400).json({ error: "Request body is empty" });
        }

        const { name, username, bio, password } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({
                error: "Missing required fields",
                required: ["name", "username", "password"]
            });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, username, password: hash, bio }
        });

        res.json(user);
    } catch (error) {
        console.error("Error:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ 
                error: "Username already exists",
                field: "username"
            });
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = { userRouter: router };