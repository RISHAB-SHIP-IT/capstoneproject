const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const auth = require("./middleware/auth");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

/**
 * HEALTH CHECK
 */
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

/**
 * 1. GET ALL STATES
 */
app.get("/states", auth, async (req, res) => {
  try {
    const states = await prisma.village.findMany({
      distinct: ["stateName"],
      select: { stateName: true }
    });

    res.json(states);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching states" });
  }
});

/**
 * 2. GET DISTRICTS BY STATE
 */
app.get("/districts/:stateName", auth, async (req, res) => {
  try {
    const { stateName } = req.params;

    const districts = await prisma.village.findMany({
      where: { stateName },
      distinct: ["districtName"],
      select: { districtName: true }
    });

    res.json(districts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching districts" });
  }
});

/**
 * 3. GET SUB-DISTRICTS BY DISTRICT (BONUS 🔥)
 */
app.get("/subdistricts/:district", auth, async (req, res) => {
  try {
    const { district } = req.params;

    const subDistricts = await prisma.village.findMany({
      where: {
        districtName: {
          equals: district,
          mode: "insensitive",
        },
      },
      distinct: ["subDistrict"],
      select: { subDistrict: true },
      orderBy: { subDistrict: "asc" },
    });

    res.json(subDistricts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch sub-districts" });
  }
});

/**
 * 4. GET VILLAGES BY DISTRICT
 */
app.get("/villages/:districtName", auth, async (req, res) => {
  try {
    const { districtName } = req.params;

    const villages = await prisma.village.findMany({
      where: { districtName },
      select: { villageName: true }
    });

    res.json(villages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching villages" });
  }
});
app.get("/search", auth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const results = await prisma.village.findMany({
      where: {
        villageName: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 20,
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});
app.get("/dashboard", async (req, res) => {
  try {
    const totalStates = await prisma.village.findMany({
      distinct: ["stateName"],
      select: { stateName: true },
    });

    const totalDistricts = await prisma.village.findMany({
      distinct: ["districtName"],
      select: { districtName: true },
    });

    const totalVillages = await prisma.village.count();

    res.json({
      states: totalStates.length,
      districts: totalDistricts.length,
      villages: totalVillages,
    });
  } catch (error) {
    res.status(500).json({ error: "Dashboard error" });
  }
});


/**
 * SERVER START
 */
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
