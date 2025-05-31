# SolveDet Serverless Application Processor

This serverless function processes SolveDet application forms, sends professional emails, and integrates with Cashfree payments.

## 🚀 Quick Deployment to Vercel

### Prerequisites
- Gmail account (for sending emails)
- Vercel account (free)
- Node.js installed locally (for testing)

### Step 1: Gmail Setup (5 minutes)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account Settings > Security
   - Click "2-Step Verification" > "App passwords"
   - Generate password for "Mail"
   - Copy the 16-digit password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Deploy to Vercel (3 minutes)

#### Option A: Deploy via Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to your project folder
cd solvedet-serverless

# Install dependencies
npm install

# Login to Vercel
vercel login

# Deploy to Vercel
vercel --prod
```

#### Option B: Deploy via GitHub
1. Push this code to a GitHub repository
2. Connect repository to Vercel dashboard
3. Deploy automatically

### Step 3: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** > **Environment Variables**
3. Add these variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `GMAIL_USER` | your-email@gmail.com | Production |
| `GMAIL_APP_PASSWORD` | your-16-digit-app-password | Production |

### Step 4: Get Your Function URL

After deployment, you'll get a URL like:
```
https://your-project-name.vercel.app/api/process-application
```

### Step 5: Update Your HTML Form

In your SolveDet payment page, update this line:
```javascript
const SERVERLESS_FUNCTION_URL = 'https://your-project-name.vercel.app/api/process-application';
```

## 🧪 Testing

### Local Testing
```bash
# Install dependencies
npm install

# Create .env.local file with your Gmail credentials
cp .env.template .env.local
# Edit .env.local with your actual credentials

# Start local development server
vercel dev

# Your function will be available at:
# http://localhost:3000/api/process-application
```

### Test the Function
You can test with curl:
```bash
curl -X POST http://localhost:3000/api/process-application \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test Client",
    "clientEmail": "test@example.com",
    "clientPhone": "9876543210",
    "totalFee": 100000,
    "currentPayment": 10000,
    "constitution": "Individual",
    "clientPAN": "ABCDE1234F",
    "clientAddress": "Test Address"
  }'
```

## 📧 Email Configuration Alternatives

### Option 1: Gmail (Recommended)
- **Pros:** Easy setup, reliable
- **Cons:** Daily sending limits (500 emails/day)
- **Setup:** Use app password as shown above

### Option 2: SendGrid
- **Pros:** Higher limits, professional features
- **Cons:** Requires account verification
- **Setup:**
  1. Create SendGrid account
  2. Get API key
  3. Set `SENDGRID_API_KEY` environment variable
  4. Uncomment SendGrid code in function

### Option 3: Outlook/Hotmail
- **Pros:** Easy setup if you have Microsoft account
- **Setup:** Use regular password (less secure than app passwords)

## 🔧 Troubleshooting

### Email not sending?
1. Check environment variables are set correctly
2. Verify Gmail app password is 16 digits
3. Check Vercel function logs
4. Test locally first

### CORS errors?
- Ensure vercel.json has proper CORS headers
- Check that your Squarespace domain is making requests correctly

### Function timeout?
- Increase maxDuration in vercel.json
- Check email service response times

## 📊 Monitoring

- **Vercel Dashboard:** Monitor function executions, errors, and performance
- **Email Logs:** Check your email service for delivery status
- **Function Logs:** View console.log outputs in Vercel dashboard

## 🔒 Security

- Environment variables are encrypted in Vercel
- CORS is configured to allow all origins (adjust if needed)
- No sensitive data is logged
- Emails are sent over encrypted connections

## 📁 Project Structure

```
solvedet-serverless/
├── api/
│   └── process-application.js    # Main serverless function
├── package.json                  # Dependencies
├── vercel.json                   # Vercel configuration
├── .env.local                    # Local environment variables
└── README.md                     # This file
```

## 🚀 Success! 

Once deployed:
✅ Your function URL will be: `https://your-project.vercel.app/api/process-application`
✅ Update your HTML form with this URL
✅ Test a form submission
✅ Both you and clients will receive professional emails
✅ Cashfree integration will work with pre-filled data

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test email configuration locally
4. Contact Vercel support if needed