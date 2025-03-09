import { NextResponse } from "next/server"
import crypto from "crypto"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("x-paystack-signature")

  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(body).digest("hex")

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === "charge.success") {
    const { email, metadata } = event.data
    const { company_name, plan } = metadata

    // Here, you would typically:
    // 1. Create or update the company's subscription in your database
    // 2. Send a confirmation email to the company
    // 3. Log the successful payment

    console.log(`Successful subscription for ${company_name} (${email}) to ${plan} plan`)

    // For this example, we'll just log the information
    // In a real application, you'd update your database here

    return NextResponse.json({ received: true }, { status: 200 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

