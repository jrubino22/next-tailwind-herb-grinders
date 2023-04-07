import csvParser from 'csv-parser';
import { parse } from 'xlsx';

import Product from '../models/Product';
import SubProduct from '../models/SubProduct';

export const parseFile = async (file) => {
  let rows = [];

  if (file.mimetype === 'text/csv') {
    rows = await parseCSV(file.buffer);
  } else if (
    file.mimetype ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    rows = await parseXLSX(file.buffer);
  } else {
    throw new Error('Invalid file type');
  }

  return rows;
};

const parseCSV = async (buffer) => {
  const rows = [];

  await new Promise((resolve, reject) => {
    readFileSync(buffer)
      .pipe(csvParser())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  return rows;
};

const parseXLSX = async (buffer) => {
  const workbook = parse(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = parse(sheet, { header: 1 });

  // Convert rows to objects with column headers as keys
  const header = rows.shift();
  return rows.map((row) =>
    Object.fromEntries(row.map((value, i) => [header[i], value]))
  );
};

export const importProducts = async (rows) => {
  // Group products by handle
  const groupedProducts = groupBy(rows, 'Handle');

  for (const handle in groupedProducts) {
    const productRows = groupedProducts[handle];

    // Check if the product has variants
    const hasVariants = productRows.length > 1;

    // Create the product if it doesn't exist
    let product = await Product.findOne({ slug: handle });
    if (!product) {
      product = await createProduct(productRows[0]);
    }

    // If the product has variants, create subproducts
    if (hasVariants) {
      for (const productRow of productRows) {
        const subproduct = await createSubProduct(productRow, product);
        await Product.updateOne(
          { _id: product._id },
          { $addToSet: { variants: subproduct._id } }
        );
      }
    }
  }
};

function groupBy(rows, key) {
  return rows.reduce((result, row) => {
    (result[row[key]] = result[row[key]] || []).push(row);
    return result;
  }, {});
}

async function createProduct(row) {
  const productData = {
    name: row['Title'],
    slug: row['Handle'],
    // other product fields mapping from row
  };

  const product = new Product(productData);
  await product.save();
  return product;
}

async function createSubProduct(row, product) {
  const subProductData = {
    variant: row['Option1 Value'],
    parentName: product.name,
    parentId: product._id,
    slug: product.slug + '-' + row['Option1 Value'].toLowerCase(),
    // other subproduct fields mapping from row
  };

  const subProduct = new SubProduct(subProductData);
  await subProduct.save();
  return subProduct;
}
