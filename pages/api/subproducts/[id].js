import SubProduct from "../../../models/SubProduct";
import db from "../../../utils/db";

const handler = async (req, res) => {

    await db.connect();
    const product = await SubProduct.findById(req.query.id);
    await db.disconnect();
    res.send(product);

}

export default handler;