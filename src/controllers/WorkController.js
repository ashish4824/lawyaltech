import Work from "../models/Work.model.js";
import uploadImage from "../CLOUDINARY/index.js";
async function GetWork(req, res, next) {
    const project = await Work.find({});
    res.status(200).json({ 
        message: 'Project fetched successfully',
        project: project 
    });
}
async function deleteMany(req, res, next) {
    const project = await Work.deleteMany({});
    res.status(200).json({ 
        message: 'Project deleted successfully',
        project: project 
    });
}
const PostWork = async (req, res, next) => {
    const imageFile = req.files['image'] ? req.files['image'][0] : null; 
    const path = imageFile ? imageFile.originalname : null;
    const image = imageFile ? imageFile.buffer.toString("base64") : null; 
        try {
            const imageUrl = await uploadImage(image, path);
            const { name, description, tags, source_code_link, live_site_link } = req.body;
            const parsedTags = JSON.parse(tags);
            const work = new Work({ 
                name, 
                description, 
                tags: parsedTags,
                source_code_link, 
                live_site_link, 
                image: imageUrl 
            });
            const newWork = await work.save();
            res.status(200).json({ 
                message: 'Work uploaded successfully',
                work: newWork 
            });
        } catch (error) {
            console.log(error);
        }
};
async function updatWork(req, res, next) {
    const imageFile = req.files['image'] ? req.files['image'][0] : null; 
    const path = imageFile ? imageFile.originalname : null;
    const image = imageFile ? imageFile.buffer.toString("base64") : null;
    const id = req.params.id;
    try {
        if (!image) {
            throw new Error('Image is required');
        }
        const imageUrl = await uploadImage(image, path);
        const { name, description, tags, source_code_link, live_site_link } = req.body;
        const parsedTags = JSON.parse(tags);
          const work = await Work.findByIdAndUpdate(id, {
            name, 
            description, 
            tags: parsedTags,
            source_code_link, 
            live_site_link, 
            image: imageUrl
        });
        res.status(200).json({ 
            message: 'Work updated successfully',
            work: work 
        });
       
    } catch (error) {
        console.log(error);
    }
}
async function deleteById(req, res) {
    const id = req.params.id;
   const deletedata = await Work.findByIdAndDelete(id);
    res.status(200).json({ 
        message: 'Work deleted successfully',
        work: deletedata
    });
    
}
export { PostWork, GetWork, deleteMany, updatWork ,deleteById};
