import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { code } = await request.json();
    const cleanCode = (code || "").trim().toUpperCase();

    const VALID_COUPONS = {
      [process.env.COUPON_799]: 799,
      [process.env.COUPON_899]: 899,
    };

    if (VALID_COUPONS[cleanCode]) {
      return NextResponse.json({ valid: true, price: VALID_COUPONS[cleanCode] });
    }
    
    return NextResponse.json({ valid: false });
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}