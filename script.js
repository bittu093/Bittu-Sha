/* =========================================================
   NORTHEAST UNITY NIGHT 2026
   Registration JavaScript
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

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  mainNav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => mainNav.classList.remove("open"));
  });
}

/* ---------------- WHATSAPP ---------------- */

function waLink(message) {
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const enquiryMsg =
  "Hi! I'd like to know more about Northeast Unity Night 2026.";

["heroWhatsapp", "floatWhatsapp", "footerWhatsapp", "footerWhatsapp2"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.href = waLink(enquiryMsg);
});

/* ---------------- FAQ ---------------- */

document.querySelectorAll(".faq-q").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    const answer = item.querySelector(".faq-a");
    const isOpen = btn.getAttribute("aria-expanded") === "true";

    document.querySelectorAll(".faq-q").forEach(other => {
      other.setAttribute("aria-expanded", "false");
      const a = other.parentElement.querySelector(".faq-a");
      if (a) a.style.maxHeight = null;
    });

    if (!isOpen && answer) {
      btn.setAttribute("aria-expanded", "true");
      answer.style.maxHeight = answer.scrollHeight + 40 + "px";
    }
  });
});

/* ---------------- HELPERS ---------------- */

function toTitleCase(str) {
  return (str || "")
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/* =========================================================
   REGISTRATION FORM
   ========================================================= */

const form = document.getElementById("regForm");

if (!form) {
  console.error("Registration form #regForm was not found.");
} else {
  const steps = Array.from(form.querySelectorAll(".reg-step"));
  const stepIndicators = Array.from(document.querySelectorAll("#regSteps li"));

  let currentStep = 0;
  let uploadedScreenshotFile = null;
  let uploadedPhotoDataUrl = "";

  /* ---------------- STEP CONTROL ---------------- */

  function showStep(index) {
    if (index < 0 || index >= steps.length) return;

    steps.forEach((s, i) => s.classList.toggle("active", i === index));

    stepIndicators.forEach((li, i) => {
      li.classList.toggle("active", i === index);
      li.classList.toggle("done", i < index);
    });

    currentStep = index;

    const fill = document.getElementById("stepsLineFill");
    if (fill && steps.length > 1) {
      fill.style.width = `${(index / (steps.length - 1)) * 100}%`;
    }

    const shell = document.querySelector(".reg-shell");
    if (shell) {
      shell.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* ---------------- VALIDATION ---------------- */

  function validateStep(index) {
    const fields = steps[index].querySelectorAll("[required]");

    for (const field of fields) {
      if (!field.reportValidity()) return false;
    }

    if (index === 1) {
      const txnInput = form.querySelector('input[name="txnId"]');
      const val = txnInput ? txnInput.value.trim() : "";

      if (!/^[A-Za-z0-9]{9,22}$/.test(val)) {
        if (txnInput) {
          txnInput.setCustomValidity(
            "Enter the transaction / UPI reference ID exactly as shown in your UPI app (9–22 letters/numbers, no spaces)."
          );
          txnInput.reportValidity();
          txnInput.addEventListener(
            "input",
            () => txnInput.setCustomValidity(""),
            { once: true }
          );
        }
        return false;
      }

      if (!uploadedScreenshotFile) {
        alert("Please upload your payment screenshot before continuing.");
        return false;
      }

      const used = JSON.parse(
        localStorage.getItem("nun_used_txn_ids") || "[]"
      );

      if (used.includes(val.toLowerCase())) {
        const proceed = confirm(
          "This transaction ID was already used for a registration from this device. If this is a genuine second ticket, press OK to continue — our team will verify both against the actual payment."
        );
        if (!proceed) return false;
      }
    }

    return true;
  }

  /* ---------------- NEXT ---------------- */

  form.querySelectorAll("[data-next]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!validateStep(currentStep)) return;

      if (currentStep === 0) {
        updatePaymentPanel();
      }

      if (currentStep === 1) {
        buildReview();
      }

      if (currentStep < steps.length - 1) {
        showStep(currentStep + 1);
      }
    });
  });

  /* ---------------- BACK ---------------- */

  form.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => {
      showStep(currentStep - 1);
    });
  });

  /* =========================================================
     PROFILE PHOTO
     ========================================================= */

  const photoInput = document.getElementById("photoInput");
  const photoPreview = document.getElementById("photoPreview");
  const photoIcon = document.getElementById("photoIcon");

  if (photoInput) {
    photoInput.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = ev => {
        uploadedPhotoDataUrl = ev.target.result;

        if (photoPreview) {
          photoPreview.src = uploadedPhotoDataUrl;
          photoPreview.hidden = false;
        }

        if (photoIcon) photoIcon.style.display = "none";
      };

      reader.readAsDataURL(file);
    });
  }

  /* =========================================================
     PACKAGE + PAYMENT QR
     ========================================================= */

  function getSelectedPackage() {
    const checked = form.querySelector(
      'input[name="package"]:checked'
    );

    return {
      name: checked ? checked.value : "",
      price: checked ? checked.dataset.price : "0"
    };
  }

  /*
    The payment QR is generated with the selected amount.

    Food + Drinks = ₹1,750
    Food Only     = ₹750

    The QR encodes:
    upi://pay?pa=...&pn=...&am=1750&cu=INR

    If qrcode.min.js is unavailable, the real
    img/payment-qr.png remains visible instead of
    breaking the registration flow.
  */

  function updatePaymentPanel() {
    const pkg = getSelectedPackage();
    const price = pkg.price;

    const payAmount = document.getElementById("payAmount");
    if (payAmount) payAmount.textContent = `₹${price}`;

    const qrBox = document.getElementById("qrcode");
    if (!qrBox) return;

    /*
      IMPORTANT:
      Always use the exact payment QR supplied by the organiser.
      Do NOT generate or replace it with a dynamic QR.
      The selected package amount is shown separately below the QR.
    */
    qrBox.innerHTML = `
      <img
        src="img/payment-qr.png"
        alt="Official UPI payment QR code"
        style="display:block;width:200px;height:200px;object-fit:contain;margin:auto;"
      >
      <p class="dynamic-payment-note">
        <strong>Scan to pay ₹${price}</strong><br>
        Amount will be pre-filled where supported.
      </p>
    `;
  }

  /* =========================================================
     PAYMENT SCREENSHOT
     ========================================================= */

  const screenshotInput =
    document.getElementById("screenshotInput");

  const dropzone =
    document.getElementById("dropzone");

  const dropzoneEmpty =
    document.getElementById("dropzoneEmpty");

  const uploadPreview =
    document.getElementById("uploadPreview");

  function handleScreenshotFile(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a PNG or JPG image.");
      return;
    }

    const ageMinutes =
      (Date.now() - file.lastModified) / 60000;

    const warning =
      document.getElementById("screenshotAgeWarning");

    if (warning) {
      warning.hidden = ageMinutes <= 120;
    }

    const reader = new FileReader();

    reader.onload = ev => {
      uploadedScreenshotFile = file;

      const previewImg =
        document.getElementById("previewImg");

      const uploadFileName =
        document.getElementById("uploadFileName");

      if (previewImg) previewImg.src = ev.target.result;
      if (uploadFileName) uploadFileName.textContent = file.name;

      if (dropzoneEmpty) dropzoneEmpty.hidden = true;
      if (uploadPreview) uploadPreview.hidden = false;
    };

    reader.readAsDataURL(file);
  }

  if (screenshotInput) {
    screenshotInput.addEventListener("change", e => {
      handleScreenshotFile(e.target.files[0]);
    });
  }

  if (dropzone) {
    ["dragenter", "dragover"].forEach(evt => {
      dropzone.addEventListener(evt, e => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach(evt => {
      dropzone.addEventListener(evt, e => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
      });
    });

    dropzone.addEventListener("drop", e => {
      const file = e.dataTransfer.files[0];
      if (file) handleScreenshotFile(file);
    });
  }

  const removeScreenshot =
    document.getElementById("removeScreenshot");

  if (removeScreenshot) {
    removeScreenshot.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      uploadedScreenshotFile = null;

      if (screenshotInput) screenshotInput.value = "";
      if (dropzoneEmpty) dropzoneEmpty.hidden = false;
      if (uploadPreview) uploadPreview.hidden = true;

      const warning =
        document.getElementById("screenshotAgeWarning");

      if (warning) warning.hidden = true;
    });
  }

  /* =========================================================
     REVIEW
     ========================================================= */

  function buildReview() {
    const data = getFormData();
    const panel = document.getElementById("reviewPanel");

    if (!panel) return;

    panel.innerHTML = `
      <div><b>Name</b><span>${escapeHtml(data.fullName)}</span></div>
      <div><b>Age / Gender</b><span>${escapeHtml(data.age)} / ${escapeHtml(data.gender)}</span></div>
      <div><b>WhatsApp</b><span>${escapeHtml(data.mobile)}</span></div>
      <div><b>State</b><span>${escapeHtml(data.state)}</span></div>
      <div><b>Area</b><span>${escapeHtml(data.city)}</span></div>
      <div><b>Package</b><span>${escapeHtml(data.package)}</span></div>
      <div><b>Amount</b><span>₹${escapeHtml(data.amount)}</span></div>
      <div><b>Transaction ID</b><span>${escapeHtml(data.txnId)}</span></div>
    `;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  /* =========================================================
     FORM DATA
     ========================================================= */

  function getFormData() {
    const fd = new FormData(form);
    const pkg = getSelectedPackage();

    return {
      fullName: toTitleCase(fd.get("fullName") || ""),
      age: fd.get("age") || "",
      gender: fd.get("gender") || "",
      mobile: fd.get("mobile") || "",
      email: fd.get("email") || "",
      state: fd.get("state") || "",
      city: fd.get("city") || "",
      package: pkg.name,
      amount: pkg.price,
      txnId: fd.get("txnId") || "",
      id:
        "NUN-" +
        Math.random()
          .toString(36)
          .slice(2, 7)
          .toUpperCase() +
        "-" +
        new Date().getFullYear()
    };
  }

  /* =========================================================
     SUBMIT
     ========================================================= */

  form.addEventListener("submit", async e => {
    e.preventDefault();

    if (!validateStep(2)) return;

    if (!uploadedScreenshotFile) {
      alert(
        "Please upload your payment screenshot in Step 2 before submitting."
      );
      showStep(1);
      return;
    }

    const data = getFormData();

    const used = JSON.parse(
      localStorage.getItem("nun_used_txn_ids") || "[]"
    );

    if (!used.includes(data.txnId.toLowerCase())) {
      used.push(data.txnId.toLowerCase());

      localStorage.setItem(
        "nun_used_txn_ids",
        JSON.stringify(used)
      );
    }

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

    const openWhatsappBtn =
      document.getElementById("openWhatsappBtn");

    if (openWhatsappBtn) {
      openWhatsappBtn.href = whatsappUrl;
    }

    if (CONFIG.GOOGLE_SHEET_ENDPOINT) {
      fetch(CONFIG.GOOGLE_SHEET_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }).catch(() => {});
    }

    /*
      ID card generation must NEVER prevent submission.
      If QRCode or another part fails, the modal still opens.
    */
    try {
      await drawIdCard(data);
    } catch (error) {
      console.error("ID card generation failed:", error);
      drawBasicIdCard(data);
    }

    const successModal =
      document.getElementById("successModal");

    if (successModal) {
      successModal.hidden = false;
    }

    let sharedFileDirectly = false;

    try {
      if (
        navigator.canShare &&
        navigator.canShare({
          files: [uploadedScreenshotFile]
        })
      ) {
        await navigator.share({
          files: [uploadedScreenshotFile],
          title:
            "Northeast Unity Night — Payment Screenshot",
          text: message
        });

        sharedFileDirectly = true;
      }
    } catch (err) {
      /* User cancelled or sharing is unsupported. */
    }

    if (!sharedFileDirectly) {
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
      }, 500);
    }
  });

  /* =========================================================
     ID CARD HELPERS
     ========================================================= */

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* =========================================================
     SAFE EVENT-ID QR
     =========================================================

     IMPORTANT:
     We do NOT create any permanent hidden DIV.

     If the QR library is unavailable, the ID card is still
     generated and submission continues.
  */

  async function makeEventIdQrDataUrl(id) {
    if (typeof QRCode === "undefined") {
      return null;
    }

    /*
      The common qrcode.min.js library creates its own
      canvas/img inside a temporary element.

      The temporary element is ALWAYS removed in finally.
    */
    const temp = document.createElement("div");

    temp.style.position = "fixed";
    temp.style.left = "-10000px";
    temp.style.top = "-10000px";
    temp.style.width = "150px";
    temp.style.height = "150px";
    temp.style.visibility = "hidden";
    temp.style.pointerEvents = "none";

    document.body.appendChild(temp);

    try {
      new QRCode(temp, {
        text: id,
        width: 150,
        height: 150,
        colorDark: "#14110f",
        colorLight: "#ffffff"
      });

      await new Promise(resolve => setTimeout(resolve, 80));

      const qrCanvas = temp.querySelector("canvas");

      if (qrCanvas) {
        return qrCanvas.toDataURL("image/png");
      }

      const qrImg = temp.querySelector("img");

      if (qrImg) {
        if (qrImg.complete) {
          return qrImg.src;
        }

        await new Promise(resolve => {
          qrImg.onload = resolve;
          qrImg.onerror = resolve;
        });

        return qrImg.src;
      }

      return null;

    } catch (error) {
      console.error("Event ID QR generation failed:", error);
      return null;

    } finally {
      /*
        This ALWAYS executes.
        No abandoned -9999px DIVs.
      */
      if (temp.parentNode) {
        temp.parentNode.removeChild(temp);
      }
    }
  }

  /* =========================================================
     FULL ID CARD
     ========================================================= */

  async function drawIdCard(data) {
    const canvas =
      document.getElementById("idCanvas");

    if (!canvas) return;

    const ctx =
      canvas.getContext("2d");

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const grad =
      ctx.createLinearGradient(0, 0, W, H);

    grad.addColorStop(0, "#1c1815");
    grad.addColorStop(1, "#2a231d");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle =
      "rgba(200,155,60,0.5)";

    ctx.lineWidth = 3;

    roundedRect(
      ctx,
      8,
      8,
      W - 16,
      H - 16,
      22
    );

    ctx.stroke();

    /* Top strip */

    const colors = [
      "#c89b3c",
      "#7a2131",
      "#3f5443",
      "#14110f"
    ];

    const stripW = 24;
    const bandH = 34;

    ctx.save();

    ctx.beginPath();
    ctx.rect(8, 8, W - 16, bandH);
    ctx.clip();

    for (
      let x = -bandH, i = 0;
      x < W + bandH;
      x += stripW, i++
    ) {
      ctx.fillStyle =
        colors[i % colors.length];

      ctx.beginPath();

      ctx.moveTo(x, 8);
      ctx.lineTo(x + stripW, 8);
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

    /* Header */

    ctx.textAlign = "center";

    ctx.fillStyle = "#e8c877";
    ctx.font =
      "800 22px 'Work Sans', sans-serif";

    ctx.fillText(
      "NORTHEAST UNITY NIGHT",
      W / 2,
      92
    );

    ctx.fillStyle = "#cfc4ac";
    ctx.font =
      "600 15px 'Work Sans', sans-serif";

    ctx.fillText(
      "OFFICIAL EVENT PASS · 2026",
      W / 2,
      118
    );

    /* Photo circle */

    const cx = W / 2;
    const cy = 250;
    const r = 100;

    ctx.save();

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    if (uploadedPhotoDataUrl) {
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
          (img.width - side) / 2;

        const sy =
          (img.height - side) / 2;

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

      } catch {
        drawMonogram(
          ctx,
          data,
          cx,
          cy,
          r
        );
      }

    } else {
      drawMonogram(
        ctx,
        data,
        cx,
        cy,
        r
      );
    }

    ctx.restore();

    ctx.strokeStyle = "#c89b3c";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    /* Name */

    ctx.fillStyle = "#f4ecdb";
    ctx.font =
      "700 34px 'Fraunces', serif";

    ctx.fillText(
      data.fullName || "Guest",
      W / 2,
      cy + r + 56
    );

    /* Location */

    ctx.fillStyle = "#cfc4ac";
    ctx.font =
      "500 16px 'Work Sans', sans-serif";

    ctx.fillText(
      `${data.state} · ${data.city}`,
      W / 2,
      cy + r + 84
    );

    /* Package */

    const pillW = 220;
    const pillH = 34;
    const pillY =
      cy + r + 106;

    roundedRect(
      ctx,
      W / 2 - pillW / 2,
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

    ctx.lineWidth = 1.5;

    roundedRect(
      ctx,
      W / 2 - pillW / 2,
      pillY,
      pillW,
      pillH,
      17
    );

    ctx.stroke();

    ctx.fillStyle = "#e8c877";
    ctx.font =
      "700 14px 'Work Sans', sans-serif";

    ctx.fillText(
      data.package.toUpperCase(),
      W / 2,
      pillY + 22
    );

    /* Registration ID */

    ctx.strokeStyle =
      "rgba(244,236,219,0.15)";

    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(60, pillY + 66);
    ctx.lineTo(W - 60, pillY + 66);
    ctx.stroke();

    ctx.fillStyle = "#cfc4ac";
    ctx.font =
      "600 13px 'Work Sans', sans-serif";

    ctx.fillText(
      "REGISTRATION ID · UNIQUE & PERMANENT",
      W / 2,
      pillY + 100
    );

    ctx.fillStyle = "#f4ecdb";
    ctx.font =
      "700 26px 'Work Sans', sans-serif";

    ctx.fillText(
      data.id,
      W / 2,
      pillY + 132
    );

    /*
      Event ID QR.

      Failure here does NOT stop ID-card generation.
    */

    const eventQr =
      await makeEventIdQrDataUrl(
        data.id
      );

    if (eventQr) {
      try {
        const qrImg =
          await loadImage(eventQr);

        const qrSize = 150;

        const qrX =
          W / 2 - qrSize / 2;

        const qrY =
          pillY + 156;

        ctx.fillStyle = "#ffffff";

        roundedRect(
          ctx,
          qrX - 10,
          qrY - 10,
          qrSize + 20,
          qrSize + 20,
          10
        );

        ctx.fill();

        ctx.drawImage(
          qrImg,
          qrX,
          qrY,
          qrSize,
          qrSize
        );

      } catch {
        drawIdQrPlaceholder(
          ctx,
          W,
          pillY
        );
      }

    } else {
      drawIdQrPlaceholder(
        ctx,
        W,
        pillY
      );
    }

    /* Pending badge */

    ctx.save();

    ctx.translate(
      W - 96,
      108
    );

    ctx.rotate(
      Math.PI / 4
    );

    ctx.fillStyle = "#e8b45a";
    ctx.fillRect(
      -100,
      -13,
      200,
      26
    );

    ctx.fillStyle = "#14110f";
    ctx.font =
      "800 12px 'Work Sans', sans-serif";

    ctx.fillText(
      "PENDING VERIFICATION",
      0,
      4
    );

    ctx.restore();

    /* Footer */

    ctx.fillStyle = "#8a8070";
    ctx.font =
      "400 13px 'Work Sans', sans-serif";

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

    ctx.textAlign = "left";
  }

  function drawMonogram(
    ctx,
    data,
    cx,
    cy,
    r
  ) {
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

    ctx.fillStyle = mg;

    ctx.fillRect(
      cx - r,
      cy - r,
      r * 2,
      r * 2
    );

    const initials =
      (data.fullName || "G")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join("");

    ctx.fillStyle = "#f4ecdb";
    ctx.font =
      "700 64px 'Fraunces', serif";

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      initials || "G",
      cx,
      cy + 6
    );

    ctx.textBaseline = "alphabetic";
  }

  function drawIdQrPlaceholder(
    ctx,
    W,
    pillY
  ) {
    const size = 150;

    const x =
      W / 2 - size / 2;

    const y =
      pillY + 156;

    ctx.fillStyle = "#ffffff";

    roundedRect(
      ctx,
      x - 10,
      y - 10,
      size + 20,
      size + 20,
      10
    );

    ctx.fill();

    ctx.fillStyle = "#14110f";
    ctx.font =
      "700 14px 'Work Sans', sans-serif";

    ctx.textAlign = "center";

    ctx.fillText(
      "EVENT ID",
      W / 2,
      y + 70
    );

    ctx.fillText(
      "QR",
      W / 2,
      y + 92
    );
  }

  function drawBasicIdCard(data) {
    const canvas =
      document.getElementById("idCanvas");

    if (!canvas) return;

    const ctx =
      canvas.getContext("2d");

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#201b17";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#e8c877";
    ctx.font =
      "800 28px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
      "NORTHEAST UNITY NIGHT",
      W / 2,
      100
    );

    ctx.fillStyle = "#ffffff";
    ctx.font =
      "700 38px Arial";

    ctx.fillText(
      data.fullName || "Guest",
      W / 2,
      220
    );

    ctx.font =
      "600 22px Arial";

    ctx.fillStyle = "#cfc4ac";

    ctx.fillText(
      `${data.state} · ${data.city}`,
      W / 2,
      270
    );

    ctx.fillStyle = "#e8c877";
    ctx.fillText(
      data.id,
      W / 2,
      350
    );

    ctx.fillStyle = "#ffffff";
    ctx.font =
      "600 18px Arial";

    ctx.fillText(
      `Package: ${data.package}`,
      W / 2,
      410
    );

    ctx.fillText(
      `Amount: ₹${data.amount}`,
      W / 2,
      450
    );

    ctx.fillStyle = "#e8b45a";
    ctx.fillText(
      "PENDING VERIFICATION",
      W / 2,
      H - 100
    );
  }

  /* =========================================================
     DOWNLOAD ID
     ========================================================= */

  const downloadIdBtn =
    document.getElementById(
      "downloadIdBtn"
    );

  if (downloadIdBtn) {
    downloadIdBtn.addEventListener(
      "click",
      () => {
        const canvas =
          document.getElementById(
            "idCanvas"
          );

        if (!canvas) return;

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
  }

  /* ---------------- CLOSE MODAL ---------------- */

  const modalClose =
    document.getElementById(
      "modalClose"
    );

  if (modalClose) {
    modalClose.addEventListener(
      "click",
      () => {
        const modal =
          document.getElementById(
            "successModal"
          );

        if (modal) modal.hidden = true;
      }
    );
  }

  /* =========================================================
     CHATBOT
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
        "pay",
        "scan"
      ],
      a:
        "The payment QR is generated for your selected package. Food Only is ₹750 and Food + Drinks is ₹1,750. Compatible UPI apps can open with the correct amount pre-filled."
    },

    {
      k: [
        "amount",
        "pre filled",
        "prefilled"
      ],
      a:
        "Yes. The QR contains the selected amount: ₹750 for Food Only or ₹1,750 for Food + Drinks. Your UPI app may show the amount pre-filled when supported."
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

  function botReply(text) {
    const lower =
      text.toLowerCase();

    const hit =
      KB.find(item =>
        item.k.some(
          kw =>
            lower.includes(kw)
        )
      );

    return hit
      ? hit.a
      : "I couldn't find that in my notes. For anything specific, tap below to message us directly on WhatsApp.";
  }

  function addMsg(
    text,
    from
  ) {
    if (!chatBody) return;

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

  function renderQuickReplies() {
    if (!chatQuick) return;

    chatQuick.innerHTML = "";

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

      b.type = "button";
      b.textContent = label;

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

  renderQuickReplies();

  if (chatToggle && chatPanel) {
    chatToggle.addEventListener(
      "click",
      () => {
        chatPanel.hidden =
          !chatPanel.hidden;
      }
    );
  }

  if (chatClose && chatPanel) {
    chatClose.addEventListener(
      "click",
      () => {
        chatPanel.hidden = true;
      }
    );
  }

  if (chatForm) {
    chatForm.addEventListener(
      "submit",
      e => {

        e.preventDefault();

        const val =
          chatInput
            ? chatInput.value.trim()
            : "";

        if (!val) return;

        addMsg(
          val,
          "user"
        );

        if (chatInput) {
          chatInput.value = "";
        }

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
  }
}
