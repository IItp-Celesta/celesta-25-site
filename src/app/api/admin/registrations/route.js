import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";

export async function GET(request) {
  // BASIC SECURITY: Require an admin token in the headers
  const authHeader = request.headers.get("authorization");

  // Set this password in your .env.local file: ADMIN_SECRET=super_secret_password_123
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await adminFirestore
      .collection("workshop_registrations")
      .orderBy("registrationTime", "desc")
      .get();

    const registrations = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}