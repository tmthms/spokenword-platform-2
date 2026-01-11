/**
 * Cloud Functions for Spoken Word Database
 *
 * This file contains three functions:
 * 1. onProgrammerSignup: Emails the admin when a new programmer signs up.
 * 2. approveProgrammer: An HTTPS function (a "webhook") that the admin clicks to approve a programmer.
 * 3. onProgrammerApproved: Emails the programmer *after* their account is approved.
 */

// Import all necessary modules
// We specificeren de regio "europe-west4" voor alle functies
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const fetch = require('node-fetch');

// Initialize the Firebase Admin SDK
initializeApp();

// --- CONFIGURATION ---
// VERVANG DIT MET UW EIGEN E-MAILADRES
const ADMIN_EMAIL = "timthomaes@gmail.com";
// ---------------------


/**
 * ROBOT 1: NOTIFY ADMIN ON SIGNUP
 * Triggers when a new document is created in the 'programmers' collection.
 * Sends an email to the admin with an approval link.
 */
exports.onProgrammerSignup = onDocumentCreated({
  document: "programmers/{programmerId}",
  region: "europe-west4"
}, async (event) => {
  const data = event.data.data();
  const programmerId = event.params.programmerId;

  console.log(`New programmer signed up: ${data.email}. Sending admin notification.`);

  // Make sure all data is present
  if (!data.email || !data.firstName || !data.organizationName) {
    console.error("Missing data in new programmer document. Cannot send admin email.");
    return null;
  }

  // Create the email document in the 'mail' collection for the ADMIN
  try {
    await getFirestore().collection("mail").add({
      to: [ADMIN_EMAIL],
      template: {
        name: "admin-approval-request", // This MUST match your template ID
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          organizationName: data.organizationName,
          email: data.email,
          programmerId: programmerId, // We pass this so the template can build the link
        },
      },
    });
    console.log("Admin notification email created successfully.");
    return null;
  } catch (error) {
    console.error("Error creating admin mail document:", error);
    return null;
  }
});


/**
 * ROBOT 2: APPROVE PROGRAMMER VIA HTTPS LINK
 * Triggers when the admin clicks the "Approve" link in their email.
 * This is a public-facing URL.
 */
exports.approveProgrammer = onRequest({ region: "europe-west4" }, async (req, res) => {
  // 1. Get the programmer's ID from the URL (e.g., ?id=XXXXX)
  const programmerId = req.query.id;

  if (!programmerId) {
    console.error("No programmer ID provided in request.");
    res.status(400).send("Error: No ID provided. Please check the link.");
    return;
  }

  console.log(`Approval request received for programmer: ${programmerId}`);

  try {
    // 2. Create references to BOTH documents that need to be updated.
    const programmerRef = getFirestore().collection("programmers").doc(programmerId);
    const userRef = getFirestore().collection("users").doc(programmerId); // <-- DE BUGFIX

    const doc = await programmerRef.get();

    if (!doc.exists) {
      console.error("Programmer document not found.");
      res.status(404).send("Error: This programmer account was not found. It may have been deleted.");
      return;
    }
    
    // Check if already approved
    if (doc.data().status === "trial") {
        console.log("Programmer was already approved.");
        res.status(200).send("This programmer has already been approved. No action was taken.");
        return;
    }

    // 3. --- DE BUGFIX ---
    // Gebruik een "batch" om BEIDE documenten tegelijk bij te werken.
    const batch = getFirestore().batch();
    
    // Update de status in 'programmers'
    batch.update(programmerRef, { status: "trial" });
    
    // Update de status in 'users' (dit was de ontbrekende stap)
    batch.update(userRef, { status: "trial" });

    // Voer beide updates tegelijk uit
    await batch.commit();

    // 4. Send a "Success" message back to the admin's browser
    console.log(`Successfully approved programmer: ${programmerId}`);
    res.status(200).send(
      `<html>
        <head>
          <style>body { font-family: sans-serif; text-align: center; padding-top: 50px; background-color: #f0f9f0; color: #333; } h1 { color: #28a745; }</style>
        </head>
        <body>
          <h1>Success!</h1>
          <p>The programmer account has been approved and moved to 'trial' status.</p>
          <p>Both the 'programmers' and 'users' collections have been updated.</p>
          <p>They will now receive their welcome email automatically.</p>
        </body>
      </html>`
    );

  } catch (error) {
    console.error(`Failed to approve programmer ${programmerId}:`, error);
    res.status(500).send("An internal error occurred. Please check the function logs.");
  }
});


/**
 * ROBOT 3: NOTIFY PROGRAMMER ON APPROVAL (Your existing function)
 * Listens for updates on any document in the 'programmers' collection.
 * If a programmer's status is changed from 'pending' to 'trial',
 * it automatically creates a new email document in the 'mail' collection.
 */
exports.onProgrammerApproved = onDocumentUpdated({
  document: "programmers/{programmerId}",
  region: "europe-west4"
}, async (event) => {
  // Get the data from before and after the change
  const dataBefore = event.data.before.data();
  const dataAfter = event.data.after.data();

  // Check if the status was changed from 'pending' to 'trial'
  if (dataBefore.status === "pending" && dataAfter.status === "trial") {
    console.log(`Programmer ${event.params.programmerId} approved. Sending email to programmer...`);

    // Get the user's details from the updated document
    const email = dataAfter.email;
    const firstName = dataAfter.firstName;
    const organizationName = dataAfter.organizationName;

    // Make sure all data is present before sending
    if (!email || !firstName || !organizationName) {
      console.error("Missing user data (email, firstName, or organizationName). Cannot send email.");
      return null;
    }

    // Create the email document in the 'mail' collection
    try {
      await getFirestore().collection("mail").add({
        to: [email],
        template: {
          name: "programmer-approved", // This MUST match your programmer-facing template ID
          data: {
            firstName: firstName,
            organizationName: organizationName,
          },
        },
      });
      console.log("Programmer welcome email created successfully.");
      return null;
    } catch (error) {
      console.error("Error creating programmer mail document:", error);
      return null;
    }
  }

  // If the status wasn't changed from pending to trial, do nothing.
  return null;
});


/**
 * ROBOT 4: NOTIFY ARTIST ON NEW RECOMMENDATION
 * Triggers when a programmer writes a recommendation for an artist.
 * Sends an email notification to the artist.
 */
exports.onRecommendationCreated = onDocumentCreated({
  document: "recommendations/{recommendationId}",
  region: "europe-west4"
}, async (event) => {
  const recommendation = event.data.data();
  const recommendationId = event.params.recommendationId;

  console.log(`New recommendation created for artist ${recommendation.artistId}. Sending email notification.`);

  try {
    // Fetch artist data
    const artistRef = getFirestore().collection("artists").doc(recommendation.artistId);
    const artistSnap = await artistRef.get();

    if (!artistSnap.exists) {
      console.error("Artist document not found.");
      return null;
    }

    const artistData = artistSnap.data();
    const artistEmail = artistData.email;
    const artistName = artistData.stageName || `${artistData.firstName} ${artistData.lastName}`;

    if (!artistEmail) {
      console.error("Artist email not found. Cannot send notification.");
      return null;
    }

    // Build the inline HTML email template
    const emailHtml = `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nieuwe Aanbeveling Ontvangen</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">🌟 Nieuwe Aanbeveling Ontvangen!</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
            <p style="margin: 0 0 15px 0;">Hallo <strong>${artistName}</strong>,</p>

            <p style="margin: 0 0 20px 0;">Goed nieuws! Je hebt een nieuwe aanbeveling ontvangen van <strong>${recommendation.programmerName}</strong>${recommendation.programmerOrganization ? ` (${recommendation.programmerOrganization})` : ''}.</p>

            <div style="background-color: #ffffff; border: 2px solid #6366f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-style: italic; color: #555; font-size: 16px;">
                    "${recommendation.text}"
                </p>
            </div>

            <div style="text-align: center; margin: 25px 0;">
                <a href="https://community.dansdichterdans.be" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600;">
                    Bekijk Je Profiel →
                </a>
            </div>

            <div style="height: 1px; background-color: #e9ecef; margin: 20px 0;"></div>

            <p style="color: #6c757d; font-size: 14px; margin: 15px 0 0 0;">
                <strong>Tip:</strong> Aanbevelingen zijn zichtbaar op je profiel voor alle programmeurs. Ze helpen je om meer boekingen te krijgen!
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #6c757d; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">Je ontvangt deze email omdat je een profiel hebt op SpokenWord DB.</p>
            <p style="margin: 0;">
                <a href="https://community.dansdichterdans.be" style="color: #6366f1; text-decoration: none;">Bezoek SpokenWord DB</a>
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">
                © 2024 SpokenWord Database. Alle rechten voorbehouden.
            </p>
        </div>
    </div>
</body>
</html>
    `;

    // Send email via Firebase Extension
    await getFirestore().collection("mail").add({
      to: [artistEmail],
      message: {
        subject: `🌟 Nieuwe aanbeveling van ${recommendation.programmerName}`,
        html: emailHtml,
      },
    });

    console.log(`Email notification sent to ${artistEmail} for new recommendation`);
    return null;

  } catch (error) {
    console.error("Error sending recommendation notification:", error);
    return null;
  }
});


/**
 * ROBOT 5: NOTIFY USER ON NEW MESSAGE (FASE 4)
 * Triggers when a new message is created in any conversation.
 * Sends an email notification to the recipient.
 * SMTP VERSION: Uses inline HTML template (geen external template nodig)
 */
exports.onNewMessage = onDocumentCreated({
  document: "conversations/{conversationId}/messages/{messageId}",
  region: "europe-west4"
}, async (event) => {
  const messageData = event.data.data();
  const conversationId = event.params.conversationId;
  const messageId = event.params.messageId;

  console.log(`New message in conversation ${conversationId}. Preparing email notification.`);

  // Get the conversation document to find the recipient
  try {
    const conversationRef = getFirestore().collection("conversations").doc(conversationId);
    const conversationSnap = await conversationRef.get();

    if (!conversationSnap.exists) {
      console.error("Conversation document not found.");
      return null;
    }

    const conversationData = conversationSnap.data();

    // Determine who the recipient is (not the sender)
    const senderId = messageData.senderId;
    const recipientId = conversationData.participants.find(id => id !== senderId);

    if (!recipientId) {
      console.error("Could not determine recipient.");
      return null;
    }

    // Get recipient details
    const recipientEmail = conversationData.participantEmails[recipientId];
    const recipientName = conversationData.participantNames[recipientId];
    const senderName = messageData.senderName;
    const subject = conversationData.subject || "No subject";
    
    // Create message preview (first 100 characters)
    const messagePreview = messageData.text.length > 100 
      ? messageData.text.substring(0, 100) + "..." 
      : messageData.text;

    // Validate required data
    if (!recipientEmail || !recipientName || !senderName) {
      console.error("Missing required email data. Cannot send notification.");
      return null;
    }

    // Create conversation link
    const conversationLink = `https://community.dansdichterdans.be`;

    // Build the inline HTML email template
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Message Notification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">💬 New Message Received</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
            <p style="margin: 0 0 15px 0;">Hello <strong>${recipientName}</strong>,</p>
            
            <p style="margin: 0 0 20px 0;">You have received a new message from <strong>${senderName}</strong>.</p>

            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 10px 0; color: #667eea; font-size: 16px;">📋 Subject</h3>
                <p style="margin: 0;">${subject}</p>
            </div>

            <div style="background-color: #ffffff; border: 1px solid #e9ecef; padding: 15px; border-radius: 4px; margin: 15px 0; font-style: italic; color: #555;">
                <strong>Message Preview:</strong><br>
                "${messagePreview}"
            </div>

            <div style="text-align: center; margin: 25px 0;">
                <a href="${conversationLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600;">
                    View Full Conversation →
                </a>
            </div>

            <div style="height: 1px; background-color: #e9ecef; margin: 20px 0;"></div>

            <p style="color: #6c757d; font-size: 14px; margin: 15px 0 0 0;">
                <strong>Quick tip:</strong> Reply directly from your messages dashboard to continue the conversation.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #6c757d; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">You're receiving this email because you have an active conversation on SpokenWord DB.</p>
            <p style="margin: 0;">
                <a href="https://community.dansdichterdans.be" style="color: #667eea; text-decoration: none;">Visit SpokenWord DB</a>
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">
                © 2024 SpokenWord Database. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;

    // Create the email document in the 'mail' collection (SMTP version)
    await getFirestore().collection("mail").add({
      to: [recipientEmail],
      message: {
        subject: `New message from ${senderName} - ${subject}`,
        html: emailHtml,
      },
    });

    console.log(`Email notification sent to ${recipientEmail} for new message from ${senderName}`);
    return null;

  } catch (error) {
    console.error("Error sending message notification:", error);
    return null;
  }
});


/**
 * UiT API Proxy - omzeilt CORS voor browser requests
 */
exports.searchUitEvents = onRequest(
  {
    region: "europe-west1",
    cors: true,
    secrets: ["UIT_API_KEY"]
  },
  async (req, res) => {
    const apiKey = process.env.UIT_API_KEY;

    if (!apiKey) {
      res.status(500).json({ error: "UIT_API_KEY not configured" });
      return;
    }

    const { q, labels, limit = "20" } = req.query;

    // TEST endpoint
    const baseUrl = "https://search-test.uitdatabank.be";
    const url = new URL(`${baseUrl}/events/`);

    url.searchParams.set("embed", "true");
    url.searchParams.set("limit", limit);
    url.searchParams.set("dateFrom", new Date().toISOString());

    if (q) url.searchParams.set("q", q);

    if (labels) {
      labels.split(",").forEach(label => {
        url.searchParams.append("labels[]", label.trim());
      });
    }

    console.log("[UIT-PROXY] Fetching:", url.toString());

    try {
      const response = await fetch(url.toString(), {
        headers: {
          "X-Api-Key": apiKey,
          "Accept": "application/ld+json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[UIT-PROXY] API Error:", response.status, errorText);
        res.status(response.status).json({ error: errorText });
        return;
      }

      const data = await response.json();
      res.json(data);

    } catch (error) {
      console.error("[UIT-PROXY] Error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);