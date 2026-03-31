import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as sgMail from "@sendgrid/mail";
import * as corsLib from "cors";

// Initialize CORS with options to allow all origins in this setup.
// In true production, origin should be strictly allowed to cadafilms.com
const cors = corsLib({ origin: true });

export const submitContactForm = onRequest({ region: "us-east1" }, (req, res) => {
    // Wrap the request handler in CORS middleware
    cors(req, res, async () => {
        // Enforce POST method
        if (req.method !== "POST") {
            res.status(405).send({ error: "Method Not Allowed" });
            return;
        }

        try {
            const { name, email, message } = req.body;

            // Basic validation
            if (!name || !email || !message) {
                res.status(400).send({ error: "Missing required fields." });
                return;
            }

            // Ensure SendGrid API Key exists
            const apiKey = process.env.SENDGRID_API_KEY;
            if (!apiKey) {
                logger.error("SENDGRID_API_KEY is missing from environment.");
                res.status(500).send({ error: "Server Configuration Error" });
                return;
            }

            sgMail.setApiKey(apiKey);

            // Construct the email payload
            const msg = {
                to: "info@cadafilms.com",
                from: "info@cadafilms.com", // Must be verified in SendGrid
                subject: `New Contact Request from ${name}`,
                text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                html: `<p><strong>Name:</strong> ${name}</p>
                       <p><strong>Email:</strong> ${email}</p>
                       <p><strong>Message:</strong></p>
                       <p>${message.replace(/\n/g, "<br>")}</p>`,
            };

            // Send the email
            await sgMail.send(msg);

            logger.info("Contact email sent successfully", { from: email });
            res.status(200).send({ success: true, message: "Email dispatched successfully" });
        } catch (error) {
            logger.error("Error sending contact email", { error });
            res.status(500).send({ error: "Internal Server Error" });
        }
    });
});
