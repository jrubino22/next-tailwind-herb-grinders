import { importProducts, parseFile, upload } from '../../utils/productImport';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        res.status(400).json({ error: 'Error uploading file' });
        return;
      }

      try {
        const rows = await parseFile(req.file);
        await importProducts(rows);
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default handler;