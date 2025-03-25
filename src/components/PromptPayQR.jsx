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
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center p-6">
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
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-4 py-3 rounded-xl w-full font-semibold shadow-md transform hover:scale-105 transition duration-300"
          >
            สร้าง QR
          </button>
        </div>

        {qrCodeUrl && (
          <div className="mt-8 text-center animate-fade-in">
            <img
              src={qrCodeUrl}
              alt="PromptPay QR Code"
              className="mx-auto w-64 h-64 shadow-xl rounded-2xl border border-blue-300"
            />
            <p className="text-sm text-gray-700 mt-2">
              สแกนด้วยแอปธนาคารเพื่อชำระเงิน
            </p>
          </div>
        )}

        {payloadLog && (
          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 text-xs font-mono text-gray-800 break-words">
            <strong>📦 QR Payload:</strong>
            <div className="mt-1">{payloadLog}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PromptPayQR;
