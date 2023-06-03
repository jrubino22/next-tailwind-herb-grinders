import csvParser from 'csv-parser';
import { Readable } from 'stream';
import axios from 'axios';
import Product from '../models/Product';
import SubProduct from '../models/SubProduct';

export const importProducts = async (buffer) => {
  const parseCSV = async (buffer) => {
    const rows = [];
    const readableStreamBuffer = new Readable();
    readableStreamBuffer.push(buffer);
    readableStreamBuffer.push(null);
    await new Promise((resolve, reject) => {
      readableStreamBuffer
        .pipe(csvParser())
        .on('data', (data) => {
          rows.push(data);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        });
    });
    // Group the products
    const groupedProducts = [];
    let currentProduct = null;

    for (let row of rows) {
      let itemType = row['Item Type'].trim();

      if (itemType === 'Product') {
        if (currentProduct) {
          groupedProducts.push(currentProduct);
        }
        currentProduct = {
          product: row,
          skus: [],
        };
      } else if (itemType === 'SKU') {
        currentProduct.skus.push(row);
      }
    }
    if (currentProduct) {
      groupedProducts.push(currentProduct);
    }

    ////////

    for (const group of groupedProducts) {
      const optionNamesMap = {};
      const hasVariants = group.skus.length > 1;
      const mainProduct = group.product;

      for (const sku of group.skus) {
        let skuName = sku['Product Name'];
        skuName = skuName.replace(/\[.*?\]/g, '');
        const optionPairs = skuName.split(',');

        for (const pair of optionPairs) {
          const [option, value] = pair.split('=');

          if (!optionNamesMap[option]) {
            optionNamesMap[option] = new Set();
          }
          optionNamesMap[option].add(value);
        }
      }

      // Convert the sets to arrays
      for (const key in optionNamesMap) {
        optionNamesMap[key] = Array.from(optionNamesMap[key]);
      }

      const optionsArray = Object.entries(optionNamesMap).map(
        ([name, values]) => ({
          name,
          values,
        })
      );

      let product = await Product.findOne({ sku: mainProduct.sku });

      if (!product) {
        product = await createProduct(mainProduct, optionsArray);
      }
      if (hasVariants) {
        for (const sku of group.skus) {
          const subproduct = await createSubProduct(sku, product);
          await Product.updateOne(
            { _id: product._id },
            {
              $addToSet: { variants: subproduct._id },
              $set: {
                options: optionsArray,
                price: 0,
                sku: '',
                countInStock: 0,
              },
            }
          );
        }
      }
    }

    function getSelectedOptions(optionString) {
      const options = optionString.replace(/\[.*?\]/g, '').split(',');
      const selectedOptions = [];

      for (const option of options) {
        const [name, value] = option.split('=');
        selectedOptions.push({ name, value });
      }

      return selectedOptions.length === 1
        ? selectedOptions[0]
        : selectedOptions;
    }
    async function createSubProduct(sku, product) {
      const cleanedVariant = sku['Product Name']
        .replace(/[[\]]/g, '')
        .split(',');

      let variantValues = [];

      for (const variant of cleanedVariant) {
        // eslint-disable-next-line no-unused-vars
        const [_, value] = variant.split('=');
        variantValues.push(value);
      }
      const subProductData = {
        variant: variantValues.join(', '),
        parentName: product.name,
        parentId: product._id,
        slug: product.slug.replace(/\//g, ''),
        image: {
          url: product.images[0].url,
          altText: product.images[0].altText,
        },
        weight: sku['Product Weight']
          ? parseInt(sku['Product Weight']) * 453.592
          : 0,
        selectedOptions: getSelectedOptions(sku['Product Name']),
        price: sku['Price'] || 0,
        compareAtPrice: sku['Sale Price'] || 0,
        countInStock: sku['Current Stock Level'],
        sku: sku['Product Code/SKU'],
        onlyImported: true,
        bigComId: sku['Product ID'],
        parentBigComId: product.bigComId,
      };

      const subProduct = new SubProduct(subProductData);

      await subProduct.save().catch((err) => console.error(err));

      return subProduct;
    }

    async function createProduct(mainProduct, options) {
      const mainProductData = {
        name: mainProduct['Product Name'],
        slug: mainProduct['Product URL'].replace(/\//g, ''),
        description: mainProduct['Product Description']
          ? mainProduct['Product Description']
          : ' ',
        images: [
          {
            url: 'https://res.cloudinary.com/ddsp9kgde/image/upload/v1677708544/placeholder_qqiwqi.png',
            altText:
              'placeholder image - this should be deleted once product images are added',
            displayOrder: 0,
          },
        ],
        price: mainProduct['Price'] || 0,
        compareAtPrice: mainProduct['Sale Price'] || 0,
        countInStock: mainProduct['Current Stock Level'],
        onlyImported: true,
        brand: mainProduct['Brand Name'],
        metaDesc: mainProduct['Meta Description'],
        sku: mainProduct['Product Code/SKU'],
        weight: mainProduct['Product Weight']
          ? parseInt(mainProduct['Product Weight']) * 453.592
          : 0,
        bigComId: mainProduct['Product ID'],
        options: options,
      };

      const product = new Product(mainProductData);
      await product.save().catch((err) => console.error(err));
      return product;
    }

    return groupedProducts;
  };

  async function deleteOrphanSubProducts() {
    const subproducts = await SubProduct.find();

    for (let subproduct of subproducts) {
      const productExists = await Product.exists({ _id: subproduct.parentId });

      if (!productExists) {
        await SubProduct.deleteOne({ _id: subproduct._id });
      }
    }
  }

  async function updateSubProductsWithBigCommerceIds() {
    const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
    const BIGCOMMERCE_CLIENT_ID = process.env.BIGCOMMERCE_CLIENT_ID;
    const BIGCOMMERCE_ACCESS_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN;

    // Get product list from BigCommerce API
    const response = await axios.get(
      `https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v3/catalog/products?include=variants`,
      {
        headers: {
          'X-Auth-Client': BIGCOMMERCE_CLIENT_ID,
          'X-Auth-Token': BIGCOMMERCE_ACCESS_TOKEN,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const products = response.data.data;

    // Create a mapping from SKU to ID
    const skuToId = {};
    for (const product of products) {
      for (const variant of product.variants) {
        skuToId[variant.sku] = variant.id; // or use product.id if needed
      }
    }

    console.log('skitoid',skuToId);

    // Get all subproducts
    const subproducts = await SubProduct.find();

    // Prepare bulk update operations
    const ops = subproducts
      .filter((subproduct) => subproduct.sku in skuToId) // Ignore subproducts without matching SKU
      .map((subproduct) => ({
        updateOne: {
          filter: { _id: subproduct._id },
          update: { $set: { bigComId: skuToId[subproduct.sku] } }, // Replace bigComId with the corresponding ID from BigCommerce
        },
      }));

    // Perform bulk update
    await SubProduct.bulkWrite(ops);
  }

  deleteOrphanSubProducts();
  updateSubProductsWithBigCommerceIds();

  const groupedProducts = await parseCSV(buffer);
  console.log('gp2', groupedProducts);
  return {
    success: true,
    message: 'Products imported successfully',
    data: groupedProducts,
  };
};

//////////////////////////////////////

// export const importProductsBigCommerce = async (buffer) => {
//   const parseCSV = async (rows) => {
//     const groupedProducts = [];
//     let currentProduct = null;

//     for (let row of rows) {
//       if (row['Item Type'] === 'Product') {
//         // Starting a new product, so add the current one to the list
//         if (currentProduct) {
//           groupedProducts.push(currentProduct);
//         }

//         // Start a new product group
//         currentProduct = {
//           product: row,
//           skus: [],
//         };
//       } else if (row['Item Type'] === 'SKU') {
//         // This is a SKU, so add it to the current product
//         currentProduct.skus.push(row);
//       }
//     }

//     // Push the last product into the list
//     if (currentProduct) {
//       groupedProducts.push(currentProduct);
//     }

//     for (const group of groupedProducts) {
//       const hasVariants = group.length > 1;
//       const skus = group.skus;
//       const mainProduct = group.product;
//       let optionNamesMap = {};
//       let product = await Product.findOne({ sku: mainProduct.sku });

//       if (!product) {
//         product = await createProduct(group.product);
//       }
//       if (hasVariants) {
//         for (const sku of skus) {
//           const subproduct = await createSubProduct(
//             sku,
//             product,
//             optionNamesMap,
//             mainProduct
//           );
//         }
//       }
//     }
//   };

//   async function createProduct(mainProduct) {
//     const mainProductData = {
//       name: mainProduct['Product Name'],
//       slug: mainProduct['Product Url'],
//       description: mainProduct['Product Description'],
//       images: [
//         {
//           url: 'https://res.cloudinary.com/ddsp9kgde/image/upload/v1677708544/placeholder_qqiwqi.png',
//           altText:
//             'placeholder image - this should be deleted once product images are added',
//           displayOrder: 0,
//         },
//       ],
//       price: mainProduct['Price'],
//       compareAtPrice: mainProduct['Sale Price'] ? mainProduct['Sale Price'] : 0,
//       countInStock: mainProduct['Current Stock Level'],
//       onlyImported: true,
//       brand: mainProduct['Brand Name'],
//       metaDesc: mainProduct['Meta Description'],
//       sku: mainProduct['Product Code/SKU'],
//       weight: parseInt(mainProduct['Product Weight']) * 453.592,
//       bigComId: mainProduct['Product ID'],
//     };

//     const product = new Product(mainProductData);
//     await product.save();
//     return product;
//   }
// };

// // import csvParser from 'csv-parser';
// // import { Readable } from 'stream';

// // import Product from '../models/Product';
// // import SubProduct from '../models/SubProduct';

// export const importProducts = async (buffer) => {
//   const rows = await parseCSV(buffer);

//   const { groupedProducts, optionNamesMap } = groupBy(rows, 'Handle');
//   // const optionNames = extractOptionNames(rows);

//   for (const handle in groupedProducts) {
//     const productRows = groupedProducts[handle];

//     const hasVariants = productRows.some((row) => row['Variant SKU']);

//     const addVariants = productRows.length > 1;

//     const mainProductRow = findMainProductRow(productRows, handle);

//     let product = await Product.findOne({ slug: handle });
//     if (!product) {
//       product = await createProduct(productRows[0]);
//     }
//     if (addVariants) {
//       for (const productRow of productRows) {
//         if (hasVariants && productRow['Variant SKU']) {
//           const subproduct = await createSubProduct(
//             productRow,
//             product,
//             optionNamesMap,
//             mainProductRow
//           );
//           await Product.updateOne(
//             { _id: product._id },
//             {
//               $addToSet: { variants: subproduct._id },
//               $set: {
//                 options: getProductOptions(
//                   mainProductRow,
//                   optionNamesMap[handle],
//                   productRows
//                 ),
//                 price: 0,
//                 sku: '',
//                 countInStock: 0,
//               },
//             }
//           );
//         } else if (!productRow['Variant SKU']) {
//           await Product.updateOne(
//             { _id: product._id },
//             {
//               $addToSet: {
//                 images: {
//                   url: productRow['Image Src'],
//                   altText: productRow['Image Alt Text'],
//                   displayOrder: product.images.length,
//                 },
//               },
//             }
//           );
//         }
//       }
//     }
//   }

//   return {
//     success: true,
//     message: 'Products imported successfully',
//     data: rows,
//   };
// };

// function removeLeadingQuote(sku) {
//   return sku && sku.startsWith("'") ? sku.slice(1) : sku;
// }

// function extractOptionNames(rows) {
//   const optionNames = {};

//   rows.forEach((row) => {
//     for (let i = 1; i <= 3; i++) {
//       const optionName = row[`Option${i} Name`];
//       const optionValue = row[`Option${i} Value`];

//       if (optionName && optionValue) {
//         if (!optionNames[optionName]) {
//           optionNames[optionName] = new Set();
//         }
//         optionNames[optionName].add(optionValue);
//       }
//     }
//   });

//   // Convert the sets to arrays
//   for (const key in optionNames) {
//     optionNames[key] = Array.from(optionNames[key]);
//   }

//   return optionNames;
// }

// function findMainProductRow(rows, handle) {
//   return rows.find((row) => {
//     return (
//       row['Handle'] === handle &&
//       (row['Option1 Name'] || row['Option2 Name'] || row['Option3 Name'])
//     );
//   });
// }

// function getProductOptions(mainProductRow, optionNames, productRows) {
//   const options = [];

//   for (const optionName in optionNames) {
//     const optionValues = new Set();

//     productRows.forEach((row) => {
//       for (let i = 1; i <= 3; i++) {
//         if (mainProductRow[`Option${i} Name`] && row[`Option${i} Value`]) {
//           optionValues.add(row[`Option${i} Value`]);
//         }
//       }
//     });

//     options.push({
//       name: optionName,
//       values: Array.from(optionValues),
//     });
//   }

//   return options;
// }
// async function createProduct(row) {
//   const sanatizedSku = removeLeadingQuote(row['Variant SKU']);
//   const productData = {
//     name: row['Title'],
//     slug: row['Handle'],
//     description: row['Body (HTML)'],
//     images: [
//       {
//         url: row['Image Src'],
//         altText: row['Image Alt Text'],
//         displayOrder: 0,
//       },
//     ],
//     price: row['Variant Price'],
//     compareAtPrice: row['Variant Compare At Price']
//       ? row['Variant Compare At Price']
//       : 0,
//     countInStock: row['Variant Inventory Qty'],
//     onlyImported: true,
//     brand: row['Vendor'],
//     metaDesc: row['SEO Description'],
//     sku: sanatizedSku,
//     weight: row['Variant Grams'],
//   };

//   const product = new Product(productData);
//   await product.save();
//   return product;
// }

// async function createSubProduct(row, product, optionNamesMap, mainProductRow) {
//   const sanatizedSku = removeLeadingQuote(row['Variant SKU']);
//   const subProductData = {
//     variant: `${row['Option1 Value']}${
//       row['Option2 Value'] ? `, ${row['Option2 Value']}` : ''
//     }${row['Option3 Value'] ? `, ${row['Option3 Value']}` : ''}`,
//     parentName: product.name,
//     parentId: product._id,
//     slug: product.slug,
//     image: {
//       url: product.images[0].url,
//       altText: product.images[0].altText,
//     },
//     weight: row['Variant Grams'],
//     selectedOptions: getSelectedOptionsFromRow(
//       row,
//       optionNamesMap[row['Handle']],
//       mainProductRow
//     ),
//     price: row['Variant Price'],
//     compareAtPrice: row['Variant Compare At Price']
//       ? row['Variant Compare At Price']
//       : 0,
//     countInStock: row['Variant Inventory Qty'],
//     sku: sanatizedSku,
//     onlyImported: true,
//   };

//   const subProduct = new SubProduct(subProductData);
//   await subProduct.save();
//   return subProduct;
// }

// function getSelectedOptionsFromRow(row, optionNames, mainProductRow) {
//   const selectedOptions = [];

//   for (let i = 1; i <= 3; i++) {
//     if (mainProductRow[`Option${i} Name`] && row[`Option${i} Value`]) {
//       selectedOptions.push({
//         name: mainProductRow[`Option${i} Name`],
//         value: row[`Option${i} Value`],
//       });
//     }
//   }

//   return selectedOptions;
// }

// export const parseCSV = async (buffer) => {
//   const rows = [];

//   return new Promise((resolve, reject) => {
//     const parser = csvParser();

//     parser
//       .on('data', (data) => {
//         rows.push(data);
//       })
//       .on('end', () => {
//         resolve(rows);
//       })
//       .on('error', (err) => {
//         reject(err);
//       });

//     const readableStreamBuffer = new Readable();
//     readableStreamBuffer.push(buffer);
//     readableStreamBuffer.push(null);

//     readableStreamBuffer.pipe(parser);
//   });
// };

// function groupBy(rows, key) {
//   const optionNamesMap = {};

//   const groupedProducts = rows.reduce((result, row) => {
//     (result[row[key]] = result[row[key]] || []).push(row);

//     // Update the option names map for this handle
//     if (!optionNamesMap[row[key]]) {
//       optionNamesMap[row[key]] = extractOptionNames([row]);
//     }

//     return result;
//   }, {});

//   return { groupedProducts, optionNamesMap };
// }

// import csvParser from 'csv-parser';
// import { Readable } from 'stream';

// import Product from '../models/Product';
// import SubProduct from '../models/SubProduct';

// export const importProducts = async (buffer) => {
//   const rows = await parseCSV(buffer);

//   const { groupedProducts, optionNamesMap } = groupBy(rows, 'Handle');
//   // const optionNames = extractOptionNames(rows);

//   for (const handle in groupedProducts) {
//     const productRows = groupedProducts[handle];

//     const hasVariants = productRows.some((row) => row['Variant SKU']);

//     const addVariants = productRows.length > 1;

//     const mainProductRow = findMainProductRow(productRows, handle);

//     let product = await Product.findOne({ slug: handle });
//     if (!product) {
//       product = await createProduct(productRows[0]);
//     }
//     if (addVariants) {
//       for (const productRow of productRows) {
//         if (hasVariants && productRow['Variant SKU']) {
//           const subproduct = await createSubProduct(
//             productRow,
//             product,
//             optionNamesMap,
//             mainProductRow
//           );
//           await Product.updateOne(
//             { _id: product._id },
//             {
//               $addToSet: { variants: subproduct._id },
//               $set: {
//                 options: getProductOptions(
//                   mainProductRow,
//                   optionNamesMap[handle],
//                   productRows
//                 ),
//                 price: 0,
//                 sku: '',
//                 countInStock: 0,
//               },
//             }
//           );
//         } else if (!productRow['Variant SKU']) {
//           await Product.updateOne(
//             { _id: product._id },
//             {
//               $addToSet: {
//                 images: {
//                   url: productRow['Image Src'],
//                   altText: productRow['Image Alt Text'],
//                   displayOrder: product.images.length,
//                 },
//               },
//             }
//           );
//         }
//       }
//     }
//   }

//   return {
//     success: true,
//     message: 'Products imported successfully',
//     data: rows,
//   };
// };

// function removeLeadingQuote(sku) {
//   return sku && sku.startsWith("'") ? sku.slice(1) : sku;
// }

// function extractOptionNames(rows) {
//   const optionNames = {};

//   rows.forEach((row) => {
//     for (let i = 1; i <= 3; i++) {
//       const optionName = row[`Option${i} Name`];
//       const optionValue = row[`Option${i} Value`];

//       if (optionName && optionValue) {
//         if (!optionNames[optionName]) {
//           optionNames[optionName] = new Set();
//         }
//         optionNames[optionName].add(optionValue);
//       }
//     }
//   });

//   // Convert the sets to arrays
//   for (const key in optionNames) {
//     optionNames[key] = Array.from(optionNames[key]);
//   }

//   return optionNames;
// }

// function findMainProductRow(rows, handle) {
//   return rows.find((row) => {
//     return (
//       row['Handle'] === handle &&
//       (row['Option1 Name'] || row['Option2 Name'] || row['Option3 Name'])
//     );
//   });
// }

// function getProductOptions(mainProductRow, optionNames, productRows) {
//   const options = [];

//   for (const optionName in optionNames) {
//     const optionValues = new Set();

//     productRows.forEach((row) => {
//       for (let i = 1; i <= 3; i++) {
//         if (mainProductRow[`Option${i} Name`] && row[`Option${i} Value`]) {
//           optionValues.add(row[`Option${i} Value`]);
//         }
//       }
//     });

//     options.push({
//       name: optionName,
//       values: Array.from(optionValues),
//     });
//   }

//   return options;
// }
// async function createProduct(row) {
//   const sanatizedSku = removeLeadingQuote(row['Variant SKU']);
//   const productData = {
//     name: row['Title'],
//     slug: row['Handle'],
//     description: row['Body (HTML)'],
//     images: [
//       {
//         url: row['Image Src'],
//         altText: row['Image Alt Text'],
//         displayOrder: 0,
//       },
//     ],
//     price: row['Variant Price'],
//     compareAtPrice: row['Variant Compare At Price']
//       ? row['Variant Compare At Price']
//       : 0,
//     countInStock: row['Variant Inventory Qty'],
//     onlyImported: true,
//     brand: row['Vendor'],
//     metaDesc: row['SEO Description'],
//     sku: sanatizedSku,
//     weight: row['Variant Grams'],
//   };

//   const product = new Product(productData);
//   await product.save();
//   return product;
// }

// async function createSubProduct(row, product, optionNamesMap, mainProductRow) {
//   const sanatizedSku = removeLeadingQuote(row['Variant SKU']);
//   const subProductData = {
//     variant: `${row['Option1 Value']}${
//       row['Option2 Value'] ? `, ${row['Option2 Value']}` : ''
//     }${row['Option3 Value'] ? `, ${row['Option3 Value']}` : ''}`,
//     parentName: product.name,
//     parentId: product._id,
//     slug: product.slug,
//     image: {
//       url: product.images[0].url,
//       altText: product.images[0].altText,
//     },
//     weight: row['Variant Grams'],
//     selectedOptions: getSelectedOptionsFromRow(
//       row,
//       optionNamesMap[row['Handle']],
//       mainProductRow
//     ),
//     price: row['Variant Price'],
//     compareAtPrice: row['Variant Compare At Price']
//       ? row['Variant Compare At Price']
//       : 0,
//     countInStock: row['Variant Inventory Qty'],
//     sku: sanatizedSku,
//     onlyImported: true,
//   };

//   const subProduct = new SubProduct(subProductData);
//   await subProduct.save();
//   return subProduct;
// }

// function getSelectedOptionsFromRow(row, optionNames, mainProductRow) {
//   const selectedOptions = [];

//   for (let i = 1; i <= 3; i++) {
//     if (mainProductRow[`Option${i} Name`] && row[`Option${i} Value`]) {
//       selectedOptions.push({
//         name: mainProductRow[`Option${i} Name`],
//         value: row[`Option${i} Value`],
//       });
//     }
//   }

//   return selectedOptions;
// }

// export const parseCSV = async (buffer) => {
//   const rows = [];

//   return new Promise((resolve, reject) => {
//     const parser = csvParser();

//     parser
//       .on('data', (data) => {
//         rows.push(data);
//       })
//       .on('end', () => {
//         resolve(rows);
//       })
//       .on('error', (err) => {
//         reject(err);
//       });

//     const readableStreamBuffer = new Readable();
//     readableStreamBuffer.push(buffer);
//     readableStreamBuffer.push(null);

//     readableStreamBuffer.pipe(parser);
//   });
// };

// function groupBy(rows, key) {
//   const optionNamesMap = {};

//   const groupedProducts = rows.reduce((result, row) => {
//     (result[row[key]] = result[row[key]] || []).push(row);

//     // Update the option names map for this handle
//     if (!optionNamesMap[row[key]]) {
//       optionNamesMap[row[key]] = extractOptionNames([row]);
//     }

//     return result;
//   }, {});

//   return { groupedProducts, optionNamesMap };
// }
