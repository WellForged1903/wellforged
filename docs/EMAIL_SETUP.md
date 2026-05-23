# Brevo Email Setup & Domain Authentication

To ensure that Wellforged emails are delivered reliably and do not end up in spam folders, follow these instructions to configure your Brevo (Sendinblue) account and authenticate your domain.

## 1. Environment Variables

Add the following variables to your `.env` file in the `Backend` directory:

```env
# Brevo (Sendinblue) API Configuration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_FROM_EMAIL=hello@wellforged.in
BREVO_FROM_NAME=Wellforged
BREVO_REPLY_TO_EMAIL=hello@wellforged.in
BREVO_REPLY_TO_NAME=Wellforged

# Optional: Storefront URL for links in email
STOREFRONT_URL=https://wellforged.in
```

## 2. Domain Authentication (Recommended for Production)

Go to your Brevo Dashboard > **Senders & IP** > **Domains**.

### Step 1: Add your domain
Click **Add a new domain**, enter `wellforged.in`, and select "I would like to use this domain to digitally sign my emails (SPF, DKIM, DMARC)".

### Step 2: Configure DNS Records
Brevo will provide several DNS records. You need to add these to your DNS provider (e.g., GoDaddy, Cloudflare, Namecheap).

#### DKIM (DomainKeys Identified Mail)
Add a **TXT** record:
- **Host/Name**: `mail._domainkey`
- **Value**: (The long string provided by Brevo)

#### SPF (Sender Policy Framework)
Add or update a **TXT** record:
- **Host/Name**: `@` or left blank
- **Value**: `v=spf1 include:spf.sendinblue.com ~all`
- *Note: If you already have an SPF record, add `include:spf.sendinblue.com` before `~all`.*

#### DMARC (Optional but recommended)
Add a **TXT** record:
- **Host/Name**: `_dmarc`
- **Value**: `v=DMARC1; p=none;`

### Step 3: Verify
After adding the records, click **Verify / Authenticate** in the Brevo dashboard. It may take up to 24-48 hours for DNS changes to propagate.

## 3. Testing the Integration

### Sample API Request (Manual Trigger)
If you want to test the `MailerService` manually without placing a real order, you can use the following script pattern in your application or via a test endpoint:

```typescript
import MailerService from './services/mailer.service.js';

await MailerService.sendOrderConfirmation(
    'test@example.com',
    'Test User',
    'WF-TEST-123',
    2490,
    [
        { productName: 'Premium Whey Protein', quantity: 1, price: 2490 }
    ],
    '3-5 business days'
);
```

### Verification Checklist
- [ ] Email received in inbox (not spam).
- [ ] "From" name shows "Wellforged".
- [ ] HTML layout is responsive on mobile.
- [ ] Links (Visit Store, Support) are working.
- [ ] Retries are logged in `backend.out.log` if the API is temporarily unavailable.
