import csvParser from 'csv-parser';
import { Readable } from 'stream';

import Product from '../models/Product';
import SubProduct from '../models/SubProduct';

export const importProducts = async (buffer) => {
  console.log('received-buffer', buffer);
  const rows = await parseCSV(buffer);
  console.log('Parsed CSV rows:', rows);

  const { groupedProducts, optionNamesMap } = groupBy(rows, 'Handle');
  // const optionNames = extractOptionNames(rows);

  for (const handle in groupedProducts) {
    const productRows = groupedProducts[handle];

    const hasVariants = productRows.some((row) => row['Variant SKU']);

    const addVariants = productRows.length > 1;

    const mainProductRow = findMainProductRow(productRows, handle);

    let product = await Product.findOne({ slug: handle });
    if (!product) {
      product = await createProduct(productRows[0]);
    }
    if (addVariants) {
      for (const productRow of productRows) {
        if (hasVariants && productRow['Variant SKU']) {
          const subproduct = await createSubProduct(
            productRow,
            product,
            optionNamesMap,
            mainProductRow
          );
          await Product.updateOne(
            { _id: product._id },
            {
              $addToSet: { variants: subproduct._id },
              $set: {
                options: getProductOptions(
                  mainProductRow,
                  optionNamesMap[handle],
                  productRows
                ),
                price: 0,
                sku: '',
                countInStock: 0,
              },
            }
          );
        } else if (!productRow['Variant SKU']) {
          await Product.updateOne(
            { _id: product._id },
            {
              $addToSet: {
                images: {
                  url: productRow['Image Src'],
                  altText: productRow['Image Alt Text'],
                  displayOrder: product.images.length,
                },
              },
            }
          );
        }
      }
    }
  }

  return {
    success: true,
    message: 'Products imported successfully',
    data: rows,
  };
};

function removeLeadingQuote(sku) {
  console.log('sku', sku);
  return sku && sku.startsWith("'") ? sku.slice(1) : sku;
}

function extractOptionNames(rows) {
  const optionNames = {};

  rows.forEach((row) => {
    for (let i = 1; i <= 3; i++) {
      const optionName = row[`Option${i} Name`];
      const optionValue = row[`Option${i} Value`];

      if (optionName && optionValue) {
        if (!optionNames[optionName]) {
          optionNames[optionName] = new Set();
        }
        optionNames[optionName].add(optionValue);
      }
    }
  });

  // Convert the sets to arrays
  for (const key in optionNames) {
    optionNames[key] = Array.from(optionNames[key]);
  }

  return optionNames;
}

function findMainProductRow(rows, handle) {
  return rows.find((row) => {
    return (
      row['Handle'] === handle &&
      (row['Option1 Name'] || row['Option2 Name'] || row['Option3 Name'])
    );
  });
}

function getProductOptions(mainProductRow, optionNames, productRows) {
  const options = [];

  for (const optionName in optionNames) {
    const optionValues = new Set();

    productRows.forEach((row) => {
      for (let i = 1; i <= 3; i++) {
        if (mainProductRow[`Option${i} Name`] && row[`Option${i} Value`]) {
          optionValues.add(row[`Option${i} Value`]);
        }
      }
    });

    options.push({
      name: optionName,
      values: Array.from(optionValues),
    });
  }

  return options;
}
async function createProduct(row) {
  const sanatizedSku = removeLeadingQuote(row['Variant SKU']);
  const productData = {
    name: row['Title'],
    slug: row['Handle'],
    description: row['Body (HTML)'],
    images: [
      {
        url: row['Image Src'],
        altText: row['Image Alt Text'],
        displayOrder: 0,
      },
    ],
    price: row['Variant Price'],
    compareAtPrice: row['Variant Compare At Price']
      ? row['Variant Compare At Price']
      : 0,
    countInStock: row['Variant Inventory Qty'],
    onlyImported: true,
    brand: row['Vendor'],
    metaDesc: row['SEO Description'],
    sku: sanatizedSku,
    weight: row['Variant Grams'],
  };

  const product = new Product(productData);
  await product.save();
  console.log('Created product:', product);
  return product;
}

// function extractOptionNames(rows) {
//   const optionNames = new Set();

//   for (const row of rows) {
//     for (let i = 1; i <= 3; i++) {
//       if (row[`Option${i} Name`]) {
//         optionNames.add(row[`Option${i} Name`]);
//       }
//     }
//   }

//   return Array.from(optionNames);
// }

async function createSubProduct(row, product, optionNamesMap, mainProductRow) {
  const sanatizedSku = removeLeadingQuote(row['Variant SKU']);
  const subProductData = {
    variant: `${row['Option1 Value']}${
      row['Option2 Value'] ? `, ${row['Option2 Value']}` : ''
    }${row['Option3 Value'] ? `, ${row['Option3 Value']}` : ''}`,
    parentName: product.name,
    parentId: product._id,
    slug: product.slug,
    image: {
      url: product.images[0].url,
      altText: product.images[0].altText,
    },
    weight: row['Variant Grams'],
    selectedOptions: getSelectedOptionsFromRow(
      row,
      optionNamesMap[row['Handle']],
      mainProductRow
    ),
    price: row['Variant Price'],
    compareAtPrice: row['Variant Compare At Price']
      ? row['Variant Compare At Price']
      : 0,
    countInStock: row['Variant Inventory Qty'],
    sku: sanatizedSku,
    onlyImported: true,
  };

  console.log(
    'subproduct-variant',
    `${row['Option1 Value']}${
      row['Option2 Value'] ? `, ${row['Option2 Value']}` : ''
    }${row['Option3 Value'] ? `, ${row['Option3 Value']}` : ''}`
  );

  const subProduct = new SubProduct(subProductData);
  await subProduct.save();
  console.log('Created subproduct:', subProduct);
  return subProduct;
}

// function getOptionsFromRow(row, optionNamesMap) {
//   const options = [];
//   const handle = row['Handle'];
//   const optionNames = optionNamesMap[handle];

//   for (let i = 1; i <= 3; i++) {
//     if (row[`Option${i} Value`]) {
//       const optionName = optionNames[i - 1];
//       const optionValue = row[`Option${i} Value`];

//       let option = options.find((option) => option.name === optionName);

//       if (!option) {
//         option = {
//           name: optionName,
//           values: [],
//         };
//         options.push(option);
//       }

//       if (!option.values.includes(optionValue)) {
//         option.values.push(optionValue);
//       }
//     }
//   }

//   return options;
// }

function getSelectedOptionsFromRow(row, optionNames, mainProductRow) {
  const selectedOptions = [];

  for (let i = 1; i <= 3; i++) {
    if (mainProductRow[`Option${i} Name`] && row[`Option${i} Value`]) {
      selectedOptions.push({
        name: mainProductRow[`Option${i} Name`],
        value: row[`Option${i} Value`],
      });
    }
  }

  return selectedOptions;
}

export const parseCSV = async (buffer) => {
  const rows = [];

  return new Promise((resolve, reject) => {
    const parser = csvParser();

    parser
      .on('data', (data) => {
        rows.push(data);
      })
      .on('end', () => {
        resolve(rows);
      })
      .on('error', (err) => {
        reject(err);
      });

    const readableStreamBuffer = new Readable();
    readableStreamBuffer.push(buffer);
    readableStreamBuffer.push(null);

    readableStreamBuffer.pipe(parser);
  });
};

function groupBy(rows, key) {
  const optionNamesMap = {};

  const groupedProducts = rows.reduce((result, row) => {
    (result[row[key]] = result[row[key]] || []).push(row);

    // Update the option names map for this handle
    if (!optionNamesMap[row[key]]) {
      optionNamesMap[row[key]] = extractOptionNames([row]);
    }

    return result;
  }, {});

  return { groupedProducts, optionNamesMap };
}
