import mongoose from "mongoose";
const blackListSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
});
const BlackList = mongoose.model("blacklist", blackListSchema);
export default BlackList;
