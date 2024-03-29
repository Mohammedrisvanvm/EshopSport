import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderStatus: {
      type: String,
      default: "pending",
    },
    paid: {
      type: Boolean,
      required: true,
      default: false,
    },
    address: {
      type: Object,
      required: true,
    },
    product: {
      type: Array,
      required: true,
    },
    createdAt: {
      type: Date,
      default: new Date().toDateString(),
    },
    userId: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    dispatch: {
      type: Date,
      default: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
    payment: {
      type: Object,
      default: {},
    },
    paymentType: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    amountPayable: {
      type: Number,
      default:0,
    },
    coupon: {
      type: Object,
      default: { applied: false, price: 0, coupon: {} },
    },
    wallet: {
      type: Object,
      default: { applied: false, price: 0,  },
    },
    orderId: {
      type: Object,
      default: 0,
    },
    deliveredDate:{
      type:Date,
      default:0,
    }
  },
  { timestamps: true }
);
export const orderModel = mongoose.model("order", orderSchema);

