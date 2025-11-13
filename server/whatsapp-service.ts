const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_URL = "https://superfast.akst.in/api/v1.0";

interface WhatsAppOTPParams {
  phoneNumber: string;
  otp: string;
}

export async function sendWhatsAppOTP({ phoneNumber, otp }: WhatsAppOTPParams): Promise<boolean> {
  if (!WHATSAPP_API_KEY || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp API credentials not configured');
  }

  const cleanPhone = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "template",
    template: {
      name: "otpforcustomer",
      language: {
        code: "en"
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: otp
            }
          ]
        },
        {
          type: "button",
          parameters: [
            {
              type: "text",
              text: otp
            }
          ],
          sub_type: "url",
          index: "0"
        }
      ]
    }
  };

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WhatsApp API error:', errorText);
      throw new Error(`Failed to send WhatsApp message: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('WhatsApp OTP sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp OTP:', error);
    throw error;
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
