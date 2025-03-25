import React, { useState } from "react";
import QRCode from "qrcode";

function PromptPayQR() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [payloadLog, setPayloadLog] = useState("");

  const generatePayload = (mobile, amount) => {
    const formatID = (mobile) => {
      if (mobile.startsWith("0")) {
        return "0066" + mobile.substring(1);
      }
      return mobile;
    };

    const id = formatID(mobile);
    const amountFormatted = parseFloat(amount).toFixed(2);
    const amountField =
      "54" +
      amountFormatted.length.toString().padStart(2, "0") +
      amountFormatted;

    const payloadParts = [
      "000201",
      "010211",
      "29370016A0000006770101110113" + id,
      "5303764",
      amountField,
      "5802TH",
    ];

    let rawPayload = payloadParts.join("") + "6304";
    const crc = getCRC16(rawPayload);
    return rawPayload + crc;
  };

  const getCRC16 = (payload) => {
    let crc = 0xffff;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
      crc &= 0xffff;
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  };

  const handleGenerate = async () => {
    if (!phone || !amount || isNaN(parseFloat(amount))) {
      alert("กรุณากรอกเบอร์พร้อมเพย์และจำนวนเงินให้ถูกต้อง");
      return;
    }

    const payload = generatePayload(phone.trim(), amount.trim());
    setPayloadLog(payload);
    console.log("\uD83D\uDCE6 QR Payload:", payload);

    try {
      const url = await QRCode.toDataURL(payload);
      setQrCodeUrl(url);
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการสร้าง QR:", err);
      alert("เกิดข้อผิดพลาดในการสร้าง QR");
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-200 via-sky-300 to-blue-500 animate-gradient-x flex items-center justify-center p-6 overflow-hidden">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-lg border border-blue-100">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6 tracking-wide drop-shadow-sm">
          สร้าง QR พร้อมเพย์
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="เบอร์โทร เช่น 0621653986"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            type="number"
            className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="จำนวนเงิน เช่น 100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-4 py-3 rounded-xl w-full font-semibold shadow-lg transform hover:scale-105 transition duration-300"
          >
            สร้าง QR
          </button>
        </div>

        {qrCodeUrl && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white rounded-xl shadow-2xl w-80 overflow-hidden border border-gray-200">
              {/* แถบหัวบน */}
              <div className="bg-blue-900 p-2 flex items-center justify-center">
                <img
                  src="/thai-qr-logo.png"
                  alt="Thai QR Payment"
                  className="h-12"
                />
              </div>

              {/* โลโก้ PromptPay ด้านบน QR */}
              <div className="bg-white py-2 flex justify-center">
                <img
                  src="/promptpay-logo.png"
                  alt="PromptPay Logo"
                  className="h-8"
                />
              </div>

              {/* QR Code + Overlay Icon */}
              <div className="relative w-64 h-64 mx-auto my-4">
                <img src={qrCodeUrl} alt="QR" className="w-full h-full" />
                <img
                  src="/icon-pp.png"
                  alt="PromptPay Logo Center"
                  className="w-24 h-24 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 "
                />
              </div>

              {/* ข้อความด้านล่าง */}
              <p className="text-sm text-center text-gray-700 mb-4 px-4">
                สแกนด้วยแอปธนาคารเพื่อชำระเงิน
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PromptPayQR;
