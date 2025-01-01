// src/app/api/registration/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Create a database connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || "mozillafirefoxvitb.com",
  user: process.env.DB_USER || "fqokfnyd_qe",
  password: process.env.DB_PASSWORD || "@5huNTztW8XJ7uu",
  database: process.env.DB_NAME || "fqokfnyd_event",
});

// Define POST handler
export async function POST(req: NextRequest) {
  try {
    const { registrationNumber } = await req.json();

    // Validate input
    if (!registrationNumber) {
      return NextResponse.json(
        { message: "Registration number is required" },
        { status: 400 }
      );
    }

    // Query to verify the registration number and status
    const [rows]: any[] = await db.query(
      'SELECT * FROM attendence WHERE reg = ? AND status = "active"',
      [registrationNumber]
    );

    // Check if rows is an array and has records
    if (Array.isArray(rows) && rows.length > 0) {
      // Update the attendance to "present"
      await db.query(
        'UPDATE attendence SET attendence = "present" WHERE reg = ?',
        [registrationNumber]
      );

      return NextResponse.json({
        exists: true,
        message: "Attendance marked as present for the registration number",
      });
    } else {
      return NextResponse.json(
        {
          exists: false,
          message: "Registration number not found or inactive",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
