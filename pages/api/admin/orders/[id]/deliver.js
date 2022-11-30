import Order from "../../../../../models/Order";
import db from "../../../../../utils/db";





const handler = async (req, res) => {
    await db.connect();
    const order = await Order.findById(req.query.id);
    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        const deliveredOrder = await order.save();
        await db.disconnect();
        res.send({
            message: 'order delivered successfully',
            order: deliveredOrder,
        });
    } else {
        await db.disconnect();
        res.status(404).send({ message: 'Error: order not found' });
    }
}

export default handler;