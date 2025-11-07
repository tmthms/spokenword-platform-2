/**
 * Firebase Function: Email notificatie bij nieuwe aanbeveling
 *
 * Deze functie wordt getriggerd wanneer een nieuwe aanbeveling wordt aangemaakt
 * en stuurt een email notificatie naar de artiest.
 *
 * INSTALLATIE INSTRUCTIES:
 *
 * Voeg deze code toe aan je functions/index.js of functions/index.ts bestand
 *
 * OPTIE 1: Als je Firebase Extension "Trigger Email" gebruikt:
 * - Installeer de extension via Firebase Console
 * - Deze functie schrijft dan naar de mail collection
 *
 * OPTIE 2: Als je SendGrid/Mailgun/Nodemailer gebruikt:
 * - Installeer de benodigde packages
 * - Pas de sendEmail functie aan naar jouw email service
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialiseer Admin SDK (indien nog niet gedaan in index.js)
// if (!admin.apps.length) {
//   admin.initializeApp();
// }

/**
 * Trigger: wanneer een nieuwe aanbeveling wordt aangemaakt
 */
exports.onRecommendationCreated = functions.firestore
  .document('recommendations/{recommendationId}')
  .onCreate(async (snap, context) => {
    try {
      const recommendation = snap.data();
      const recommendationId = context.params.recommendationId;

      console.log('New recommendation created:', recommendationId);

      // Haal artiest data op
      const artistDoc = await admin.firestore()
        .collection('artists')
        .doc(recommendation.artistId)
        .get();

      if (!artistDoc.exists) {
        console.error('Artist not found:', recommendation.artistId);
        return null;
      }

      const artistData = artistDoc.data();
      const artistEmail = artistData.email;

      if (!artistEmail) {
        console.error('Artist email not found');
        return null;
      }

      // Haal programmer data op voor extra informatie
      const programmerDoc = await admin.firestore()
        .collection('programmers')
        .doc(recommendation.programmerId)
        .get();

      const programmerData = programmerDoc.exists ? programmerDoc.data() : {};

      // Email inhoud
      const emailSubject = `🌟 Nieuwe aanbeveling ontvangen!`;
      const emailBody = `
        <h2>Hallo ${artistData.firstName || artistData.stageName},</h2>

        <p>Geweldig nieuws! Je hebt een nieuwe aanbeveling ontvangen van <strong>${recommendation.programmerName}</strong>
        ${recommendation.programmerOrganization ? ` (${recommendation.programmerOrganization})` : ''}.</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-left: 4px solid #6366f1; margin: 20px 0;">
          <p style="font-style: italic; color: #374151; margin: 0;">
            "${recommendation.text}"
          </p>
        </div>

        <p>Je kunt al je aanbevelingen bekijken op je profiel in het SpokenWord Platform.</p>

        <p style="margin-top: 30px;">
          <a href="${functions.config().app?.url || 'https://your-app-url.com'}/dashboard"
             style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Bekijk je Profiel
          </a>
        </p>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Met vriendelijke groet,<br>
          Het SpokenWord Team
        </p>
      `;

      // OPTIE 1: Firebase Trigger Email Extension
      // Als je de Firebase Extension "Trigger Email" gebruikt:
      await admin.firestore().collection('mail').add({
        to: artistEmail,
        message: {
          subject: emailSubject,
          html: emailBody,
        },
      });

      console.log('Email queued for:', artistEmail);

      // OPTIE 2: SendGrid (als je SendGrid gebruikt)
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(functions.config().sendgrid.key);
      // await sgMail.send({
      //   to: artistEmail,
      //   from: 'noreply@spokenword.com',
      //   subject: emailSubject,
      //   html: emailBody,
      // });

      // OPTIE 3: Nodemailer (als je Nodemailer gebruikt)
      // const nodemailer = require('nodemailer');
      // const transporter = nodemailer.createTransporter({
      //   service: 'gmail',
      //   auth: {
      //     user: functions.config().email.user,
      //     pass: functions.config().email.password
      //   }
      // });
      // await transporter.sendMail({
      //   from: 'SpokenWord <noreply@spokenword.com>',
      //   to: artistEmail,
      //   subject: emailSubject,
      //   html: emailBody
      // });

      return null;

    } catch (error) {
      console.error('Error sending recommendation email:', error);
      return null;
    }
  });

/**
 * DEPLOYMENT INSTRUCTIES:
 *
 * 1. Voeg deze export toe aan je functions/index.js:
 *    exports.onRecommendationCreated = require('./onRecommendationCreated').onRecommendationCreated;
 *
 * 2. Of kopieer de functie direct in je index.js
 *
 * 3. Deploy met: firebase deploy --only functions:onRecommendationCreated
 *
 * 4. Test de functie door een recommendation aan te maken in Firestore
 *
 * 5. Check de logs met: firebase functions:log
 */

// Voor Firebase Extension "Trigger Email":
// - Installeer via Firebase Console > Extensions
// - Zoek naar "Trigger Email"
// - Configureer met je SMTP gegevens
// - De mail collection wordt automatisch gemonitord
