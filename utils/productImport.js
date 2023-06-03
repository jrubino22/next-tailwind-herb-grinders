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
  return {
    success: true,
    message: 'Products imported successfully',
    data: groupedProducts,
  };
};
