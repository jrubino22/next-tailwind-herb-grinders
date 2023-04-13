import { importProducts } from '../../../utils/productImport';
import { IncomingForm } from 'formidable';
import fs from 'fs';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log('Error parsing form:', err);
        res.status(400).json({ error: 'Error parsing form' });
        return;
      }

      const file = files.file;
      console.log('received file', file);

      if (!file) {
        console.log('No file provided');
        res.status(400).json({ error: 'No file provided' });
        return;
      }
      console.log('file.path: ', file.filepath);
      fs.readFile(file.filepath, async (err, fileBuffer) => {
        if (err) {
          console.log('Error reading file:', err);
          res.status(400).json({ error: 'Error reading file' });
          return;
        }

        try {
          const result = await importProducts(fileBuffer);
          console.log('Import result:', result);
          res.status(200).json(result);
        } catch (error) {
          console.log('Error during import:', error);
          res.status(400).json({ error: error.message });
        }
      });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
