const nodemailer = require('nodemailer');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

// Email configuration from environment variables
const config = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
};

// Create transporter
const transporter = nodemailer.createTransport(config);

// Function to replace placeholders in template with recipient data
function replacePlaceholders(template, data) {
  let result = template;

  // Replace all [Field Name] placeholders with corresponding CSV column values
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`\\[${key}\\]`, 'gi');
    result = result.replace(placeholder, value || '');
  }

  return result;
}

// Function to load email template
function loadTemplate(templatePath) {
  try {
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
  } catch (error) {
    console.error(`Warning: Could not load template from ${templatePath}`);
  }
  return null;
}

// Function to read CSV and send emails
async function sendBulkEmails(csvFilePath) {
  const recipients = [];

  // Load email templates if they exist
  const textTemplate = loadTemplate('./email-template.txt');
  const htmlTemplate = loadTemplate('./email-template.html');

  // Read CSV file
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        recipients.push(row);
      })
      .on('end', async () => {
        console.log(`Found ${recipients.length} recipients in CSV file`);

        if (textTemplate) {
          console.log('Using email-template.txt for email body');
        }
        if (htmlTemplate) {
          console.log('Using email-template.html for HTML email body');
        }

        console.log('Starting to send emails...\n');

        let successCount = 0;
        let failCount = 0;

        // Send emails one by one
        for (let i = 0; i < recipients.length; i++) {
          const recipient = recipients[i];

          try {
            // Determine subject
            let subject = recipient.subject || process.env.DEFAULT_SUBJECT || 'No Subject';
            subject = replacePlaceholders(subject, recipient);

            // Determine email body (text)
            let textBody;
            if (textTemplate) {
              textBody = replacePlaceholders(textTemplate, recipient);
            } else {
              textBody = recipient.message || process.env.DEFAULT_MESSAGE || '';
            }

            // Determine email body (HTML)
            let htmlBody;
            if (htmlTemplate) {
              htmlBody = replacePlaceholders(htmlTemplate, recipient);
            } else if (recipient.html) {
              htmlBody = replacePlaceholders(recipient.html, recipient);
            } else {
              htmlBody = `<p>${textBody}</p>`;
            }

            // Prepare email options
            const mailOptions = {
              from: `"${process.env.SENDER_NAME || 'Bulk Mailer'}" <${process.env.EMAIL_USER}>`,
              to: recipient.email,
              subject: subject,
              text: textBody,
              html: htmlBody
            };

            // Send email
            const info = await transporter.sendMail(mailOptions);
            successCount++;
            console.log(`✓ [${i + 1}/${recipients.length}] Email sent to ${recipient.email}`);
            console.log(`  Message ID: ${info.messageId}\n`);

            // Add delay to avoid rate limiting (1 second between emails)
            if (i < recipients.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }

          } catch (error) {
            failCount++;
            console.error(`✗ [${i + 1}/${recipients.length}] Failed to send email to ${recipient.email}`);
            console.error(`  Error: ${error.message}\n`);
          }
        }

        console.log('='.repeat(50));
        console.log('Bulk email sending completed!');
        console.log(`Total: ${recipients.length} | Success: ${successCount} | Failed: ${failCount}`);
        console.log('='.repeat(50));

        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Main execution
const csvFilePath = process.argv[2] || './emails.csv';

if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.error('Error: EMAIL_USER and EMAIL_APP_PASSWORD must be set in .env file');
  process.exit(1);
}

console.log('Bulk Email Sender');
console.log('='.repeat(50));
console.log(`Using CSV file: ${csvFilePath}`);
console.log(`Sender email: ${process.env.EMAIL_USER}\n`);

sendBulkEmails(csvFilePath)
  .then(() => {
    console.log('Process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
