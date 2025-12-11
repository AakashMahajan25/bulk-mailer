# Bulk Email Sender

A simple Node.js application to send bulk emails using CSV files and nodemailer with Google Workspace (Gmail).

## Features

- Send bulk emails from a CSV file
- **Email templates with placeholders** for personalized messages
- Support for custom subject and message per recipient
- **Both text and HTML email support**
- Uses Gmail App Passwords for secure authentication
- Progress tracking with success/failure counts
- Automatic rate limiting (1 second delay between emails)

## Prerequisites

- Node.js installed on your system
- A Google Workspace or Gmail account
- An App Password generated for your Google account

## Setup Instructions

### 1. Generate Google App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (you must enable this first)
3. Scroll down to **App passwords**
4. Select **Mail** as the app and your device
5. Click **Generate**
6. Copy the 16-character password (remove spaces)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file and add your credentials:
```
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password
SENDER_NAME=Your Name or Company
```

### 4. Prepare Your Email Template (Optional but Recommended)

The application supports email templates with placeholders that get replaced with data from your CSV file.

**Two template files are included:**
- `email-template.txt` - Plain text version
- `email-template.html` - HTML formatted version

**How placeholders work:**
- Use `[Column Name]` in your template
- The app will replace it with the value from that CSV column
- Example: `[First Name]` gets replaced with the value from the "First Name" column

**Example template snippet:**
```
Hi [First Name],

I have a quick question about [Company Name]'s current approach...
```

### 5. Prepare Your CSV File

Create a CSV file named `emails.csv` with columns that match your template placeholders:

**Required column:**
- `email` - Recipient email address

**Optional columns (based on your template):**
- `First Name` - Recipient's first name
- `Company Name` - Company name
- `subject` - Email subject line (can also contain placeholders)
- Any other custom fields you want to use

**Example CSV:**
```csv
email,First Name,Company Name,subject
john@example.com,John,Acme Corp,"Question about [Company Name]'s buyer acquisition"
jane@example.com,Jane,Tech Industries,"Question about [Company Name]'s buyer acquisition"
```

**Note:** If you don't use templates, you can still use the old format with `message` and `html` columns directly in the CSV.

## Usage

### Send emails using default CSV file (emails.csv):
```bash
node index.js
```

### Send emails using a custom CSV file:
```bash
node index.js path/to/your/file.csv
```

## How It Works

1. **With Templates (Recommended):**
   - Place your email content in `email-template.txt` and/or `email-template.html`
   - Use `[Column Name]` placeholders in the templates
   - Create CSV with columns matching your placeholders
   - The app replaces all placeholders with values from CSV

2. **Without Templates:**
   - Include `message` and/or `html` columns in your CSV
   - Each row can have different content
   - Less convenient for bulk campaigns with similar content

## CSV File Format

### When using templates:

| Column  | Required | Description |
|---------|----------|-------------|
| email   | Yes      | Recipient email address |
| First Name | No    | Recipient's first name (or any custom field) |
| Company Name | No  | Company name (or any custom field) |
| subject | No       | Email subject (can contain placeholders) |
| ...     | No       | Any other custom fields for your template |

### When NOT using templates:

| Column  | Required | Description |
|---------|----------|-------------|
| email   | Yes      | Recipient email address |
| subject | No       | Email subject (uses DEFAULT_SUBJECT from .env if not provided) |
| message | No       | Email body text (uses DEFAULT_MESSAGE from .env if not provided) |
| html    | No       | HTML version of the message (optional) |

## Rate Limiting

The application includes a 1-second delay between emails to avoid hitting Gmail's rate limits. For production use with higher volumes, consider:

- Using a dedicated email service provider (SendGrid, Mailgun, etc.)
- Implementing more sophisticated rate limiting
- Batching emails

## Security Notes

- Never commit your `.env` file to version control
- Keep your App Password secure and don't share it
- The `.gitignore` file is configured to exclude `.env` automatically

## Troubleshooting

### "Invalid login" error
- Verify your email and App Password are correct in `.env`
- Ensure 2-Step Verification is enabled on your Google account
- Generate a new App Password if needed

### "Connection timeout" error
- Check your internet connection
- Verify Gmail SMTP settings (smtp.gmail.com:587)
- Check if your firewall is blocking the connection

### Rate limiting issues
- Gmail has sending limits (500 emails/day for free accounts)
- Consider increasing the delay between emails
- Use a dedicated email service for large volumes

## License

ISC
