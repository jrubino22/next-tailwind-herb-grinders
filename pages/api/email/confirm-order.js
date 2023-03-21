import sgMail from '@sendgrid/mail';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(400).send({ message: `${req.method} not supported` });
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const { name, email, order, orderItems } = req.body;

  // Create an HTML table for the product list
  const productListHtml = orderItems.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const content = {
    to: email,
    from: 'support@herbgrinders.com',
    subject: `Order Confirmation - ${order}`,
    text: `Thank you for your order, ${name}! Your order number is ${order}.`,
    html: `
      <p>Thank you for your order, ${name}! Your order number is ${order}.</p>
      <h3>Order Details</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${productListHtml}
        </tbody>
      </table>
    `,
  };

  try {
    await sgMail.send(content);
    res.status(200).send('Order confirmation email sent successfully.');
  } catch (error) {
    console.log('ERROR', error);
    res.status(400).send('Order confirmation email not sent.');
  }
}

export default handler;