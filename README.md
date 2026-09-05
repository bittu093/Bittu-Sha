# Northeast Unity Night — Landing Page

A single-page, mobile-first website: editorial hero with real Northeast
cultural photography, highlights, packages, gallery, testimonials, a
3-step registration form (details + optional photo → UPI QR payment →
review), an auto-generated downloadable photo-ID card, a FAQ section, a
rule-based help chatbot, and a floating WhatsApp button. No backend or
server required — every submission is handed to WhatsApp, with an
optional Google Sheet log.

**All CSS and JavaScript app logic live inside `index.html` itself.**
Only the QR library (`assets/qrcode.min.js`) and photos are separate
files. This is deliberate: if `index.html` is ever uploaded or shared on
its own without its folder, the page will still render fully styled —
only the QR code and images would be missing, not the entire layout.
Always keep `index.html`, `script.js`, and the `assets/` folder together
in the same folder when uploading anywhere.

## 1. Before you launch — edit these

Open **script.js** and edit the `CONFIG` block at the very top:

```js
const CONFIG = {
  WHATSAPP_NUMBER: "918660945151",   // already set to your number
  UPI_ID: "[UPI-ID]@upi",            // replace with your real UPI ID
  PAYEE_NAME: "Northeast Unity Night",
  GOOGLE_SHEET_ENDPOINT: ""          // optional, see step 3 below
};
```

Also update in **index.html**:
- `[EMAIL ADDRESS]` in the footer (search for it).
- The event date/time/venue once confirmed.
- The Instagram link in the footer (currently `href="#"`).

## 2. On payment verification — read this carefully

**No website form, on its own, can prove a payment happened.** That is
true of this site and would be true of any no-backend form. Uploading a
screenshot only sends you a file — it does not check it against your
bank or UPI account. The site is built around that reality rather than
hiding it:

- A banner on the registration section and a checkbox at submission
  both tell the guest, explicitly, that their registration is
  **pending** until a human checks it.
- The WhatsApp message you receive is labelled `STATUS: PENDING
  VERIFICATION` and asks you to check the transaction ID and screenshot
  against payments you've actually received before treating the
  registration as confirmed.
- The downloadable ID card itself carries a **"PENDING VERIFICATION"**
  stamp, so a guest can't wave an unverified card at the door and have
  it look like a confirmed pass.
- The transaction ID field is format-checked (9–22 letters/numbers) so
  blank or nonsense entries are rejected before submission.
- A soft, same-device duplicate check warns if a transaction ID has
  already been submitted from that browser before.
- Guests tick a declaration that the screenshot is genuine and
  understand a fake one voids their entry without a refund.

None of this makes fraud impossible — a determined person can still
upload someone else's screenshot and type a made-up reference number.
**The only real defence is what happens after submission: your team
opens each WhatsApp message and checks the transaction ID and amount
against your actual UPI/bank statement before telling that guest they're
confirmed.** Treat every message in that WhatsApp chat as an application,
not a ticket.

If you want the system itself to verify payment automatically — so a
fake screenshot literally cannot get through — that requires a real
payment gateway (Razorpay, Cashfree, Instamojo, etc.) with a backend
that gets a webhook the moment money actually lands in your account.
That's a different, larger build than a no-backend static site; happy to
scope that separately if you want to move to it later.

## 3. How registration works end to end

1. Guest fills their details, optionally adds a photo for their ID card,
   picks a package, and sees a live UPI QR code sized to that package's
   price.
2. They pay, then upload a screenshot and type the transaction ID.
3. On submit: if their browser/device supports the Web Share API (most
   modern Android/iOS browsers over HTTPS), a native share sheet opens
   with the **screenshot file itself plus all their details as text**,
   ready to send straight to WhatsApp in one tap — this is the one real
   mechanism that can hand a file to WhatsApp automatically. If the
   browser doesn't support it, WhatsApp opens with the text only, and
   the guest is told on-screen to attach the screenshot themselves.
4. Either way, they get a downloadable photo-ID card immediately, marked
   pending, with a unique Registration ID and a QR code encoding that ID
   for quick scanning at entry once you've confirmed them.

## 4. Optional: log every submission to a Google Sheet

1. Open `google-apps-script.gs` — full step-by-step instructions are in
   the comments (create a Sheet, paste the script, deploy as a Web App,
   copy the URL).
2. Paste that URL into `GOOGLE_SHEET_ENDPOINT` in `script.js`.
3. Every submission now also appends a row you can download anytime via
   File → Download in Google Sheets.

## 5. The help chatbot

A small rule-based FAQ bot (see the `KB` array in `script.js`) — matches
keywords like "price", "venue", "verify" and answers instantly, with a
"Talk to a human" button that opens WhatsApp. No API key, works offline.
Connecting a real AI model later would need a backend to hold the key
securely.

## 6. Images

`assets/` contains the real Northeast cultural photography you
provided. Swap in your own event photos as soon as you have them.

## 7. SEO — already built in

- Meta title/description targeting "Northeast community event
  Bangalore" and similar search terms, Open Graph + Twitter card tags,
  JSON-LD `Event` structured data, semantic headings, descriptive
  `alt` text and lazy-loaded images.

To actually rank: fill in the real venue address once confirmed, submit
the URL in Google Search Console, create a Google Business Profile
linking here, and get a couple of backlinks from local Bangalore event
listings or your Instagram bio.

## 8. Deploying

Static site, no build step. Upload the whole folder — `index.html`,
`script.js`, and `assets/` — to any static host (Netlify, Vercel, GitHub
Pages, or your own hosting via FTP), keeping that folder structure
intact.

## What to double check before going live

- [ ] Real UPI ID in `CONFIG.UPI_ID`
- [ ] Real event date/time/venue added to Hero + FAQ
- [ ] Real contact email and Instagram link in the footer
- [ ] Test one full registration yourself, end to end, on a phone
- [ ] Decide who on your team checks the WhatsApp chat and verifies each
      transaction ID/screenshot against actual payments before
      confirming a guest — this is the step nothing on the website can
      replace
