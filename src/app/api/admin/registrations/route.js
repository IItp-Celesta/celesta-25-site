import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";

export async function GET() {
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