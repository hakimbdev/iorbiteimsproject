import { NextResponse } from "next/server"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

export async function POST(req: Request) {
  const { plan, email, companyName } = await req.json()

  let amount
  switch (plan) {
    case "monthly":
      amount = 9900 // $99 in cents
      break
    case "yearly":
      amount = 89900 // $899 in cents
      break
    case "enterprise":
      amount = 1000000 // $10,000 in cents (example price)
      break
    default:
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  try {
    console.log("Initializing Paystack transaction with:", { email, amount, companyName, plan })

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        metadata: {
          company_name: companyName,
          plan,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Paystack API error:", response.status, errorData)
      return NextResponse.json(
        { error: `Paystack API error: ${response.status} ${errorData}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    if (data.status) {
      console.log("Paystack transaction initialized successfully:", data)
      return NextResponse.json({ authorization_url: data.data.authorization_url })
    } else {
      console.error("Failed to initialize Paystack transaction:", data)
      return NextResponse.json({ error: "Failed to initialize transaction", details: data }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in create-payment route:", error)
    return NextResponse.json({ error: "An error occurred", details: error.message }, { status: 500 })
  }
}

