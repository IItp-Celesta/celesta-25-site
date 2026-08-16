import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file, customFilename) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: "workshop_receipts", 
        public_id: customFilename,
        // Added for security best practices regarding sensitive IDs and receipts
        access_mode: "authenticated", 
        type: "private" 
      },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get("name");
    const email = formData.get("email");
    const gender = formData.get("gender");

    if (!name || !email || !gender) {
      return NextResponse.json(
        { success: false, message: "Missing data." },
        { status: 400 },
      );
    }

    const amountPaid = Number(formData.get("amountPaid")) || 0;
    const isExternal = formData.get("isIITP") === "no";
    const requireAccommodation = formData.get("requireAccommodation") === "yes";
    
    const workshopFile = formData.get("workshopScreenshot");
    const accommodationFile = formData.get("accommodationScreenshot");
    const aadhaarFile = formData.get("aadhaarScreenshot");

    if (!workshopFile || workshopFile === "null") {
      return NextResponse.json({ success: false, message: "Missing workshop payment screenshot." }, { status: 400 });
    }
    const workshopScreenshotUrl = await uploadToCloudinary(workshopFile, `ws_receipt_${name.replace(/\s+/g, '_')}_${Date.now()}`);

    let accommodationScreenshotUrl = "NOT_REQUIRED";
    if (requireAccommodation) {
      if (!accommodationFile || accommodationFile === "null") {
        return NextResponse.json({ success: false, message: "Missing accommodation payment screenshot." }, { status: 400 });
      }
      accommodationScreenshotUrl = await uploadToCloudinary(accommodationFile, `accom_receipt_${name.replace(/\s+/g, '_')}_${Date.now()}`);
    }

    let aadhaarUrl = "NOT_REQUIRED";
    if (isExternal) {
      if (!aadhaarFile || aadhaarFile === "null") {
        return NextResponse.json({ success: false, message: "Missing Aadhaar card screenshot." }, { status: 400 });
      }
      aadhaarUrl = await uploadToCloudinary(aadhaarFile, `aadhaar_${name.replace(/\s+/g, '_')}_${Date.now()}`);
    }

    const registrationTime = formData.get("registrationTime");
    const rawDate = registrationTime ? new Date(registrationTime) : new Date();
    
    const cleanTime = rawDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const registrationId = `WS2026-${Math.floor(
      10000 + Math.random() * 90000,
    )}`;

    await adminFirestore
      .collection("workshop_registrations")
      .doc(registrationId)
      .set({
        registrationId,
        name,
        gender,
        email,
        phone: formData.get("phone") || "",
        college: formData.get("college") || "",
        cityState: formData.get("cityState") || "",
        rollNumber: formData.get("rollNumber") || "",
        workshop: formData.get("workshop") || "",
        isIITP: !isExternal,
        requireAccommodation,
        amountPaid: amountPaid,
        upiId: formData.get("upiId") || "",
        workshopScreenshotUrl, 
        accommodationScreenshotUrl, 
        aadhaarUrl,
        registrationTime: cleanTime,
      });

    return NextResponse.json({ success: true, registrationId });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while saving." },
      { status: 500 },
    );
  }
}