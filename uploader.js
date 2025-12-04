export const uploader = (req, res, port) => {
    const fileUrl = `http://localhost:${port}/media/${req.file.filename}`;
    res.json({ url: fileUrl });
}