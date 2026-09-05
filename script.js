/* =========================================================
   CONFIG — the owner edits only this block to go live
   ========================================================= */
const CONFIG = {
  WHATSAPP_NUMBER: "918660945151",
  UPI_ID: "8660945151@upi",
  PAYEE_NAME: "Northeast Unity Night",
  GOOGLE_SHEET_ENDPOINT: ""
};


/* ---------------- NAV ---------------- */

const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

navToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});

mainNav.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () =>
    mainNav.classList.remove("open")
  )
);


/* ---------------- WHATSAPP LINKS ---------------- */

function waLink(message) {
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const enquiryMsg =
  "Hi! I'd like to know more about Northeast Unity Night 2026.";

[
  "heroWhatsapp",
  "floatWhatsapp",
  "footerWhatsapp",
  "footerWhatsapp2"
].forEach(id => {
  const el = document.getElementById(id);

  if (el) {
    el.href = waLink(enquiryMsg);
  }
});


/* ---------------- FAQ ---------------- */

document.querySelectorAll(".faq-q").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    const answer = item.querySelector(".faq-a");

    const isOpen =
      btn.getAttribute("aria-expanded") === "true";

    document.querySelectorAll(".faq-q").forEach(b => {
      b.setAttribute("aria-expanded", "false");

      b.parentElement.querySelector(
        ".faq-a"
      ).style.maxHeight = null;
    });

    if (!isOpen) {
      btn.setAttribute("aria-expanded", "true");

      answer.style.maxHeight =
        answer.scrollHeight + 40 + "px";
    }
  });
});


/* ---------------- HELPERS ---------------- */

function toTitleCase(str) {
  return (str || "")
    .trim()
    .split(/\s+/)
    .map(
      w =>
        w.charAt(0).toUpperCase() +
        w.slice(1).toLowerCase()
    )
    .join(" ");
}


/* =========================================================
   MULTI-STEP REGISTRATION FORM
   ========================================================= */

const form =
  document.getElementById("regForm");

const steps =
  Array.from(
    form.querySelectorAll(".reg-step")
  );

const stepIndicators =
  Array.from(
    document.querySelectorAll("#regSteps li")
  );

let currentStep = 0;

let uploadedScreenshotFile = null;

let uploadedPhotoDataUrl = "";


/* ---------------- STEP CONTROL ---------------- */

function showStep(index) {

  steps.forEach((s, i) => {
    s.classList.toggle(
      "active",
      i === index
    );
  });

  stepIndicators.forEach((li, i) => {

    li.classList.toggle(
      "active",
      i === index
    );

    li.classList.toggle(
      "done",
      i < index
    );

  });

  currentStep = index;

  const fill =
    document.getElementById(
      "stepsLineFill"
    );

  if (fill) {

    fill.style.width =
      (
        index /
        (steps.length - 1) *
        100
      ) + "%";

  }

  document
    .querySelector(".reg-shell")
    .scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
}


/* ---------------- VALIDATION ---------------- */

function validateStep(index) {

  const fields =
    steps[index].querySelectorAll(
      "[required]"
    );

  for (const f of fields) {

    if (!f.reportValidity()) {
      return false;
    }

  }

  /* Payment step validation */

  if (index === 1) {

    const txnInput =
      form.querySelector(
        'input[name="txnId"]'
      );

    const val =
      txnInput.value.trim();

    const looksValid =
      /^[A-Za-z0-9]{9,22}$/.test(val);

    if (!looksValid) {

      txnInput.setCustomValidity(
        "Enter the transaction / UPI reference ID exactly as shown in your payment app (9–22 letters/numbers, no spaces)."
      );

      txnInput.reportValidity();

      txnInput.addEventListener(
        "input",
        () =>
          txnInput.setCustomValidity(""),
        {
          once: true
        }
      );

      return false;
    }

    if (!uploadedScreenshotFile) {

      alert(
        "Please upload your payment screenshot before continuing."
      );

      return false;
    }

    const used =
      JSON.parse(
        localStorage.getItem(
          "nun_used_txn_ids"
        ) || "[]"
      );

    if (
      used.includes(
        val.toLowerCase()
      )
    ) {

      const proceed =
        confirm(
          "This transaction ID was already used for a registration from this device. If this is a genuine second ticket, press OK to continue — our team will verify both against the actual payment."
        );

      if (!proceed) {
        return false;
      }
    }

  }

  return true;
}


/* =========================================================
   NEXT BUTTONS
   ========================================================= */

form
  .querySelectorAll("[data-next]")
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        /*
          Validate the current step first.
        */

        if (
          !validateStep(
            currentStep
          )
        ) {
          return;
        }


        /*
          STEP 1 → STEP 2

          Update the payment amount
          and generate the UPI QR
          using the selected package.
        */

        if (
          currentStep === 0
        ) {

          updatePaymentPanel();

        }


        /*
          STEP 2 → STEP 3
        */

        if (
          currentStep === 1
        ) {

          buildReview();

        }


        /*
          Move to next step.
        */

        if (
          currentStep <
          steps.length - 1
        ) {

          showStep(
            currentStep + 1
          );

        }

      }
    );

  });


/* ---------------- BACK BUTTONS ---------------- */

form
  .querySelectorAll("[data-back]")
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        showStep(
          currentStep - 1
        );

      }
    );

  });


/* =========================================================
   OPTIONAL PROFILE PHOTO
   ========================================================= */

const photoInput =
  document.getElementById(
    "photoInput"
  );

const photoPreview =
  document.getElementById(
    "photoPreview"
  );

const photoIcon =
  document.getElementById(
    "photoIcon"
  );


photoInput.addEventListener(
  "change",
  e => {

    const file =
      e.target.files[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = ev => {

      uploadedPhotoDataUrl =
        ev.target.result;

      photoPreview.src =
        uploadedPhotoDataUrl;

      photoPreview.hidden =
        false;

      photoIcon.style.display =
        "none";

    };

    reader.readAsDataURL(file);

  }
);


/* =========================================================
   PACKAGE + PAYMENT QR
   ========================================================= */

function getSelectedPackage() {

  const checked =
    form.querySelector(
      'input[name="package"]:checked'
    );

  return {

    name:
      checked
        ? checked.value
        : "",

    price:
      checked
        ? checked.dataset.price
        : "0"

  };
}


/*
  =========================================================
  PAYMENT QR FUNCTION
  =========================================================

  The payment QR is generated from the selected package.

  Food + Drinks:
      ₹1,750

  Food Only:
      ₹750

  The amount is included in the UPI payment URL:

      &am=1750

  or:

      &am=750

  Therefore, compatible UPI apps can open with
  the correct amount pre-filled.
*/

function updatePaymentPanel() {

  const pkg =
    getSelectedPackage();

  const price =
    pkg.price;


  /* Update visible payment amount */

  const payAmount =
    document.getElementById(
      "payAmount"
    );

  if (payAmount) {

    payAmount.textContent =
      `₹${price}`;

  }


  /* Find QR container */

  const qrBox =
    document.getElementById(
      "qrcode"
    );

  if (!qrBox) {
    return;
  }


  /*
    Make sure QRCode library is available.
  */

  if (
    typeof QRCode ===
    "undefined"
  ) {

    console.error(
      "QRCode library not found. Make sure img/qrcode.min.js is loaded before script.js."
    );

    return;
  }


  /*
    Build UPI payment URL.

    The selected amount is included
    using the "am" parameter.
  */

  const upiUrl =
    `upi://pay` +
    `?pa=${encodeURIComponent(
      CONFIG.UPI_ID
    )}` +
    `&pn=${encodeURIComponent(
      CONFIG.PAYEE_NAME
    )}` +
    `&am=${encodeURIComponent(
      price
    )}` +
    `&cu=INR`;


  /*
    Remove only the old payment QR.

    Then generate a fresh QR for
    the selected amount.
  */

  qrBox.innerHTML = "";


  /*
    Create QR code.
  */

  const qrCanvas =
    document.createElement(
      "div"
    );

  qrCanvas.id =
    "dynamicPaymentQr";

  qrBox.appendChild(
    qrCanvas
  );


  new QRCode(
    qrCanvas,
    {
      text: upiUrl,

      width: 200,

      height: 200,

      colorDark:
        "#14110f",

      colorLight:
        "#ffffff"
    }
  );


  /*
    Add payment note below QR.
  */

  const note =
    document.createElement(
      "p"
    );

  note.className =
    "dynamic-payment-note";


  note.innerHTML = `
    <strong>Scan to pay ₹${price}</strong><br>
    Amount will be pre-filled in your UPI app.
  `;


  qrBox.appendChild(
    note
  );

}


/* =========================================================
   SCREENSHOT DROPZONE
   ========================================================= */

const screenshotInput =
  document.getElementById(
    "screenshotInput"
  );

const dropzone =
  document.getElementById(
    "dropzone"
  );

const dropzoneEmpty =
  document.getElementById(
    "dropzoneEmpty"
  );

const uploadPreview =
  document.getElementById(
    "uploadPreview"
  );


function handleScreenshotFile(
  file
) {

  if (!file) {
    return;
  }


  /*
    Check whether the screenshot
    looks old.
  */

  const ageMinutes =
    (
      Date.now() -
      file.lastModified
    ) / 60000;


  document.getElementById(
    "screenshotAgeWarning"
  ).hidden =
    ageMinutes <= 120;


  const reader =
    new FileReader();


  reader.onload = ev => {

    uploadedScreenshotFile =
      file;


    document.getElementById(
      "previewImg"
    ).src =
      ev.target.result;


    document.getElementById(
      "uploadFileName"
    ).textContent =
      file.name;


    dropzoneEmpty.hidden =
      true;


    uploadPreview.hidden =
      false;

  };


  reader.readAsDataURL(
    file
  );

}


/* File picker */

screenshotInput.addEventListener(
  "change",
  e => {

    handleScreenshotFile(
      e.target.files[0]
    );

  }
);


/* Drag over */

[
  "dragenter",
  "dragover"
].forEach(evt => {

  dropzone.addEventListener(
    evt,
    e => {

      e.preventDefault();

      dropzone.classList.add(
        "dragover"
      );

    }
  );

});


/* Drag leave */

[
  "dragleave",
  "drop"
].forEach(evt => {

  dropzone.addEventListener(
    evt,
    e => {

      e.preventDefault();

      dropzone.classList.remove(
        "dragover"
      );

    }
  );

});


/* Drop */

dropzone.addEventListener(
  "drop",
  e => {

    const file =
      e.dataTransfer.files[0];

    if (file) {

      screenshotInput.files =
        e.dataTransfer.files;

      handleScreenshotFile(
        file
      );

    }

  }
);


/* Remove screenshot */

document
  .getElementById(
    "removeScreenshot"
  )
  .addEventListener(
    "click",
    e => {

      e.preventDefault();

      e.stopPropagation();

      uploadedScreenshotFile =
        null;

      screenshotInput.value =
        "";

      dropzoneEmpty.hidden =
        false;

      uploadPreview.hidden =
        true;

      document.getElementById(
        "screenshotAgeWarning"
      ).hidden =
        true;

    }
  );


/* =========================================================
   REVIEW
   ========================================================= */

function buildReview() {

  const data =
    getFormData();


  document.getElementById(
    "reviewPanel"
  ).innerHTML = `

    <div>
      <b>Name</b>
      <span>${data.fullName}</span>
    </div>

    <div>
      <b>Age / Gender</b>
      <span>${data.age} / ${data.gender}</span>
    </div>

    <div>
      <b>WhatsApp</b>
      <span>${data.mobile}</span>
    </div>

    <div>
      <b>State</b>
      <span>${data.state}</span>
    </div>

    <div>
      <b>Area</b>
      <span>${data.city}</span>
    </div>

    <div>
      <b>Package</b>
      <span>${data.package}</span>
    </div>

    <div>
      <b>Amount</b>
      <span>₹${data.amount}</span>
    </div>

    <div>
      <b>Transaction ID</b>
      <span>${data.txnId}</span>
    </div>

  `;

}


/* =========================================================
   FORM DATA
   ========================================================= */

function getFormData() {

  const fd =
    new FormData(form);

  const pkg =
    getSelectedPackage();


  return {

    fullName:
      toTitleCase(
        fd.get(
          "fullName"
        ) || ""
      ),

    age:
      fd.get(
        "age"
      ) || "",

    gender:
      fd.get(
        "gender"
      ) || "",

    mobile:
      fd.get(
        "mobile"
      ) || "",

    email:
      fd.get(
        "email"
      ) || "",

    state:
      fd.get(
        "state"
      ) || "",

    city:
      fd.get(
        "city"
      ) || "",

    package:
      pkg.name,

    amount:
      pkg.price,

    txnId:
      fd.get(
        "txnId"
      ) || "",

    id:
      "NUN-" +
      Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase() +
      "-" +
      new Date()
        .getFullYear()

  };

}


/* =========================================================
   SUBMIT
   ========================================================= */

form.addEventListener(
  "submit",
  async e => {

    e.preventDefault();


    if (!validateStep(2)) {
      return;
    }


    if (!uploadedScreenshotFile) {

      alert(
        "Please upload your payment screenshot in Step 2 before submitting."
      );

      showStep(1);

      return;
    }


    const data =
      getFormData();


    /*
      Save transaction ID locally
      to prevent accidental reuse
      on the same device.
    */

    const used =
      JSON.parse(
        localStorage.getItem(
          "nun_used_txn_ids"
        ) || "[]"
      );


    used.push(
      data.txnId.toLowerCase()
    );


    localStorage.setItem(
      "nun_used_txn_ids",
      JSON.stringify(used)
    );


    /*
      WhatsApp registration message.
    */

    const message =

`New registration — Northeast Unity Night 2026 (STATUS: PENDING VERIFICATION)
Registration ID (unique, permanent): ${data.id}
Name: ${data.fullName}
Age / Gender: ${data.age} / ${data.gender}
WhatsApp: ${data.mobile}
Email: ${data.email || "-"}
State: ${data.state}
Area: ${data.city}
Package: ${data.package} (₹${data.amount})
Transaction / UPI Ref ID: ${data.txnId}
Please verify this transaction ID and the attached screenshot against payments received before confirming.`;


    const whatsappUrl =
      waLink(
        message +
        "\n(Payment screenshot attached below)"
      );


    document.getElementById(
      "openWhatsappBtn"
    ).href =
      whatsappUrl;


    /*
      Google Sheet endpoint,
      if configured.
    */

    if (
      CONFIG.GOOGLE_SHEET_ENDPOINT
    ) {

      fetch(
        CONFIG.GOOGLE_SHEET_ENDPOINT,
        {
          method:
            "POST",

          mode:
            "no-cors",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(
              data
            )
        }
      ).catch(
        () => {}
      );

    }


    /*
      Generate ID card.
    */

    await drawIdCard(
      data
    );


    /*
      Show success modal.
    */

    document.getElementById(
      "successModal"
    ).hidden =
      false;


    /*
      Try to share payment screenshot
      directly using the device share sheet.
    */

    let sharedFileDirectly =
      false;


    try {

      if (
        navigator.canShare &&
        navigator.canShare({
          files: [
            uploadedScreenshotFile
          ]
        })
      ) {

        await navigator.share({

          files: [
            uploadedScreenshotFile
          ],

          title:
            "Northeast Unity Night — Payment Screenshot",

          text:
            message

        });


        sharedFileDirectly =
          true;

      }

    } catch (err) {

      /*
        User cancelled sharing
        or browser doesn't support it.
      */

    }


    /*
      If direct sharing isn't available,
      open WhatsApp normally.
    */

    if (
      !sharedFileDirectly
    ) {

      setTimeout(
        () => {

          window.open(
            whatsappUrl,
            "_blank"
          );

        },
        500
      );

    }

  }
);


/* =========================================================
   ID CARD
   ========================================================= */

function loadImage(src) {

  return new Promise(
    (resolve, reject) => {

      const img =
        new Image();

      img.crossOrigin =
        "anonymous";

      img.onload =
        () => resolve(img);

      img.onerror =
        reject;

      img.src =
        src;

    }
  );

}


function roundedRect(
  ctx,
  x,
  y,
  w,
  h,
  r
) {

  ctx.beginPath();

  ctx.moveTo(
    x + r,
    y
  );

  ctx.arcTo(
    x + w,
    y,
    x + w,
    y + h,
    r
  );

  ctx.arcTo(
    x + w,
    y + h,
    x,
    y + h,
    r
  );

  ctx.arcTo(
    x,
    y + h,
    x,
    y,
    r
  );

  ctx.arcTo(
    x,
    y,
    x + w,
    y,
    r
  );

  ctx.closePath();

}


async function drawIdCard(
  data
) {

  const canvas =
    document.getElementById(
      "idCanvas"
    );

  const ctx =
    canvas.getContext(
      "2d"
    );


  const W =
    canvas.width;

  const H =
    canvas.height;


  /*
    Background.
  */

  const grad =
    ctx.createLinearGradient(
      0,
      0,
      W,
      H
    );


  grad.addColorStop(
    0,
    "#1c1815"
  );

  grad.addColorStop(
    1,
    "#2a231d"
  );


  ctx.fillStyle =
    grad;


  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  /*
    Border.
  */

  ctx.strokeStyle =
    "rgba(200,155,60,0.5)";

  ctx.lineWidth =
    3;


  roundedRect(
    ctx,
    8,
    8,
    W - 16,
    H - 16,
    22
  );


  ctx.stroke();


  /*
    Decorative top strip.
  */

  const bandH =
    34;


  const colors = [
    "#c89b3c",
    "#7a2131",
    "#3f5443",
    "#14110f"
  ];


  const stripW =
    24;


  ctx.save();


  roundedRect(
    ctx,
    8,
    8,
    W - 16,
    bandH,
    0
  );


  ctx.clip();


  for (
    let x = -bandH,
        i = 0;

    x < W + bandH;

    x += stripW,
    i++
  ) {

    ctx.fillStyle =
      colors[
        i %
        colors.length
      ];


    ctx.beginPath();


    ctx.moveTo(
      x,
      8
    );


    ctx.lineTo(
      x + stripW,
      8
    );


    ctx.lineTo(
      x + stripW - 14,
      8 + bandH
    );


    ctx.lineTo(
      x - 14,
      8 + bandH
    );


    ctx.closePath();

    ctx.fill();

  }


  ctx.restore();


  /*
    Title.
  */

  ctx.textAlign =
    "center";


  ctx.fillStyle =
    "#e8c877";


  ctx.font =
    "800 22px 'Work Sans', sans-serif";


  ctx.fillText(
    "NORTHEAST UNITY NIGHT",
    W / 2,
    92
  );


  ctx.fillStyle =
    "#cfc4ac";


  ctx.font =
    "600 15px 'Work Sans', sans-serif";


  ctx.fillText(
    "OFFICIAL EVENT PASS · 2026",
    W / 2,
    118
  );


  /*
    Photo / initials.
  */

  const cx =
    W / 2;

  const cy =
    250;

  const r =
    100;


  ctx.save();


  ctx.beginPath();


  ctx.arc(
    cx,
    cy,
    r + 6,
    0,
    Math.PI * 2
  );


  ctx.fillStyle =
    "rgba(200,155,60,0.15)";


  ctx.fill();


  ctx.restore();


  ctx.save();


  ctx.beginPath();


  ctx.arc(
    cx,
    cy,
    r,
    0,
    Math.PI * 2
  );


  ctx.closePath();


  ctx.clip();


  if (
    uploadedPhotoDataUrl
  ) {

    try {

      const img =
        await loadImage(
          uploadedPhotoDataUrl
        );


      const side =
        Math.min(
          img.width,
          img.height
        );


      const sx =
        (
          img.width -
          side
        ) / 2;


      const sy =
        (
          img.height -
          side
        ) / 2;


      ctx.drawImage(
        img,
        sx,
        sy,
        side,
        side,
        cx - r,
        cy - r,
        r * 2,
        r * 2
      );

    } catch (e) {

      drawMonogram();

    }

  } else {

    drawMonogram();

  }


  ctx.restore();


  function drawMonogram() {

    const mg =
      ctx.createLinearGradient(
        cx - r,
        cy - r,
        cx + r,
        cy + r
      );


    mg.addColorStop(
      0,
      "#c89b3c"
    );


    mg.addColorStop(
      1,
      "#7a2131"
    );


    ctx.fillStyle =
      mg;


    ctx.fillRect(
      cx - r,
      cy - r,
      r * 2,
      r * 2
    );


    const initials =
      (
        data.fullName ||
        "G"
      )
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
          w =>
            w[0].toUpperCase()
        )
        .join("");


    ctx.fillStyle =
      "#f4ecdb";


    ctx.font =
      "700 64px 'Fraunces', serif";


    ctx.textBaseline =
      "middle";


    ctx.fillText(
      initials || "G",
      cx,
      cy + 6
    );


    ctx.textBaseline =
      "alphabetic";

  }


  /*
    Photo border.
  */

  ctx.strokeStyle =
    "#c89b3c";


  ctx.lineWidth =
    4;


  ctx.beginPath();


  ctx.arc(
    cx,
    cy,
    r,
    0,
    Math.PI * 2
  );


  ctx.stroke();


  /*
    Name.
  */

  ctx.fillStyle =
    "#f4ecdb";


  ctx.font =
    "700 34px 'Fraunces', serif";


  ctx.textAlign =
    "center";


  ctx.fillText(
    data.fullName ||
      "Guest",
    W / 2,
    cy + r + 56
  );


  /*
    State and area.
  */

  ctx.font =
    "500 16px 'Work Sans', sans-serif";


  ctx.fillStyle =
    "#cfc4ac";


  ctx.fillText(
    `${data.state}  ·  ${data.city}`,
    W / 2,
    cy + r + 84
  );


  /*
    Package pill.
  */

  const pillW =
    220;

  const pillH =
    34;

  const pillY =
    cy + r + 106;


  roundedRect(
    ctx,
    W / 2 -
      pillW / 2,
    pillY,
    pillW,
    pillH,
    17
  );


  ctx.fillStyle =
    "rgba(200,155,60,0.15)";


  ctx.fill();


  ctx.strokeStyle =
    "rgba(200,155,60,0.6)";


  ctx.lineWidth =
    1.5;


  roundedRect(
    ctx,
    W / 2 -
      pillW / 2,
    pillY,
    pillW,
    pillH,
    17
  );


  ctx.stroke();


  ctx.fillStyle =
    "#e8c877";


  ctx.font =
    "700 14px 'Work Sans', sans-serif";


  ctx.fillText(
    data.package.toUpperCase(),
    W / 2,
    pillY + 22
  );


  /*
    Divider.
  */

  ctx.strokeStyle =
    "rgba(244,236,219,0.15)";


  ctx.lineWidth =
    1;


  ctx.beginPath();


  ctx.moveTo(
    60,
    pillY + 66
  );


  ctx.lineTo(
    W - 60,
    pillY + 66
  );


  ctx.stroke();


  /*
    Registration ID.
  */

  ctx.fillStyle =
    "#cfc4ac";


  ctx.font =
    "600 13px 'Work Sans', sans-serif";


  ctx.fillText(
    "REGISTRATION ID  ·  UNIQUE & PERMANENT",
    W / 2,
    pillY + 100
  );


  ctx.fillStyle =
    "#f4ecdb";


  ctx.font =
    "700 26px 'Work Sans', sans-serif";


  ctx.fillText(
    data.id,
    W / 2,
    pillY + 132
  );


  /*
    EVENT ID QR CODE

    This QR is different from the payment QR.
    It is generated only for the event ID card.
  */

  const qrHidden =
    document.createElement(
      "div"
    );


  qrHidden.style.position =
    "fixed";


  qrHidden.style.left =
    "-9999px";


  document.body.appendChild(
    qrHidden
  );


  new QRCode(
    qrHidden,
    {
      text:
        data.id,

      width:
        150,

      height:
        150,

      colorDark:
        "#14110f",

      colorLight:
        "#ffffff"
    }
  );


  const qrEl =
    qrHidden.querySelector(
      "canvas"
    ) ||
    qrHidden.querySelector(
      "img"
    );


  const qrSize =
    150;


  const qrX =
    W / 2 -
    qrSize / 2;


  const qrY =
    pillY + 156;


  ctx.fillStyle =
    "#ffffff";


  roundedRect(
    ctx,
    qrX - 10,
    qrY - 10,
    qrSize + 20,
    qrSize + 20,
    10
  );


  ctx.fill();


  if (qrEl) {

    ctx.drawImage(
      qrEl,
      qrX,
      qrY,
      qrSize,
      qrSize
    );

  }


  document.body.removeChild(
    qrHidden
  );


  /*
    Pending verification badge.
  */

  ctx.save();


  ctx.translate(
    W - 96,
    108
  );


  ctx.rotate(
    Math.PI / 4
  );


  ctx.fillStyle =
    "#e8b45a";


  ctx.fillRect(
    -100,
    -13,
    200,
    26
  );


  ctx.fillStyle =
    "#14110f";


  ctx.font =
    "800 12px 'Work Sans', sans-serif";


  ctx.textAlign =
    "center";


  ctx.fillText(
    "PENDING VERIFICATION",
    0,
    4
  );


  ctx.restore();


  /*
    Footer note.
  */

  ctx.fillStyle =
    "#8a8070";


  ctx.font =
    "400 13px 'Work Sans', sans-serif";


  ctx.textAlign =
    "center";


  ctx.fillText(
    "Carry a valid photo ID at entry. This pass is confirmed only after",
    W / 2,
    H - 56
  );


  ctx.fillText(
    "payment verification by the organising team.",
    W / 2,
    H - 38
  );


  ctx.textAlign =
    "left";

}


/* =========================================================
   DOWNLOAD ID CARD
   ========================================================= */

document
  .getElementById(
    "downloadIdBtn"
  )
  .addEventListener(
    "click",
    () => {

      const canvas =
        document.getElementById(
          "idCanvas"
        );


      const link =
        document.createElement(
          "a"
        );


      link.download =
        "northeast-unity-night-id.png";


      link.href =
        canvas.toDataURL(
          "image/png"
        );


      link.click();

    }
  );


/* ---------------- CLOSE MODAL ---------------- */

document
  .getElementById(
    "modalClose"
  )
  .addEventListener(
    "click",
    () => {

      document.getElementById(
        "successModal"
      ).hidden =
        true;

    }
  );


/* =========================================================
   RULE-BASED HELP CHATBOT
   ========================================================= */

const chatToggle =
  document.getElementById(
    "chatToggle"
  );

const chatPanel =
  document.getElementById(
    "chatPanel"
  );

const chatClose =
  document.getElementById(
    "chatClose"
  );

const chatBody =
  document.getElementById(
    "chatBody"
  );

const chatForm =
  document.getElementById(
    "chatForm"
  );

const chatInput =
  document.getElementById(
    "chatInput"
  );

const chatQuick =
  document.getElementById(
    "chatQuick"
  );


/*
  Chatbot knowledge base.
*/

const KB = [

  {
    k: [
      "price",
      "cost",
      "how much",
      "ticket",
      "package"
    ],

    a:
      "There are two packages: Food + Drinks for ₹1,750 per person, and Food Only for ₹750 per person. You pay by UPI during registration."
  },


  {
    k: [
      "venue",
      "location",
      "where",
      "address"
    ],

    a:
      "The exact venue is being finalised and will be shown here and shared on WhatsApp once confirmed. It will be in Bengaluru."
  },


  {
    k: [
      "date",
      "time",
      "when"
    ],

    a:
      "The date and time are being finalised. Register now and you'll be notified the moment it's confirmed."
  },


  {
    k: [
      "drink",
      "alcohol",
      "bar"
    ],

    a:
      "Alcohol is included in the Food + Drinks package for guests of legal drinking age as per Karnataka law. The Food Only package is non-alcoholic."
  },


  {
    k: [
      "id",
      "proof",
      "entry",
      "documents"
    ],

    a:
      "Carry a valid government photo ID plus the digital or printed event ID you get right after registering."
  },


  {
    k: [
      "refund",
      "cancel"
    ],

    a:
      "Registrations are non-refundable and non-transferable once confirmed."
  },


  {
    k: [
      "register",
      "sign up",
      "how to join",
      "how do i register"
    ],

    a:
      "Scroll to the Register section, fill your details, select your package, scan the UPI QR code to pay, upload your payment screenshot, and submit. Your registration is then manually verified before it's confirmed."
  },


  {
    k: [
      "payment",
      "upi",
      "qr",
      "pay"
    ],

    a:
      "During registration you'll see a UPI QR code with the exact amount for your selected package. Scan it and the amount will be pre-filled in your UPI app. Then upload the payment screenshot and transaction ID — this is manually checked before your entry is approved."
  },


  {
    k: [
      "amount",
      "pre filled",
      "prefilled",
      "scan"
    ],

    a:
      "Yes. The payment QR is generated using your selected package. Food Only is ₹750 and Food + Drinks is ₹1,750, so compatible UPI apps can open with the correct amount pre-filled."
  },


  {
    k: [
      "states",
      "northeast",
      "who can come",
      "who is invited"
    ],

    a:
      "The night represents all 8 Northeast states — Assam, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, Arunachal Pradesh and Sikkim — but everyone is welcome to join."
  },


  {
    k: [
      "verify",
      "confirm",
      "approved",
      "pending"
    ],

    a:
      "Every registration is manually checked against actual payments received. Submitting the form doesn't auto-confirm your spot — you'll be marked pending until our team verifies it."
  }

];


/* ---------------- BOT REPLY ---------------- */

function botReply(text) {

  const lower =
    text.toLowerCase();


  const hit =
    KB.find(
      item =>
        item.k.some(
          kw =>
            lower.includes(kw)
        )
    );


  return hit
    ? hit.a
    : "I couldn't find that in my notes. For anything specific, tap below to message us directly on WhatsApp.";

}


/* ---------------- ADD CHAT MESSAGE ---------------- */

function addMsg(
  text,
  from
) {

  const div =
    document.createElement(
      "div"
    );


  div.className =
    `chat-msg ${from}`;


  div.textContent =
    text;


  chatBody.appendChild(
    div
  );


  chatBody.scrollTop =
    chatBody.scrollHeight;

}


/* ---------------- QUICK REPLIES ---------------- */

function renderQuickReplies() {

  chatQuick.innerHTML =
    "";


  [
    "Pricing",
    "Venue & date",
    "How verification works",
    "Talk to a human"
  ].forEach(label => {

    const b =
      document.createElement(
        "button"
      );


    b.type =
      "button";


    b.textContent =
      label;


    b.addEventListener(
      "click",
      () => {

        if (
          label ===
          "Talk to a human"
        ) {

          window.open(
            waLink(
              "Hi! I have a question about Northeast Unity Night 2026."
            ),
            "_blank"
          );

          return;
        }


        addMsg(
          label,
          "user"
        );


        const q =
          label ===
          "How verification works"
            ? "verify"
            : label;


        setTimeout(
          () =>
            addMsg(
              botReply(q),
              "bot"
            ),
          300
        );

      }
    );


    chatQuick.appendChild(
      b
    );

  });

}


/* ---------------- INITIALISE QUICK REPLIES ---------------- */

renderQuickReplies();


/* ---------------- OPEN / CLOSE CHAT ---------------- */

chatToggle.addEventListener(
  "click",
  () => {

    chatPanel.hidden =
      !chatPanel.hidden;

  }
);


chatClose.addEventListener(
  "click",
  () => {

    chatPanel.hidden =
      true;

  }
);


/* ---------------- CHAT FORM ---------------- */

chatForm.addEventListener(
  "submit",
  e => {

    e.preventDefault();


    const val =
      chatInput.value.trim();


    if (!val) {
      return;
    }


    addMsg(
      val,
      "user"
    );


    chatInput.value =
      "";


    setTimeout(
      () =>
        addMsg(
          botReply(val),
          "bot"
        ),
      350
    );

  }
);
