import Product from '../../../../models/Product';
import SubProduct from '../../../../models/SubProduct';
import db from '../../../../utils/db';
import { getSession } from 'next-auth/react';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('admin signin required');
  }

  if (req.method === 'GET') {
    return getHandler(req, res);
  }
  if (req.method === 'POST') {
    return postHandler(req, res);
  }
  if (req.method === 'PUT') {
    return putHandler(req, res);
  }
  else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const postHandler = async (req, res) => {
  const { productId, newVariants, deletedVariantIds, options } = req.body;

  await db.connect();

  await Promise.all(
    newVariants
      .filter((variant) => variant._id)
      .map((variant) =>
        SubProduct.findByIdAndUpdate(variant._id, {
          variant: variant.variant,
          image: {
            url: variant.imageUrl,
            altText: variant.imageAlt,
          },
          parentName: variant.parentName,
          slug: variant.slug,
          selectedOptions: variant.selectedOptions,
        })
      )
  );

  const createdSubProducts = await SubProduct.insertMany(
    newVariants.map((variant) => ({
      variant: variant.variant,
      parentId: productId,
      parentName: variant.parentName,
      slug: variant.slug,
      image: {
        url: variant.imageURL,
        altText: variant.imageAlt,
      },
      selectedOptions: variant.selectedOptions,
      sku: variant.sku || ' ',
      price: variant.price || 0,
      countInStock: variant.countInStock || 0,
      weight: variant.weight || 0,
    }))
  );

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $push: {
        variants: {
          $each: createdSubProducts.map((subproduct) => subproduct._id),
        },
      },
      options: options,
    },
    { new: true }
  );

  if (deletedVariantIds.length > 0) {
    await SubProduct.deleteMany({ _id: { $in: deletedVariantIds } });
    await Product.findByIdAndUpdate(
      productId,
      { $pull: { variants: { $in: deletedVariantIds } } },
      { new: true }
    );
  }

  await db.disconnect();
  res.send({
    message: 'Variants updated successfully',
    updatedProduct,
    createdSubProducts,
  });
};

const getHandler = async (req, res) => {
  console.log('pid', req.query.params);
  await db.connect();

  const product = await Product.findById(req.query._id);

  // const productVariants = (await product.variants) ? [] : null;
  // if (product.variants) {
  //   for (let i = 0; i < product.variants.length; i++) {
  //     const singleVariant = await SubProduct.findById(product.variants[i]);
  //     productVariants.push(singleVariant);
  //   }
  //   await db.disconnect();
  //   res.send(productVariants);
  // }
  res.send(product);
};

const putHandler = async (req, res) => {
  const { subproducts } = req.body;

  await db.connect();

  // Update each subproduct in the array
  const updatedSubProducts = await Promise.all(
    subproducts.map(async (subproduct) => {
      const { _id, selectedOptions } = subproduct;
      return await SubProduct.findByIdAndUpdate(
        _id,
        {
          selectedOptions,
        },
        { new: true }
      );
    })
  );

  if (updatedSubProducts) {
    res.send(updatedSubProducts);
  } else {
    res.status(404).send({ message: 'Subproducts not found' });
  }
};

export default handler;
