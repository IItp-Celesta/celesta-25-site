"use client";
import { useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { CheckCircle2, Upload, ArrowLeft } from "lucide-react";

export default function PaymentSimulator({
  finalAmount,
  onPaymentSuccess,
  formData = {},
  feeSummary = {},
  onBack,
}) {
  const isExternal = formData.isIITP === "no";
  const requireAccommodation = formData.requireAccommodation === "yes";

  const [upiId, setUpiId] = useState("");

  const [workshopScreenshotFile, setWorkshopScreenshotFile] = useState(null);
  const [accommodationScreenshotFile, setAccommodationScreenshotFile] =
    useState(null);
  const [aadhaarFile, setAadhaarFile] = useState(null);

  const [previews, setPreviews] = useState({
    workshop: "",
    accommodation: "",
    aadhaar: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    upi: "",
    workshop: "",
    accommodation: "",
    aadhaar: "",
  });

  const handleFileChange = async (e, type) => {
    let file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, [type]: "Only images are allowed." }));
      return;
    }
    setErrors((prev) => ({ ...prev, [type]: "" }));

    const options = {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      const objectUrl = URL.createObjectURL(compressedFile);

      if (type === "workshop") {
        setWorkshopScreenshotFile(compressedFile);
        setPreviews((prev) => ({ ...prev, workshop: objectUrl }));
      } else if (type === "accommodation") {
        setAccommodationScreenshotFile(compressedFile);
        setPreviews((prev) => ({ ...prev, accommodation: objectUrl }));
      } else {
        setAadhaarFile(compressedFile);
        setPreviews((prev) => ({ ...prev, aadhaar: objectUrl }));
      }
    } catch (error) {
      console.error("Error processing image:", error);
      setErrors((prev) => ({
        ...prev,
        [type]: "Error processing image. Try again.",
      }));
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = { upi: "", workshop: "", accommodation: "", aadhaar: "" };

    // UPI is only needed if there's a local payment due (Accommodation)
    if (finalAmount > 0 && !upiId.trim()) {
      newErrors.upi = "Please enter your UPI ID.";
      valid = false;
    }
    if (!workshopScreenshotFile) {
      newErrors.workshop = "Workshop portal fee screenshot is mandatory.";
      valid = false;
    }

    if (requireAccommodation && !accommodationScreenshotFile) {
      newErrors.accommodation = "Accommodation payment screenshot is required.";
      valid = false;
    }

    if (isExternal && !aadhaarFile) {
      newErrors.aadhaar = "Aadhaar card screenshot is mandatory for externals.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          submitData.append(key, value);
        }
      });

      submitData.append("id", crypto.randomUUID());
      submitData.append("amountPaid", feeSummary?.finalAmount || finalAmount);
      submitData.append("upiId", upiId);
      submitData.append("registrationTime", new Date().toISOString());

      if (workshopScreenshotFile)
        submitData.append("workshopScreenshot", workshopScreenshotFile);
      if (accommodationScreenshotFile)
        submitData.append(
          "accommodationScreenshot",
          accommodationScreenshotFile,
        );
      if (aadhaarFile) submitData.append("aadhaarScreenshot", aadhaarFile);

      const response = await fetch("/api/register-workshop", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();
      if (result.success) {
        onPaymentSuccess(result.registrationId);
      } else {
        alert(result.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment Submission Error:", error);
      alert("A server error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center w-full">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-sm disabled:opacity-50"
        >
          <ArrowLeft size={18} /> Edit Registration Details
        </button>
      </div>
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Please upload the necessary documents to secure your spot.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Render QR block ONLY if there is an accommodation fee to pay right now */}
        {finalAmount > 0 && (
          <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center shadow-xl">
            <h3 className="text-lg font-semibold mb-6 text-white uppercase tracking-wider">
              Scan & Pay (Accommodation)
            </h3>
            <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.3)] mb-6">
              <Image
                src="/payment/qr.jpeg"
                alt="QR Code"
                width={240}
                height={240}
                className="rounded-xl object-cover"
              />
            </div>
            <p className="text-gray-400 mb-4 text-sm font-medium">
              Scan using any UPI App
            </p>
          </div>
        )}

        <div className="flex-[1.5] bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col gap-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3 uppercase tracking-wider">
            Verification & Payment Details
          </h3>

          <div className="flex justify-between items-center bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/30 shadow-inner">
            <div>
              <h4 className="font-semibold text-white">
                Campus Accommodation Fee
              </h4>
              <p className="text-sm text-cyan-200/70">
                Amount payable right now
              </p>
            </div>
            <strong className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              ₹ {finalAmount}
            </strong>
          </div>

          {finalAmount > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300 font-medium">
                Your UPI ID (used for accommodation payment) *
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className={`w-full bg-black/40 border ${
                  errors.upi ? "border-red-500/50" : "border-white/10"
                } rounded-xl p-3.5 text-white outline-none`}
              />
              {errors.upi && (
                <p className="text-red-400 text-xs mt-1">{errors.upi}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
            <label className="text-sm text-gray-300 font-medium">
              Upload Workshop Portal Payment Screenshot *
            </label>
            <label
              className={`border-2 border-dashed ${
                errors.workshop
                  ? "border-red-500/50"
                  : "border-white/20 hover:border-cyan-400"
              } rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3`}
            >
              {workshopScreenshotFile ? (
                <CheckCircle2 size={32} className="text-green-400" />
              ) : (
                <Upload size={32} className="text-cyan-400" />
              )}
              <div className="font-medium text-gray-200">
                {workshopScreenshotFile
                  ? "Workshop Screenshot Attached"
                  : "Upload Portal Receipt"}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => handleFileChange(e, "workshop")}
                hidden
              />
            </label>
            {errors.workshop && (
              <p className="text-red-400 text-xs mt-1">{errors.workshop}</p>
            )}
            {previews.workshop && (
              <img
                src={previews.workshop}
                alt="Preview"
                className="w-32 mt-2 rounded-lg object-contain"
              />
            )}
          </div>

          {/* ACCOMMODATION SCREENSHOT (CONDITIONAL) */}
          {requireAccommodation && (
            <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
              <label className="text-sm text-gray-300 font-medium">
                Upload Accommodation UPI Payment Screenshot *
              </label>
              <label
                className={`border-2 border-dashed ${
                  errors.accommodation
                    ? "border-red-500/50"
                    : "border-white/20 hover:border-cyan-400"
                } rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3`}
              >
                {accommodationScreenshotFile ? (
                  <CheckCircle2 size={32} className="text-green-400" />
                ) : (
                  <Upload size={32} className="text-cyan-400" />
                )}
                <div className="font-medium text-gray-200">
                  {accommodationScreenshotFile
                    ? "Accommodation Screenshot Attached"
                    : "Upload QR Receipt"}
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => handleFileChange(e, "accommodation")}
                  hidden
                />
              </label>
              {errors.accommodation && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.accommodation}
                </p>
              )}
              {previews.accommodation && (
                <img
                  src={previews.accommodation}
                  alt="Preview"
                  className="w-32 mt-2 rounded-lg object-contain"
                />
              )}
            </div>
          )}

          {/* AADHAAR SCREENSHOT (CONDITIONAL) */}
          {isExternal && (
            <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
              <label className="text-sm text-gray-300 font-medium">
                Upload Aadhaar Card Screenshot (Mandatory for Externals) *
              </label>
              <label
                className={`border-2 border-dashed ${
                  errors.aadhaar
                    ? "border-red-500/50"
                    : "border-white/20 hover:border-cyan-400"
                } rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3`}
              >
                {aadhaarFile ? (
                  <CheckCircle2 size={32} className="text-green-400" />
                ) : (
                  <Upload size={32} className="text-cyan-400" />
                )}
                <div className="font-medium text-gray-200">
                  {aadhaarFile ? "Aadhaar Attached" : "Upload Aadhaar Image"}
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => handleFileChange(e, "aadhaar")}
                  hidden
                />
              </label>
              {errors.aadhaar && (
                <p className="text-red-400 text-xs mt-1">{errors.aadhaar}</p>
              )}
              {previews.aadhaar && (
                <img
                  src={previews.aadhaar}
                  alt="Preview"
                  className="w-32 mt-2 rounded-lg object-contain"
                />
              )}
            </div>
          )}

          <button
            disabled={loading}
            onClick={handleSubmit}
            className={`mt-2 w-full py-4 rounded-xl font-bold uppercase tracking-widest text-white transition-all duration-300 flex items-center justify-center gap-3 ${
              loading
                ? "bg-gray-800 border border-white/10 cursor-not-allowed text-gray-400"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:-translate-y-1"
            }`}
          >
            {loading ? "Processing..." : "Submit For Verification"}
          </button>
        </div>
      </div>
    </div>
  );
}