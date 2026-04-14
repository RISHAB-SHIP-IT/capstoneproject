const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const folderPath = "data/raw";
const outputFile = "data/all_villages.json";

let allData = [];

const files = fs.readdirSync(folderPath);

files.forEach((file) => {
  if (!file.endsWith(".xls") && !file.endsWith(".xlsx") && !file.endsWith(".ods")) return;

  console.log("Processing:", file);

  const workbook = XLSX.readFile(path.join(folderPath, file));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(sheet);

  jsonData.forEach((row) => {
    try {
      const cleaned = {
        stateCode: Number(row["MDDS STC"]),
        stateName: row["STATE NAME"]?.toString().trim(),
        districtCode: Number(row["MDDS DTC"]),
        districtName: row["DISTRICT NAME"]?.toString().trim(),
        subDistrict: row["SUB-DISTRICT NAME"]?.toString().trim(),
        villageCode: Number(row["MDDS PLCN"]),
        villageName: row["Area Name"]?.toString().trim(),
      };

      // remove invalid rows
      if (!cleaned.villageName || !cleaned.villageCode) return;

      allData.push(cleaned);
    } catch (err) {
      console.log("Skipping row");
    }
  });
});

console.log("Total rows:", allData.length);

// remove duplicates
const unique = Array.from(
  new Map(allData.map((v) => [v.villageCode, v])).values()
);

console.log("After removing duplicates:", unique.length);

// save JSON
fs.writeFileSync(outputFile, JSON.stringify(unique, null, 2));

console.log("✅ JSON CREATED SUCCESSFULLY");