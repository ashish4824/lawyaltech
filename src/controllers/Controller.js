import Contact from "../models/Contact.model.js";

async function postContact(req, res, next) {
   const contact =new Contact(req.body);
    const newContact = await contact.save();
    res.status(201).json({ message: 'Contact created successfully', data: newContact });
}
async function deleteContact(req ,res, next) {
    const contact = await Contact.deleteMany({});
    res.status(200).json({ message: 'Contact deleted successfully',contact: contact });
}
async function getContact(req ,res, next) {
    const contact = await Contact.find({});
    res.status(200).json({ message: 'Contact fetched successfully',contact: contact });
}

export { postContact, deleteContact, getContact };