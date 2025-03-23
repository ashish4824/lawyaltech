async function message(req, res) {
    const { message } = req.body;
    
    res.status(200).json({ message: 'Message sent successfully' });
}
export default message;