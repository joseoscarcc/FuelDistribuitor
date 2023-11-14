const { Client } = require('pg');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  date: Date,
  site: String,
  product: String,
  quantity: Number,
  price: Number,
  total: Number,
  emailSendStatus: Boolean,
  deliveryStatus: Boolean
});

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
class FuelTank {
  constructor() {
    this.tankHeight = 1024;
  }

  async checkAndSendEmail(po) {
    try {
      if (po.emailSendStatus === false) {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'joseoscarcc@gmail.com',
            pass: 'mnrbzuovbzmcrgze',
            },
        });

        const mailOptions = {
            from: 'joseoscarcc@gmail.com',
            to: 'joseoscar@jojuma.com',
            subject: 'Purchase Order',
            html: `
            <h1>Queretaro Fuel Distributor</h1>
            <h2>Purchase Order ${po._id}</h2>
            <p>Date: ${po.date}</p>
            <p>Site: ${po.site}</p>
            <p>Email: estacion@queretaro</p>
            <p>Fuel Tank ${po.quantity}L, ${po.product} @ ${po.price}</p>
            <p>Automated PO generated due to tank below 30%</p>
            <p>Delivery next day</p>
            <p>Thanks for your business</p>
            `,
        };

        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
            // Update the emailSendStatus of the PurchaseOrder
            po.emailSendStatus = true;
            await po.save();
          }
        });
        }
    } catch (err) {
        console.error('Error in checkAndSendEmail:', err);
      }
  }

  async updateHeight(newHeight) {
    this.tankHeight = newHeight;

    const dbClient = new Client({
      connectionString: 'postgresql://jojumabi:V8qzRc9xzaJ1JhcudwHpXC2gE072vgsE@dpg-cgesosm4dadd1mg46f20-a.oregon-postgres.render.com/pricing_9fln',
        ssl: { rejectUnauthorized: false },
    });

    try {
        await dbClient.connect();
      } catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
      }

      let price;
      try {
      const res = await dbClient.query("SELECT * FROM costos_pemex WHERE date = (SELECT MAX(date) FROM costos_pemex) AND producto = 'regular' AND terminal = 'QUERÉTARO'");
      price = res.rows[0].precio_tar / 1000;
      } catch (err) {
      console.error('Error executing SQL query:', err);
      }

      await dbClient.end();

      const existingPO = await PurchaseOrder.findOne({
        date: new Date().toLocaleDateString(),
        site: "PL/125/EXP",
        product: "Regular 87 Octanes",
        quantity: 30000,
        price: price
      });

      if (!existingPO) {
        const po = new PurchaseOrder({
          date: new Date().toLocaleDateString(),
          site: "PL/125/EXP",
          product: "Regular 87 Octanes",
          quantity: 30000,
          price: price,
          total: 30000*price,
          emailSendStatus: false,
          deliveryStatus: false
        });

        await po.save();

        this.checkAndSendEmail(po);
      }
  }
}

module.exports = FuelTank;