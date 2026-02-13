import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { referenceRanges, medicalGlossary } from "../drizzle/schema.ts";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const pool = mysql.createPool(DATABASE_URL);
const db = drizzle(pool);

// Comprehensive medical reference data
const medicalReferenceData = [
  {
    testName: "Hemoglobin",
    testAbbreviation: "HGB",
    category: "Hematology",
    unit: "g/dL",
    rangeLowMale: 13.5,
    rangeHighMale: 17.5,
    rangeLowFemale: 12.0,
    rangeHighFemale: 15.5,
    rangeLowChild: 11.0,
    rangeHighChild: 14.0,
    description:
      "Protein in red blood cells that carries oxygen. Low levels may indicate anemia.",
  },
  {
    testName: "Hematocrit",
    testAbbreviation: "HCT",
    category: "Hematology",
    unit: "%",
    rangeLowMale: 41.0,
    rangeHighMale: 53.0,
    rangeLowFemale: 36.0,
    rangeHighFemale: 46.0,
    rangeLowChild: 33.0,
    rangeHighChild: 39.0,
    description: "Percentage of blood volume made up of red blood cells.",
  },
  {
    testName: "White Blood Cell Count",
    testAbbreviation: "WBC",
    category: "Hematology",
    unit: "K/uL",
    rangeLowMale: 4.5,
    rangeHighMale: 11.0,
    rangeLowFemale: 4.5,
    rangeHighFemale: 11.0,
    rangeLowChild: 5.0,
    rangeHighChild: 15.0,
    description:
      "Cells that fight infection. Abnormal levels may indicate infection or immune disorders.",
  },
  {
    testName: "Platelet Count",
    testAbbreviation: "PLT",
    category: "Hematology",
    unit: "K/uL",
    rangeLowMale: 150.0,
    rangeHighMale: 400.0,
    rangeLowFemale: 150.0,
    rangeHighFemale: 400.0,
    rangeLowChild: 150.0,
    rangeHighChild: 400.0,
    description:
      "Cells that help with blood clotting. Low levels may increase bleeding risk.",
  },
  {
    testName: "Glucose",
    testAbbreviation: "GLU",
    category: "Chemistry",
    unit: "mg/dL",
    rangeLowMale: 70.0,
    rangeHighMale: 100.0,
    rangeLowFemale: 70.0,
    rangeHighFemale: 100.0,
    rangeLowChild: 70.0,
    rangeHighChild: 100.0,
    description:
      "Blood sugar level. Abnormal levels may indicate diabetes or metabolic disorders.",
  },
  {
    testName: "Blood Urea Nitrogen",
    testAbbreviation: "BUN",
    category: "Chemistry",
    unit: "mg/dL",
    rangeLowMale: 7.0,
    rangeHighMale: 20.0,
    rangeLowFemale: 7.0,
    rangeHighFemale: 20.0,
    rangeLowChild: 5.0,
    rangeHighChild: 18.0,
    description: "Waste product from protein metabolism. Elevated levels may indicate kidney problems.",
  },
  {
    testName: "Creatinine",
    testAbbreviation: "CRE",
    category: "Chemistry",
    unit: "mg/dL",
    rangeLowMale: 0.7,
    rangeHighMale: 1.3,
    rangeLowFemale: 0.6,
    rangeHighFemale: 1.1,
    rangeLowChild: 0.3,
    rangeHighChild: 0.7,
    description: "Waste product from muscle metabolism. Elevated levels may indicate kidney disease.",
  },
  {
    testName: "Sodium",
    testAbbreviation: "NA",
    category: "Chemistry",
    unit: "mEq/L",
    rangeLowMale: 136.0,
    rangeHighMale: 145.0,
    rangeLowFemale: 136.0,
    rangeHighFemale: 145.0,
    rangeLowChild: 136.0,
    rangeHighChild: 145.0,
    description: "Electrolyte essential for nerve and muscle function.",
  },
  {
    testName: "Potassium",
    testAbbreviation: "K",
    category: "Chemistry",
    unit: "mEq/L",
    rangeLowMale: 3.5,
    rangeHighMale: 5.0,
    rangeLowFemale: 3.5,
    rangeHighFemale: 5.0,
    rangeLowChild: 3.5,
    rangeHighChild: 5.0,
    description: "Electrolyte essential for heart rhythm and muscle function.",
  },
  {
    testName: "Chloride",
    testAbbreviation: "CL",
    category: "Chemistry",
    unit: "mEq/L",
    rangeLowMale: 98.0,
    rangeHighMale: 107.0,
    rangeLowFemale: 98.0,
    rangeHighFemale: 107.0,
    rangeLowChild: 98.0,
    rangeHighChild: 107.0,
    description: "Electrolyte that helps maintain fluid balance.",
  },
  {
    testName: "Total Cholesterol",
    testAbbreviation: "CHOL",
    category: "Lipids",
    unit: "mg/dL",
    rangeLowMale: 0.0,
    rangeHighMale: 200.0,
    rangeLowFemale: 0.0,
    rangeHighFemale: 200.0,
    rangeLowChild: 0.0,
    rangeHighChild: 170.0,
    description: "Total cholesterol level. High levels increase heart disease risk.",
  },
  {
    testName: "HDL Cholesterol",
    testAbbreviation: "HDL",
    category: "Lipids",
    unit: "mg/dL",
    rangeLowMale: 40.0,
    rangeHighMale: 999.0,
    rangeLowFemale: 50.0,
    rangeHighFemale: 999.0,
    rangeLowChild: 35.0,
    rangeHighChild: 999.0,
    description: "Good cholesterol. Higher levels are protective against heart disease.",
  },
  {
    testName: "LDL Cholesterol",
    testAbbreviation: "LDL",
    category: "Lipids",
    unit: "mg/dL",
    rangeLowMale: 0.0,
    rangeHighMale: 100.0,
    rangeLowFemale: 0.0,
    rangeHighFemale: 100.0,
    rangeLowChild: 0.0,
    rangeHighChild: 110.0,
    description: "Bad cholesterol. High levels increase heart disease risk.",
  },
  {
    testName: "Triglycerides",
    testAbbreviation: "TRIG",
    category: "Lipids",
    unit: "mg/dL",
    rangeLowMale: 0.0,
    rangeHighMale: 150.0,
    rangeLowFemale: 0.0,
    rangeHighFemale: 150.0,
    rangeLowChild: 0.0,
    rangeHighChild: 100.0,
    description: "Type of fat in blood. Elevated levels increase heart disease risk.",
  },
  {
    testName: "Aspartate Aminotransferase",
    testAbbreviation: "AST",
    category: "Liver Function",
    unit: "U/L",
    rangeLowMale: 10.0,
    rangeHighMale: 40.0,
    rangeLowFemale: 10.0,
    rangeHighFemale: 32.0,
    rangeLowChild: 15.0,
    rangeHighChild: 40.0,
    description: "Liver enzyme. Elevated levels may indicate liver damage.",
  },
  {
    testName: "Alanine Aminotransferase",
    testAbbreviation: "ALT",
    category: "Liver Function",
    unit: "U/L",
    rangeLowMale: 7.0,
    rangeHighMale: 56.0,
    rangeLowFemale: 7.0,
    rangeHighFemale: 45.0,
    rangeLowChild: 7.0,
    rangeHighChild: 40.0,
    description: "Liver enzyme. Elevated levels may indicate liver disease.",
  },
  {
    testName: "Alkaline Phosphatase",
    testAbbreviation: "ALP",
    category: "Liver Function",
    unit: "U/L",
    rangeLowMale: 30.0,
    rangeHighMale: 120.0,
    rangeLowFemale: 30.0,
    rangeHighFemale: 120.0,
    rangeLowChild: 40.0,
    rangeHighChild: 150.0,
    description: "Enzyme found in liver and bones. Elevated levels may indicate bone or liver disease.",
  },
  {
    testName: "Bilirubin, Total",
    testAbbreviation: "TBIL",
    category: "Liver Function",
    unit: "mg/dL",
    rangeLowMale: 0.1,
    rangeHighMale: 1.2,
    rangeLowFemale: 0.1,
    rangeHighFemale: 1.2,
    rangeLowChild: 0.1,
    rangeHighChild: 1.2,
    description: "Bile pigment. Elevated levels may indicate liver disease or hemolysis.",
  },
  {
    testName: "Albumin",
    testAbbreviation: "ALB",
    category: "Protein",
    unit: "g/dL",
    rangeLowMale: 3.5,
    rangeHighMale: 5.0,
    rangeLowFemale: 3.5,
    rangeHighFemale: 5.0,
    rangeLowChild: 3.5,
    rangeHighChild: 5.0,
    description: "Protein made by the liver. Low levels may indicate liver or kidney disease.",
  },
  {
    testName: "Total Protein",
    testAbbreviation: "TP",
    category: "Protein",
    unit: "g/dL",
    rangeLowMale: 6.0,
    rangeHighMale: 8.3,
    rangeLowFemale: 6.0,
    rangeHighFemale: 8.3,
    rangeLowChild: 6.0,
    rangeHighChild: 8.3,
    description: "Total protein in blood. Abnormal levels may indicate various diseases.",
  },
];

const glossaryData = [
  {
    term: "Hemoglobin",
    abbreviation: "HGB",
    definition:
      "A protein in red blood cells that carries oxygen from the lungs to the rest of the body.",
    plainEnglish:
      "The protein in your red blood cells that carries oxygen. If it's low, you might feel tired.",
    category: "Blood Test",
  },
  {
    term: "Hematocrit",
    abbreviation: "HCT",
    definition:
      "The percentage of blood volume that is made up of red blood cells.",
    plainEnglish:
      "The percentage of your blood that is made up of red blood cells. It helps doctors see if you have anemia.",
    category: "Blood Test",
  },
  {
    term: "White Blood Cell",
    abbreviation: "WBC",
    definition:
      "Cells that fight infection and are part of the immune system.",
    plainEnglish:
      "Cells that protect your body from infections. Too many or too few can indicate a problem.",
    category: "Blood Test",
  },
  {
    term: "Platelet",
    abbreviation: "PLT",
    definition:
      "Small cell fragments that help blood clot and stop bleeding.",
    plainEnglish:
      "Tiny cells that help your blood clot. If you have too few, you might bleed more easily.",
    category: "Blood Test",
  },
  {
    term: "Glucose",
    abbreviation: "GLU",
    definition: "A simple sugar that is the main source of energy for cells.",
    plainEnglish:
      "Blood sugar. High levels might mean you have diabetes or need to watch your diet.",
    category: "Blood Chemistry",
  },
  {
    term: "Creatinine",
    abbreviation: "CRE",
    definition:
      "A waste product produced by muscles that is filtered by the kidneys.",
    plainEnglish:
      "A waste product from your muscles. High levels might mean your kidneys aren't working well.",
    category: "Kidney Function",
  },
  {
    term: "Blood Urea Nitrogen",
    abbreviation: "BUN",
    definition:
      "A waste product from protein breakdown that is filtered by the kidneys.",
    plainEnglish:
      "A waste product from your body. High levels might indicate kidney problems.",
    category: "Kidney Function",
  },
  {
    term: "Cholesterol",
    abbreviation: "CHOL",
    definition:
      "A waxy substance found in all cells that is needed to make hormones and vitamin D.",
    plainEnglish:
      "A fat-like substance in your blood. High levels increase your risk of heart disease.",
    category: "Lipid Panel",
  },
  {
    term: "HDL Cholesterol",
    abbreviation: "HDL",
    definition:
      "Good cholesterol that helps remove other forms of cholesterol from the bloodstream.",
    plainEnglish:
      "The good cholesterol. Higher levels protect your heart. You want this to be high.",
    category: "Lipid Panel",
  },
  {
    term: "LDL Cholesterol",
    abbreviation: "LDL",
    definition:
      "Bad cholesterol that can build up in arteries and increase heart disease risk.",
    plainEnglish:
      "The bad cholesterol. High levels increase your risk of heart disease. You want this to be low.",
    category: "Lipid Panel",
  },
  {
    term: "Triglycerides",
    abbreviation: "TRIG",
    definition:
      "A type of fat in the blood that comes from food and is made by the liver.",
    plainEnglish:
      "A type of fat in your blood. High levels increase your heart disease risk.",
    category: "Lipid Panel",
  },
  {
    term: "Sodium",
    abbreviation: "NA",
    definition:
      "An electrolyte that helps regulate fluid balance and nerve function.",
    plainEnglish:
      "An important mineral that helps your nerves and muscles work. Imbalances can cause serious problems.",
    category: "Electrolytes",
  },
  {
    term: "Potassium",
    abbreviation: "K",
    definition:
      "An electrolyte essential for heart rhythm and muscle function.",
    plainEnglish:
      "An important mineral for your heart and muscles. Too much or too little can be dangerous.",
    category: "Electrolytes",
  },
  {
    term: "Albumin",
    abbreviation: "ALB",
    definition:
      "The most abundant protein in blood, made by the liver and important for maintaining fluid balance.",
    plainEnglish:
      "A protein made by your liver. Low levels might indicate liver or kidney disease.",
    category: "Protein",
  },
  {
    term: "Aspartate Aminotransferase",
    abbreviation: "AST",
    definition:
      "An enzyme found mainly in the liver and heart that is released when these organs are damaged.",
    plainEnglish:
      "A liver enzyme. High levels might indicate liver damage or disease.",
    category: "Liver Function",
  },
  {
    term: "Alanine Aminotransferase",
    abbreviation: "ALT",
    definition:
      "An enzyme found mainly in the liver that is released when the liver is damaged.",
    plainEnglish:
      "A liver enzyme. High levels usually indicate liver disease or damage.",
    category: "Liver Function",
  },
  {
    term: "Alkaline Phosphatase",
    abbreviation: "ALP",
    definition:
      "An enzyme found in bones and the liver that helps break down proteins.",
    plainEnglish:
      "An enzyme found in your bones and liver. High levels might indicate bone or liver disease.",
    category: "Liver Function",
  },
  {
    term: "Bilirubin",
    abbreviation: "BIL",
    definition:
      "A yellow pigment produced from the breakdown of hemoglobin that is processed by the liver.",
    plainEnglish:
      "A yellow pigment from your blood. High levels might indicate liver disease or jaundice.",
    category: "Liver Function",
  },
  {
    term: "Anemia",
    abbreviation: null,
    definition:
      "A condition where there are not enough healthy red blood cells to carry oxygen.",
    plainEnglish:
      "When you don't have enough healthy red blood cells. This can make you feel tired and weak.",
    category: "Blood Disorders",
  },
  {
    term: "Diabetes",
    abbreviation: null,
    definition:
      "A metabolic disorder where blood glucose levels are abnormally high.",
    plainEnglish:
      "A condition where your blood sugar is too high. It requires diet, exercise, and sometimes medicine.",
    category: "Metabolic Disorders",
  },
];

async function seedData() {
  try {
    console.log("Seeding medical reference data...");

    // Insert reference ranges
    for (const range of medicalReferenceData) {
      await db.insert(referenceRanges).values(range).onDuplicateKeyUpdate({
        set: range,
      });
    }
    console.log(`✓ Inserted ${medicalReferenceData.length} reference ranges`);

    // Insert glossary entries
    for (const entry of glossaryData) {
      await db.insert(medicalGlossary).values(entry).onDuplicateKeyUpdate({
        set: entry,
      });
    }
    console.log(`✓ Inserted ${glossaryData.length} glossary entries`);

    console.log("✓ Medical data seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
