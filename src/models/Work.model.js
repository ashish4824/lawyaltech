import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        name: { type: String, required: true },
        color: { type: String, required: true },
      },
    ],
    source_code_link: {
      type: String,
      required: true,
      trim: true,
    },
    live_site_link: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
        type: String,
        required: false,
        trim: true,
      },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
