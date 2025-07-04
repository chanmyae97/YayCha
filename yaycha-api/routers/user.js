const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { auth } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const fs = require('fs').promises;

// Helper function to check if URL is external
const isExternalUrl = (url) => {
  try {
    return new URL(url).protocol.startsWith('http');
  } catch {
    return false;
  }
};

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Helper function to delete old file
const deleteOldFile = async (filename) => {
  if (!filename || isExternalUrl(filename)) return;
  
  try {
    const filePath = path.join('uploads', filename);
    await fs.unlink(filePath);
    console.log(`Successfully deleted old file: ${filename}`);
  } catch (error) {
    // If file doesn't exist or other error, just log it
    console.error(`Error deleting file ${filename}:`, error.message);
  }
};

// Authentication middleware
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ msg: "Authentication required" });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ msg: "Invalid or expired token" });
//     }
//     req.user = user;
//     next();
//   });
// };

router.post("/users/:id/upload", auth, upload.single("file"), async (req,res) =>{
  const {id} = req.params;
  const user = res.locals.user;
  if(user.id !== Number(id)){
    return res.status(403).json({msg: "Unauthorized"});
  }

  const file = req.file;
  if(!file){
    return res.status(400).json({msg: "No file uploaded"});
  }

  try {
    // Get the current user data to find the old profile picture
    const currentUser = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { profilePicture: true }
    });

    // Only delete if it's a local file
    if (currentUser?.profilePicture && !isExternalUrl(currentUser.profilePicture)) {
      await deleteOldFile(currentUser.profilePicture);
    }

    const data = await prisma.user.update({
      where: {id: Number(id)},
      data: {
        profilePicture: file.filename,
      },
    });
    res.json(data);
  } catch (error) {
    await deleteOldFile(file.filename);
    console.error("Error uploading file:", error);
    res.status(500).json({ msg: "Error uploading file" });
  }
});

router.post("/users/:id/upload-cover", auth, upload.single("file"), async (req,res) =>{
  const {id} = req.params;
  const user = res.locals.user;
  if(user.id !== Number(id)){
    return res.status(403).json({msg: "Unauthorized"});
  }
  const file = req.file;
  if(!file){
    return res.status(400).json({msg: "No file uploaded"});
  }

  try {
    // Get the current user data to find the old cover photo
    const currentUser = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { coverPhoto: true }
    });

    // Only delete if it's a local file
    if (currentUser?.coverPhoto && !isExternalUrl(currentUser.coverPhoto)) {
      await deleteOldFile(currentUser.coverPhoto);
    }

    const data = await prisma.user.update({
      where: {id: Number(id)},
      data: {
        coverPhoto: file.filename,
      },
    });
    res.json(data); 
  } catch (error) {
    await deleteOldFile(file.filename);
    console.error("Error uploading file:", error);
    res.status(500).json({ msg: "Error uploading file" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "username and password required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ msg: "incorrect username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ msg: "incorrect username or password" });
    }

    const token = jwt.sign(user, process.env.JWT_SECRET);
    return res.json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Error during login" });
  }
});

router.get("/users", async (req, res) => {
  const data = await prisma.user.findMany({
    include: { posts: true, comments: true, followers: true, following: true },
    orderBy: { id: "desc" },
    take: 20,
  });

  res.json(data);
});

router.get("/users/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.user.findFirst({
      where: { id: Number(id) },
      include: {
        posts: {
          include: {
            likes: true,
            comments: {
              include: {
                likes: true,
              },
            },
          },
        },
        comments: true,
        followers: true,
        following: true,
      },
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

router.get("/search", async (req, res) => {
  const { q } = req.query;

  const data = await prisma.user.findMany({
    where: {
      name: {
        contains: q,
      },
    },
    include: {
      followers: true,
      following: true,
    },
    take: 20,
  });

  res.json(data);
});

router.post("/users", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    if (!req.body) {
      return res.status(400).json({ error: "Request body is empty" });
    }

    const { name, username, bio, password } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["name", "username", "password"],
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, username, password: hash, bio },
    });

    res.json(user);
  } catch (error) {
    console.error("Error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Username already exists",
        field: "username",
      });
    }
    res.status(500).json({ error: error.message });
  }
});

router.post("/follow/:id", auth, async (req, res) => {
  const user = res.locals.user;
  const { id } = req.params;

  const data = await prisma.follow.create({
    data: {
      followerId: Number(user.id),
      followingId: Number(id),
    },
  });
  res.json(data);
});

router.get("/verify", auth, async (req, res) => {
  const user = res.locals.user;
  res.json(user);
});

router.delete("/unfollow/:id", auth, async (req, res) => {
  const user = res.locals.user;
  const { id } = req.params;

  await prisma.follow.deleteMany({
    where: {
      followerId: Number(user.id),
      followingId: Number(id),
    },
  });

  res.json({ msg: `Unfollow user ${id}` });
});

module.exports = { userRouter: router };
