import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";

const csvEscape = (value) => {
  if (value === null || value === undefined) return '""';
  return `"${String(value)
    .replace(/\r?\n|\r/g, " ")
    .replace(/"/g, '""')}"`;
};

const isAccommodationRequired = (row) => {
  return (
    row.requireAccommodation === true ||
    String(row.requireAccommodation || "").toLowerCase() === "yes"
  );
};

const parseDate = (value) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const makeCsvRow = (values) => values.map(csvEscape).join(",");

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get("type") || "all";

    const allowedTypes = ["all", "reg", "accom"];
    if (!allowedTypes.includes(exportType)) {
      return NextResponse.json(
        {
          error: `Invalid export type. Use one of: ${allowedTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const snapshot = await adminFirestore
      .collection("workshop_registrations")
      .get();

    if (snapshot.empty) {
      return new NextResponse("", {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${exportType}_export.csv"`,
        },
      });
    }

    let data = [];

    snapshot.forEach((doc) => {
      const row = {
        id: doc.id,
        ...doc.data(),
      };

      const isLegacy = row.workshopFee === undefined;

      if (isLegacy) {
        row.accommodationScreenshotUrl = row.screenshotUrl || "";
        
        row.workshopScreenshotUrl = "";

        row.accommodationFee = row.amountPaid || 0;

        row.workshopFee = "";

        row.accomTxnId = "";
        row.workshopTxnId = "";
        
        row.upiId = row.upiId || "";
      }

      if (!isLegacy) {
        const parsedFee = Number(row.workshopFee);
        row.workshopFee = isNaN(parsedFee) ? row.workshopFee : parsedFee || 0;
      }
      row.accommodationFee = Number(row.accommodationFee) || 0;

      if (row.amountPaid === undefined || row.amountPaid === null) {
        const safeWorkshopFee = typeof row.workshopFee === "number" ? row.workshopFee : 0;
        row.amountPaid = safeWorkshopFee + (Number(row.accommodationFee) || 0);
      } else {
        row.amountPaid = Number(row.amountPaid) || 0;
      }

      data.push(row);
    });

    // Newest first.
    data.sort(
      (a, b) =>
        parseDate(b.registrationTime) -
        parseDate(a.registrationTime),
    );

    let headers = [];
    const csvRows = [];

    if (exportType === "accom") {
      data = data.filter(isAccommodationRequired);
      headers = [
        "ID",
        "Time",
        "Name",
        "Gender",
        "Email",
        "Phone",
        "College",
        "Accom Fee Paid",
        "Sender UPI ID",
        "Accom Txn ID",
        "Accom Screenshot",
        "Aadhaar",
      ];
      csvRows.push(makeCsvRow(headers));

      for (const row of data) {
        csvRows.push(
          makeCsvRow([
            row.id,
            row.registrationTime || "",
            row.name || "",
            row.gender || "",
            row.email || "",
            row.phone || "",
            row.college || "",
            row.accommodationFee,
            row.upiId || "",
            row.accomTxnId || "",
            row.accommodationScreenshotUrl || "",
            row.aadhaarUrl || "",
          ]),
        );
      }
    }

    else if (exportType === "reg") {
      headers = [
        "ID",
        "Time",
        "Name",
        "Gender",
        "Email",
        "Phone",
        "College",
        "Track",
        "Is IITP",
        "Roll Number",
        "Reg Fee Paid",
        "Sender UPI ID",
        "Reg Txn ID",
        "Reg Screenshot",
      ];
      csvRows.push(makeCsvRow(headers));

      for (const row of data) {
        csvRows.push(
          makeCsvRow([
            row.id,
            row.registrationTime || "",
            row.name || "",
            row.gender || "",
            row.email || "",
            row.phone || "",
            row.college || "",
            row.workshop || "",
            row.isIITP ? "Yes" : "No",
            row.rollNumber || "",
            row.workshopFee,
            row.upiId || "",
            row.workshopTxnId || "",
            row.workshopScreenshotUrl || "",
          ]),
        );
      }
    }
    else {
      headers = [
        "ID",
        "Time",
        "Name",
        "Gender",
        "Email",
        "Phone",
        "College",
        "City/State",
        "Track",
        "Is IITP",
        "Roll Number",
        "Reg Fee",
        "Accom Fee",
        "Total Fee",
        "Sender UPI ID",
        "Reg Txn ID",
        "Accom Txn ID",
        "Reg Screenshot",
        "Accom Screenshot",
        "Aadhaar",
      ];
      csvRows.push(makeCsvRow(headers));

      for (const row of data) {
        csvRows.push(
          makeCsvRow([
            row.id,
            row.registrationTime || "",
            row.name || "",
            row.gender || "",
            row.email || "",
            row.phone || "",
            row.college || "",
            row.cityState || "",
            row.workshop || "",
            row.isIITP ? "Yes" : "No",
            row.rollNumber || "",
            row.workshopFee,
            row.accommodationFee,
            row.amountPaid,
            row.upiId || "",
            row.workshopTxnId || "",
            row.accomTxnId || "",
            row.workshopScreenshotUrl || "",
            row.accommodationScreenshotUrl || "",
            row.aadhaarUrl || "",
          ]),
        );
      }
    }

    const csv = csvRows.join("\r\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${exportType}_export.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("CSV export failed:", error);
    return NextResponse.json(
      {
        error: "Failed to export data",
        message:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      },
      { status: 500 },
    );
  }
}
