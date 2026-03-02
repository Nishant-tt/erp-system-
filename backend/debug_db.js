const mongoose = require("mongoose");
require("dotenv").config();
const FinancialYear = require("./models/FinancialYear");
const Company = require("./models/Company");

const debugDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const fyears = await FinancialYear.find();
        // console.log("Documents in FinancialYear collection:", fyears.length);
        if (fyears.length > 0) {
            console.log("First document company field:", fyears[0].company);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

debugDB();
