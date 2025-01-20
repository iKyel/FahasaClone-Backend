import axios from "axios";
import crypto from "crypto";
import { Request, Response } from "express";

class MoMoPaymentController {
  private readonly accessKey = "F8BBA842ECF85";
  private readonly secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  private readonly partnerCode = "MOMO";
  private readonly redirectUrl =
    "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
  private readonly ipnUrl =
    "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
  private readonly endpoint =
    "https://test-payment.momo.vn/v2/gateway/api/create";

  constructor() {
    this.createPayment = this.createPayment.bind(this);
  }
  public async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const { amount, orderInfo } = req.body;

      const orderId = `${this.partnerCode}${Date.now()}`;
      const requestId = orderId;
      const extraData = "";
      const requestType = "payWithMethod";
      const autoCapture = true;
      const lang = "vi";

      // Tạo rawSignature
      const rawSignature = [
        `accessKey=${this.accessKey}`,
        `amount=${amount}`,
        `extraData=${extraData}`,
        `ipnUrl=${this.ipnUrl}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `partnerCode=${this.partnerCode}`,
        `redirectUrl=${this.redirectUrl}`,
        `requestId=${requestId}`,
        `requestType=${requestType}`,
      ].join("&");

      // Ký rawSignature
      const signature = crypto
        .createHmac("sha256", this.secretKey)
        .update(rawSignature)
        .digest("hex");

      // Tạo payload gửi đến MoMo
      const requestBody = {
        partnerCode: this.partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl: this.redirectUrl,
        ipnUrl: this.ipnUrl,
        lang,
        requestType,
        autoCapture,
        extraData,
        signature,
      };

      // Gửi request đến API MoMo
      console.log("Sending...");
      console.log('Request Body:', requestBody);
      const response = await axios.post(this.endpoint, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(`Status: ${response.status}`);
      console.log("Response Body:", response.data);

      // Trả về kết quả cho client
      res.status(200).json({
        success: true,
        data: response.data,
      });
    } catch (error: any) {
      console.error("Error creating MoMo payment:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to create payment",
        error: error.message,
      });
    }
  }
}

export default new MoMoPaymentController();
