const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, "../data/all_villages.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  console.log("Total records:", data.length);

  const batchSize = 5000;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    await prisma.village.createMany({
  data: batch.map(item => ({
    stateCode: item.stateCode,
    stateName: item.stateName,
    districtCode: item.districtCode,
    districtName: item.districtName,
    subDistrict: item.subDistrict || "UNKNOWN",
    villageCode: item.villageCode,
    villageName: item.villageName,
  })),
  skipDuplicates: true,
});

    console.log(`Inserted ${i + batch.length} records`);
  }

  console.log("✅ All data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });