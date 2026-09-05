/* =========================================================
   NORTHEAST UNITY NIGHT 2026
   COMPLETE REGISTRATION SCRIPT
   ========================================================= */

"use strict";


/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = {
  WHATSAPP_NUMBER: "918660945151",
  UPI_ID: "8660945151@upi",
  PAYEE_NAME: "Northeast Unity Night",
  GOOGLE_SHEET_ENDPOINT: ""
};


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


function escapeHtml(value) {
  return String(value || "").replace(
    /[&<>"']/g,
    function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    }
  );
}


function toTitleCase(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(function (word) {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
      );
    })
    .join(" ");
}


function waLink(message) {
  return (
    "https://wa.me/" +
    CONFIG.WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(message)
  );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

(function setupNavigation() {

  const navToggle = $("navToggle");
  const mainNav = $("mainNav");

  if (!navToggle || !mainNav) {
    return;
  }

  navToggle.addEventListener("click", function () {

    const open =
      mainNav.classList.toggle("open");

    navToggle.setAttribute(
      "aria-expanded",
      String(open)
    );

  });


  mainNav.querySelectorAll("a").forEach(
    function (link) {

      link.addEventListener(
        "click",
        function () {
          mainNav.classList.remove("open");
        }
      );

    }
  );

})();


/* =========================================================
   WHATSAPP LINKS
   ========================================================= */

(function setupWhatsAppLinks() {

  const message =
    "Hi! I'd like to know more about Northeast Unity Night 2026.";

  [
    "heroWhatsapp",
    "floatWhatsapp",
    "footerWhatsapp",
    "footerWhatsapp2"
  ].forEach(function (id) {

    const element = $(id);

    if (element) {
      element.href = waLink(message);
    }

  });

})();


/* =========================================================
   FAQ
   ========================================================= */

(function setupFAQ() {

  document
    .querySelectorAll(".faq-q")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          const parent =
            button.parentElement;

          if (!parent) {
            return;
          }

          const answer =
            parent.querySelector(".faq-a");

          if (!answer) {
            return;
          }

          const isOpen =
            button.getAttribute(
              "aria-expanded"
            ) === "true";


          document
            .querySelectorAll(".faq-q")
            .forEach(function (otherButton) {

              otherButton.setAttribute(
                "aria-expanded",
                "false"
              );

              const otherParent =
                otherButton.parentElement;

              if (!otherParent) {
                return;
              }

              const otherAnswer =
                otherParent.querySelector(
                  ".faq-a"
                );

              if (otherAnswer) {
                otherAnswer.style.maxHeight =
                  null;
              }

            });


          if (!isOpen) {

            button.setAttribute(
              "aria-expanded",
              "true"
            );

            answer.style.maxHeight =
              answer.scrollHeight + 40 + "px";

          }

        }
      );

    });

})();


/* =========================================================
   REGISTRATION FORM
   ========================================================= */

const registrationForm =
  $("regForm");


if (!registrationForm) {

  console.error(
    "NUN ERROR: #regForm was not found."
  );

} else {


  /* =======================================================
     STATE
     ======================================================= */

  const steps =
    Array.from(
      registrationForm.querySelectorAll(
        ".reg-step"
      )
    );


  const stepIndicators =
    Array.from(
      document.querySelectorAll(
        "#regSteps li"
      )
    );


  let currentStep = 0;

  let uploadedScreenshotFile = null;

  let uploadedPhotoDataUrl = "";

  let currentRegistrationData = null;


  /* =======================================================
     SHOW STEP
     ======================================================= */

  function showStep(index) {

    if (!steps.length) {
      return;
    }

    if (
      index < 0 ||
      index >= steps.length
    ) {
      return;
    }


    steps.forEach(
      function (step, i) {

        step.classList.toggle(
          "active",
          i === index
        );

      }
    );


    stepIndicators.forEach(
      function (indicator, i) {

        indicator.classList.toggle(
          "active",
          i === index
        );

        indicator.classList.toggle(
          "done",
          i < index
        );

      }
    );


    currentStep = index;


    const line =
      $("stepsLineFill");


    if (
      line &&
      steps.length > 1
    ) {

      line.style.width =
        (
          index /
          (steps.length - 1)
        ) *
        100 +
        "%";

    }


    const shell =
      document.querySelector(
        ".reg-shell"
      );


    if (shell) {

      shell.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }

  }


  /* =======================================================
     SELECTED PACKAGE
     ======================================================= */

  function getSelectedPackage() {

    const selected =
      registrationForm.querySelector(
        'input[name="package"]:checked'
      );


    return {

      name:
        selected
          ? selected.value
          : "",

      price:
        selected
          ? selected.dataset.price
          : "0"

    };

  }


  /* =======================================================
     PAYMENT QR
     ======================================================= */

  function updatePaymentPanel() {

    const packageData =
      getSelectedPackage();


    const price =
      packageData.price;


    const amountElement =
      $("payAmount");


    if (amountElement) {

      amountElement.textContent =
        "₹" + price;

    }


    const qrBox =
      $("qrcode");


    if (!qrBox) {

      console.warn(
        "NUN: #qrcode not found."
      );

      return;

    }


    /*
      REAL QR FALLBACK

      Keep this file:

      img/payment-qr.png
    */

    const fallback =
      `
      <img
        src="img/payment-qr.png"
        alt="UPI payment QR code"
        style="
          display:block;
          width:200px;
          height:200px;
          object-fit:contain;
          margin:auto;
        "
      >
      `;


    /*
      If qrcode.min.js is not loaded,
      NEVER stop the registration.
    */

    if (
      typeof QRCode === "undefined"
    ) {

      qrBox.innerHTML =
        fallback +
        `
        <p class="dynamic-payment-note">
          <strong>Scan to pay ₹${price}</strong><br>
          Enter ₹${price} manually in your UPI app.
        </p>
        `;

      return;

    }


    const upiURL =
      "upi://pay" +
      "?pa=" +
      encodeURIComponent(
        CONFIG.UPI_ID
      ) +
      "&pn=" +
      encodeURIComponent(
        CONFIG.PAYEE_NAME
      ) +
      "&am=" +
      encodeURIComponent(
        price
      ) +
      "&cu=INR";


    qrBox.innerHTML = "";


    const target =
      document.createElement(
        "div"
      );


    target.setAttribute(
      "aria-label",
      "UPI payment QR for ₹" +
      price
    );


    qrBox.appendChild(
      target
    );


    try {

      new QRCode(
        target,
        {
          text: upiURL,
          width: 200,
          height: 200,
          colorDark: "#14110f",
          colorLight: "#ffffff"
        }
      );

    } catch (error) {

      console.error(
        "NUN: Payment QR failed:",
        error
      );


      qrBox.innerHTML =
        fallback;

    }


    const note =
      document.createElement(
        "p"
      );


    note.className =
      "dynamic-payment-note";


    note.innerHTML =
      `
      <strong>Scan to pay ₹${price}</strong><br>
      Amount will be pre-filled where supported.
      `;


    qrBox.appendChild(
      note
    );

  }


  /* =======================================================
     FORM VALIDATION
     ======================================================= */

  function validateStep(index) {

    const step =
      steps[index];


    if (!step) {
      return false;
    }


    const requiredFields =
      step.querySelectorAll(
        "[required]"
      );


    for (
      const field of requiredFields
    ) {

      if (
        !field.checkValidity()
      ) {

        field.reportValidity();

        return false;

      }

    }


    /*
      PAYMENT STEP
    */

    if (index === 1) {

      const txnInput =
        registrationForm.querySelector(
          'input[name="txnId"]'
        );


      const txnId =
        txnInput
          ? txnInput.value.trim()
          : "";


      if (!txnId) {

        alert(
          "Please enter your transaction / UPI reference ID."
        );


        if (txnInput) {
          txnInput.focus();
        }


        return false;

      }


      if (
        !/^[A-Za-z0-9]{9,22}$/.test(
          txnId
        )
      ) {

        alert(
          "Please enter a valid transaction / UPI reference ID (9–22 letters/numbers, without spaces)."
        );


        if (txnInput) {
          txnInput.focus();
        }


        return false;

      }


      if (
        !uploadedScreenshotFile
      ) {

        alert(
          "Please upload your payment screenshot before continuing."
        );


        return false;

      }

    }


    return true;

  }


  /* =======================================================
     NEXT BUTTONS
     ======================================================= */

  registrationForm
    .querySelectorAll(
      "[data-next]"
    )
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();


          if (
            !validateStep(
              currentStep
            )
          ) {

            return;

          }


          if (
            currentStep === 0
          ) {

            updatePaymentPanel();

          }


          if (
            currentStep === 1
          ) {

            buildReview();

          }


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


  /* =======================================================
     BACK BUTTONS
     ======================================================= */

  registrationForm
    .querySelectorAll(
      "[data-back]"
    )
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

          showStep(
            currentStep - 1
          );

        }
      );

    });


  /* =======================================================
     PROFILE PHOTO
     ======================================================= */

  const photoInput =
    $("photoInput");


  const photoPreview =
    $("photoPreview");


  const photoIcon =
    $("photoIcon");


  if (photoInput) {

    photoInput.addEventListener(
      "change",
      function (event) {

        const file =
          event.target.files[0];


        if (!file) {
          return;
        }


        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          alert(
            "Please select an image file."
          );

          photoInput.value =
            "";

          return;

        }


        const reader =
          new FileReader();


        reader.onload =
          function (event) {

            uploadedPhotoDataUrl =
              event.target.result;


            if (photoPreview) {

              photoPreview.src =
                uploadedPhotoDataUrl;

              photoPreview.hidden =
                false;

            }


            if (photoIcon) {

              photoIcon.style.display =
                "none";

            }

          };


        reader.readAsDataURL(
          file
        );

      }
    );

  }


  /* =======================================================
     SCREENSHOT UPLOAD
     ======================================================= */

  const screenshotInput =
    $("screenshotInput");


  const dropzone =
    $("dropzone");


  const dropzoneEmpty =
    $("dropzoneEmpty");


  const uploadPreview =
    $("uploadPreview");


  function handleScreenshotFile(
    file
  ) {

    if (!file) {
      return;
    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      alert(
        "Please upload a PNG, JPG or image file."
      );

      return;

    }


    uploadedScreenshotFile =
      file;


    const reader =
      new FileReader();


    reader.onload =
      function (event) {

        const previewImg =
          $("previewImg");


        const fileName =
          $("uploadFileName");


        if (previewImg) {

          previewImg.src =
            event.target.result;

        }


        if (fileName) {

          fileName.textContent =
            file.name;

        }


        if (dropzoneEmpty) {

          dropzoneEmpty.hidden =
            true;

        }


        if (uploadPreview) {

          uploadPreview.hidden =
            false;

        }


        const warning =
          $("screenshotAgeWarning");


        if (warning) {

          const ageMinutes =
            (
              Date.now() -
              file.lastModified
            ) /
            60000;


          warning.hidden =
            ageMinutes <= 120;

        }

      };


    reader.readAsDataURL(
      file
    );

  }


  if (screenshotInput) {

    screenshotInput.addEventListener(
      "change",
      function (event) {

        handleScreenshotFile(
          event.target.files[0]
        );

      }
    );

  }


  /* =======================================================
     DRAG & DROP
     ======================================================= */

  if (dropzone) {

    [
      "dragenter",
      "dragover"
    ].forEach(
      function (eventName) {

        dropzone.addEventListener(
          eventName,
          function (event) {

            event.preventDefault();
            event.stopPropagation();

            dropzone.classList.add(
              "dragover"
            );

          }
        );

      }
    );


    [
      "dragleave",
      "drop"
    ].forEach(
      function (eventName) {

        dropzone.addEventListener(
          eventName,
          function (event) {

            event.preventDefault();
            event.stopPropagation();

            dropzone.classList.remove(
              "dragover"
            );

          }
        );

      }
    );


    dropzone.addEventListener(
      "drop",
      function (event) {

        const file =
          event.dataTransfer.files[0];


        if (file) {

          handleScreenshotFile(
            file
          );

        }

      }
    );

  }


  /* =======================================================
     REMOVE SCREENSHOT
     ======================================================= */

  const removeScreenshot =
    $("removeScreenshot");


  if (removeScreenshot) {

    removeScreenshot.addEventListener(
      "click",
      function (event) {

        event.preventDefault();
        event.stopPropagation();


        uploadedScreenshotFile =
          null;


        if (screenshotInput) {

          screenshotInput.value =
            "";

        }


        if (dropzoneEmpty) {

          dropzoneEmpty.hidden =
            false;

        }


        if (uploadPreview) {

          uploadPreview.hidden =
            true;

        }


        const warning =
          $("screenshotAgeWarning");


        if (warning) {

          warning.hidden =
            true;

        }

      }
    );

  }


  /* =======================================================
     GET FORM DATA
     ======================================================= */

  function getFormData() {

    const fd =
      new FormData(
        registrationForm
      );


    const packageData =
      getSelectedPackage();


    return {

      fullName:
        toTitleCase(
          fd.get("fullName") || ""
        ),

      age:
        fd.get("age") || "",

      gender:
        fd.get("gender") || "",

      mobile:
        fd.get("mobile") || "",

      email:
        fd.get("email") || "",

      state:
        fd.get("state") || "",

      city:
        fd.get("city") || "",

      package:
        packageData.name,

      amount:
        packageData.price,

      txnId:
        String(
          fd.get("txnId") || ""
        ).trim(),

      id:
        "NUN-" +
        Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase() +
        "-" +
        new Date().getFullYear()

    };

  }


  /* =======================================================
     REVIEW
     ======================================================= */

  function buildReview() {

    const data =
      getFormData();


    const panel =
      $("reviewPanel");


    if (!panel) {
      return;
    }


    panel.innerHTML =
      `
      <div>
        <b>Name</b>
        <span>${escapeHtml(data.fullName)}</span>
      </div>

      <div>
        <b>Age / Gender</b>
        <span>
          ${escapeHtml(data.age)}
          /
          ${escapeHtml(data.gender)}
        </span>
      </div>

      <div>
        <b>WhatsApp</b>
        <span>${escapeHtml(data.mobile)}</span>
      </div>

      <div>
        <b>Email</b>
        <span>${escapeHtml(data.email || "-")}</span>
      </div>

      <div>
        <b>State</b>
        <span>${escapeHtml(data.state)}</span>
      </div>

      <div>
        <b>Area</b>
        <span>${escapeHtml(data.city)}</span>
      </div>

      <div>
        <b>Package</b>
        <span>${escapeHtml(data.package)}</span>
      </div>

      <div>
        <b>Amount</b>
        <span>₹${escapeHtml(data.amount)}</span>
      </div>

      <div>
        <b>Transaction ID</b>
        <span>${escapeHtml(data.txnId)}</span>
      </div>
      `;

  }


  /* =======================================================
     IMAGE LOADER
     ======================================================= */

  function loadImage(
    source
  ) {

    return new Promise(
      function (resolve, reject) {

        const image =
          new Image();


        image.onload =
          function () {
            resolve(image);
          };


        image.onerror =
          function () {
            reject(
              new Error(
                "Image loading failed."
              )
            );
          };


        image.src =
          source;

      }
    );

  }


  /* =======================================================
     ROUNDED RECTANGLE
     ======================================================= */

  function roundedRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
  ) {

    ctx.beginPath();

    ctx.moveTo(
      x + radius,
      y
    );

    ctx.arcTo(
      x + width,
      y,
      x + width,
      y + height,
      radius
    );

    ctx.arcTo(
      x + width,
      y + height,
      x,
      y + height,
      radius
    );

    ctx.arcTo(
      x,
      y + height,
      x,
      y,
      radius
    );

    ctx.arcTo(
      x,
      y,
      x + width,
      y,
      radius
    );

    ctx.closePath();

  }


  /* =======================================================
     MONOGRAM
     ======================================================= */

  function drawMonogram(
    ctx,
    data,
    x,
    y,
    radius
  ) {

    const gradient =
      ctx.createLinearGradient(
        x - radius,
        y - radius,
        x + radius,
        y + radius
      );


    gradient.addColorStop(
      0,
      "#c89b3c"
    );


    gradient.addColorStop(
      1,
      "#7a2131"
    );


    ctx.fillStyle =
      gradient;


    ctx.fillRect(
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    );


    const initials =
      (data.fullName || "G")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(function (word) {
          return word.charAt(0)
            .toUpperCase();
        })
        .join("");


    ctx.fillStyle =
      "#f4ecdb";


    ctx.font =
      "700 64px Arial";


    ctx.textAlign =
      "center";


    ctx.textBaseline =
      "middle";


    ctx.fillText(
      initials || "G",
      x,
      y
    );


    ctx.textBaseline =
      "alphabetic";

  }


  /* =======================================================
     EVENT QR
     ======================================================= */

  async function makeEventIdQrDataUrl(
    id
  ) {

    if (
      typeof QRCode === "undefined"
    ) {

      return null;

    }


    const temp =
      document.createElement(
        "div"
      );


    temp.style.position =
      "fixed";

    temp.style.left =
      "-10000px";

    temp.style.top =
      "-10000px";

    temp.style.width =
      "150px";

    temp.style.height =
      "150px";

    temp.style.visibility =
      "hidden";

    temp.style.pointerEvents =
      "none";


    document.body.appendChild(
      temp
    );


    try {

      new QRCode(
        temp,
        {
          text: id,
          width: 150,
          height: 150,
          colorDark: "#14110f",
          colorLight: "#ffffff"
        }
      );


      await new Promise(
        function (resolve) {

          setTimeout(
            resolve,
            100
          );

        }
      );


      const canvas =
        temp.querySelector(
          "canvas"
        );


      if (canvas) {

        return canvas.toDataURL(
          "image/png"
        );

      }


      const image =
        temp.querySelector(
          "img"
        );


      if (image) {

        if (!image.complete) {

          await new Promise(
            function (resolve) {

              image.onload =
                resolve;

              image.onerror =
                resolve;

            }
          );

        }


        return image.src;

      }


      return null;

    } catch (error) {

      console.error(
        "NUN: Event QR failed:",
        error
      );


      return null;

    } finally {

      /*
        CRITICAL:
        The temporary QR element is
        ALWAYS removed.
      */

      if (
        temp.parentNode
      ) {

        temp.parentNode.removeChild(
          temp
        );

      }

    }

  }


  /* =======================================================
     ID QR PLACEHOLDER
     ======================================================= */

  function drawIdQrPlaceholder(
    ctx,
    W,
    y
  ) {

    const size =
      150;


    const x =
      W / 2 -
      size / 2;


    const top =
      y + 156;


    ctx.fillStyle =
      "#ffffff";


    roundedRect(
      ctx,
      x - 10,
      top - 10,
      size + 20,
      size + 20,
      10
    );


    ctx.fill();


    ctx.fillStyle =
      "#14110f";


    ctx.font =
      "700 14px Arial";


    ctx.textAlign =
      "center";


    ctx.fillText(
      "EVENT ID",
      W / 2,
      top + 70
    );


    ctx.fillText(
      "QR",
      W / 2,
      top + 92
    );

  }


  /* =======================================================
     BASIC ID CARD FALLBACK
     ======================================================= */

  function drawBasicIdCard(
    data
  ) {

    const canvas =
      $("idCanvas");


    if (!canvas) {
      return;
    }


    const ctx =
      canvas.getContext(
        "2d"
      );


    if (!ctx) {
      return;
    }


    const W =
      canvas.width;


    const H =
      canvas.height;


    ctx.clearRect(
      0,
      0,
      W,
      H
    );


    ctx.fillStyle =
      "#201b17";


    ctx.fillRect(
      0,
      0,
      W,
      H
    );


    ctx.textAlign =
      "center";


    ctx.fillStyle =
      "#e8c877";


    ctx.font =
      "800 28px Arial";


    ctx.fillText(
      "NORTHEAST UNITY NIGHT",
      W / 2,
      100
    );


    ctx.fillStyle =
      "#ffffff";


    ctx.font =
      "700 38px Arial";


    ctx.fillText(
      data.fullName ||
        "Guest",
      W / 2,
      220
    );


    ctx.fillStyle =
      "#cfc4ac";


    ctx.font =
      "600 22px Arial";


    ctx.fillText(
      data.state +
      " · " +
      data.city,
      W / 2,
      270
    );


    ctx.fillStyle =
      "#e8c877";


    ctx.fillText(
      data.id,
      W / 2,
      350
    );


    ctx.fillStyle =
      "#ffffff";


    ctx.font =
      "600 18px Arial";


    ctx.fillText(
      "Package: " +
      data.package,
      W / 2,
      410
    );


    ctx.fillText(
      "Amount: ₹" +
      data.amount,
      W / 2,
      450
    );


    ctx.fillStyle =
      "#e8b45a";


    ctx.fillText(
      "PENDING VERIFICATION",
      W / 2,
      H - 100
    );

  }


  /* =======================================================
     ID CARD
     ======================================================= */

  async function drawIdCard(
    data
  ) {

    const canvas =
      $("idCanvas");


    if (!canvas) {
      return;
    }


    const ctx =
      canvas.getContext(
        "2d"
      );


    if (!ctx) {
      return;
    }


    const W =
      canvas.width;


    const H =
      canvas.height;


    ctx.clearRect(
      0,
      0,
      W,
      H
    );


    /* Background */

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        W,
        H
      );


    gradient.addColorStop(
      0,
      "#1c1815"
    );


    gradient.addColorStop(
      1,
      "#2a231d"
    );


    ctx.fillStyle =
      gradient;


    ctx.fillRect(
      0,
      0,
      W,
      H
    );


    /* Border */

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


    /* Top decorative strip */

    const colors = [
      "#c89b3c",
      "#7a2131",
      "#3f5443",
      "#14110f"
    ];


    const stripWidth =
      24;


    const bandHeight =
      34;


    ctx.save();


    ctx.beginPath();


    ctx.rect(
      8,
      8,
      W - 16,
      bandHeight
    );


    ctx.clip();


    for (
      let x = -bandHeight,
        i = 0;
      x < W + bandHeight;
      x += stripWidth,
        i++
    ) {

      ctx.fillStyle =
        colors[
          i % colors.length
        ];


      ctx.beginPath();


      ctx.moveTo(
        x,
        8
      );


      ctx.lineTo(
        x + stripWidth,
        8
      );


      ctx.lineTo(
        x + stripWidth - 14,
        8 + bandHeight
      );


      ctx.lineTo(
        x - 14,
        8 + bandHeight
      );


      ctx.closePath();


      ctx.fill();

    }


    ctx.restore();


    /* Header */

    ctx.textAlign =
      "center";


    ctx.fillStyle =
      "#e8c877";


    ctx.font =
      "800 22px Arial";


    ctx.fillText(
      "NORTHEAST UNITY NIGHT",
      W / 2,
      92
    );


    ctx.fillStyle =
      "#cfc4ac";


    ctx.font =
      "600 15px Arial";


    ctx.fillText(
      "OFFICIAL EVENT PASS · 2026",
      W / 2,
      118
    );


    /* Photo */

    const cx =
      W / 2;


    const cy =
      250;


    const radius =
      100;


    ctx.save();


    ctx.beginPath();


    ctx.arc(
      cx,
      cy,
      radius,
      0,
      Math.PI * 2
    );


    ctx.clip();


    if (
      uploadedPhotoDataUrl
    ) {

      try {

        const photo =
          await loadImage(
            uploadedPhotoDataUrl
          );


        const side =
          Math.min(
            photo.width,
            photo.height
          );


        const sx =
          (photo.width - side) /
          2;


        const sy =
          (photo.height - side) /
          2;


        ctx.drawImage(
          photo,
          sx,
          sy,
          side,
          side,
          cx - radius,
          cy - radius,
          radius * 2,
          radius * 2
        );

      } catch (error) {

        drawMonogram(
          ctx,
          data,
          cx,
          cy,
          radius
        );

      }

    } else {

      drawMonogram(
        ctx,
        data,
        cx,
        cy,
        radius
      );

    }


    ctx.restore();


    /* Photo border */

    ctx.strokeStyle =
      "#c89b3c";


    ctx.lineWidth =
      4;


    ctx.beginPath();


    ctx.arc(
      cx,
      cy,
      radius,
      0,
      Math.PI * 2
    );


    ctx.stroke();


    /* Name */

    ctx.fillStyle =
      "#f4ecdb";


    ctx.font =
      "700 34px Arial";


    ctx.fillText(
      data.fullName ||
        "Guest",
      W / 2,
      cy + radius + 56
    );


    /* Location */

    ctx.fillStyle =
      "#cfc4ac";


    ctx.font =
      "500 16px Arial";


    ctx.fillText(
      data.state +
      " · " +
      data.city,
      W / 2,
      cy + radius + 84
    );


    /* Package pill */

    const pillWidth =
      220;


    const pillHeight =
      34;


    const pillY =
      cy +
      radius +
      106;


    roundedRect(
      ctx,
      W / 2 -
        pillWidth / 2,
      pillY,
      pillWidth,
      pillHeight,
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
        pillWidth / 2,
      pillY,
      pillWidth,
      pillHeight,
      17
    );


    ctx.stroke();


    ctx.fillStyle =
      "#e8c877";


    ctx.font =
      "700 14px Arial";


    ctx.fillText(
      String(
        data.package || ""
      ).toUpperCase(),
      W / 2,
      pillY + 22
    );


    /* ID separator */

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


    /* ID label */

    ctx.fillStyle =
      "#cfc4ac";


    ctx.font =
      "600 13px Arial";


    ctx.fillText(
      "REGISTRATION ID · UNIQUE & PERMANENT",
      W / 2,
      pillY + 100
    );


    /* ID number */

    ctx.fillStyle =
      "#f4ecdb";


    ctx.font =
      "700 26px Arial";


    ctx.fillText(
      data.id,
      W / 2,
      pillY + 132
    );


    /* Event QR */

    let qrData =
      null;


    try {

      qrData =
        await makeEventIdQrDataUrl(
          data.id
        );

    } catch (error) {

      console.error(
        "NUN: QR creation failed:",
        error
      );

      qrData =
        null;

    }


    if (qrData) {

      try {

        const qrImage =
          await loadImage(
            qrData
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


        ctx.drawImage(
          qrImage,
          qrX,
          qrY,
          qrSize,
          qrSize
        );

      } catch (error) {

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
      "800 12px Arial";


    ctx.fillText(
      "PENDING VERIFICATION",
      0,
      4
    );


    ctx.restore();


    /* Footer */

    ctx.fillStyle =
      "#8a8070";


    ctx.font =
      "400 13px Arial";


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


  /* =======================================================
     FINAL SUBMIT
     =======================================================

     IMPORTANT:
     This handler deliberately does NOT allow:
     - QR errors
     - ID card errors
     - WhatsApp errors
     - Google Sheet errors

     to stop the registration success screen.
     ======================================================= */

  registrationForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();
      event.stopPropagation();


      console.log(
        "NUN: FORM SUBMIT STARTED"
      );


      /* ---------------------------------------------------
         CHECK FORM FIELDS
         --------------------------------------------------- */

      for (
        const field of
        registrationForm.querySelectorAll(
          "[required]"
        )
      ) {

        if (
          !field.checkValidity()
        ) {

          field.reportValidity();

          console.log(
            "NUN: Missing required field:",
            field.name ||
            field.id
          );

          return;

        }

      }


      /* ---------------------------------------------------
         PACKAGE
         --------------------------------------------------- */

      const packageData =
        getSelectedPackage();


      if (
        !packageData.name
      ) {

        alert(
          "Please select a package."
        );

        return;

      }


      /* ---------------------------------------------------
         TRANSACTION ID
         --------------------------------------------------- */

      const txnInput =
        registrationForm.querySelector(
          'input[name="txnId"]'
        );


      const txnId =
        txnInput
          ? txnInput.value.trim()
          : "";


      if (!txnId) {

        alert(
          "Please enter your transaction / UPI reference ID."
        );


        if (txnInput) {
          txnInput.focus();
        }


        return;

      }


      if (
        !/^[A-Za-z0-9]{9,22}$/.test(
          txnId
        )
      ) {

        alert(
          "Please enter a valid transaction / UPI reference ID (9–22 letters/numbers, no spaces)."
        );


        if (txnInput) {
          txnInput.focus();
        }


        return;

      }


      /* ---------------------------------------------------
         SCREENSHOT
         --------------------------------------------------- */

      if (
        !uploadedScreenshotFile
      ) {

        alert(
          "Please upload your payment screenshot before submitting."
        );


        showStep(1);


        return;

      }


      /* ---------------------------------------------------
         COLLECT DATA
         --------------------------------------------------- */

      const data =
        getFormData();


      currentRegistrationData =
        data;


      console.log(
        "NUN: Registration data:",
        data
      );


      /* ---------------------------------------------------
         SAVE TRANSACTION LOCALLY
         --------------------------------------------------- */

      try {

        let transactions =
          JSON.parse(
            localStorage.getItem(
              "nun_used_txn_ids"
            ) || "[]"
          );


        if (
          !transactions.includes(
            txnId.toLowerCase()
          )
        ) {

          transactions.push(
            txnId.toLowerCase()
          );


          localStorage.setItem(
            "nun_used_txn_ids",
            JSON.stringify(
              transactions
            )
          );

        }

      } catch (error) {

        console.warn(
          "NUN: Local storage unavailable.",
          error
        );

      }


      /* ---------------------------------------------------
         WHATSAPP MESSAGE
         --------------------------------------------------- */

      const message =
`New Registration — Northeast Unity Night 2026

STATUS: PENDING VERIFICATION

Registration ID: ${data.id}

Name: ${data.fullName}

Age / Gender: ${data.age} / ${data.gender}

WhatsApp: ${data.mobile}

Email: ${data.email || "-"}

State: ${data.state}

Area: ${data.city}

Package: ${data.package}

Amount: ₹${data.amount}

Transaction / UPI Ref ID: ${data.txnId}

Payment screenshot has been uploaded.

Please verify the transaction against the actual payment received before confirming the registration.`;


      const whatsappURL =
        waLink(message);


      /* ---------------------------------------------------
         SET WHATSAPP BUTTON
         --------------------------------------------------- */

      const whatsappButton =
        $("openWhatsappBtn");


      if (whatsappButton) {

        whatsappButton.href =
          whatsappURL;


        whatsappButton.target =
          "_blank";


        whatsappButton.rel =
          "noopener noreferrer";

      }


      /* ---------------------------------------------------
         GOOGLE SHEET
         ---------------------------------------------------

         Optional.

         If endpoint is empty, nothing happens.

         If endpoint fails, registration still succeeds.
         --------------------------------------------------- */

      if (
        CONFIG.GOOGLE_SHEET_ENDPOINT
      ) {

        try {

          fetch(
            CONFIG.GOOGLE_SHEET_ENDPOINT,
            {
              method: "POST",

              mode: "no-cors",

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
            function (error) {

              console.warn(
                "NUN: Google Sheet error:",
                error
              );

            }
          );

        } catch (error) {

          console.warn(
            "NUN: Google Sheet unavailable:",
            error
          );

        }

      }


      /* ---------------------------------------------------
         ID CARD

         NEVER BLOCK SUBMISSION.
         --------------------------------------------------- */

      try {

        await drawIdCard(
          data
        );

      } catch (error) {

        console.error(
          "NUN: ID card error:",
          error
        );


        try {

          drawBasicIdCard(
            data
          );

        } catch (fallbackError) {

          console.error(
            "NUN: Basic ID card error:",
            fallbackError
          );

        }

      }


      /* ---------------------------------------------------
         SUCCESS MODAL

         THIS IS THE IMPORTANT PART.

         It runs regardless of ID QR failure.
         --------------------------------------------------- */

      const successModal =
        $("successModal");


      if (successModal) {

        successModal.hidden =
          false;


        /*
          Also make sure the modal is visible
          if CSS has display rules.
        */

        successModal.classList.add(
          "show"
        );

      }


      /* ---------------------------------------------------
         SHOW REGISTRATION ID
         --------------------------------------------------- */

      document
        .querySelectorAll(
          "[data-registration-id]"
        )
        .forEach(
          function (element) {

            element.textContent =
              data.id;

          }
        );


      /* ---------------------------------------------------
         OPEN WHATSAPP

         If browser blocks popup, user can
         click the WhatsApp button in modal.
         --------------------------------------------------- */

      setTimeout(
        function () {

          try {

            const newWindow =
              window.open(
                whatsappURL,
                "_blank"
              );


            if (!newWindow) {

              console.log(
                "NUN: Popup blocked. Use the WhatsApp button in the success modal."
              );

            }

          } catch (error) {

            console.warn(
              "NUN: Could not open WhatsApp:",
              error
            );

          }

        },
        700
      );


      console.log(
        "NUN: FORM SUBMITTED SUCCESSFULLY",
        data.id
      );

    }
  );


  /* =======================================================
     DOWNLOAD ID CARD
     ======================================================= */

  const downloadButton =
    $("downloadIdBtn");


  if (downloadButton) {

    downloadButton.addEventListener(
      "click",
      function (event) {

        event.preventDefault();


        const canvas =
          $("idCanvas");


        if (!canvas) {

          alert(
            "ID card is not available."
          );

          return;

        }


        try {

          const link =
            document.createElement(
              "a"
            );


          link.download =
            "northeast-unity-night-" +
            (
              currentRegistrationData
                ? currentRegistrationData.id
                : "id"
            ) +
            ".png";


          link.href =
            canvas.toDataURL(
              "image/png"
            );


          document.body.appendChild(
            link
          );


          link.click();


          link.remove();

        } catch (error) {

          console.error(
            "NUN: ID download failed:",
            error
          );

          alert(
            "Unable to download the ID card."
          );

        }

      }
    );

  }


  /* =======================================================
     CLOSE SUCCESS MODAL
     ======================================================= */

  const modalClose =
    $("modalClose");


  if (modalClose) {

    modalClose.addEventListener(
      "click",
      function (event) {

        event.preventDefault();


        const modal =
          $("successModal");


        if (modal) {

          modal.hidden =
            true;


          modal.classList.remove(
            "show"
          );

        }

      }
    );

  }


  /* =======================================================
     PACKAGE CHANGE
     ======================================================= */

  registrationForm
    .querySelectorAll(
      'input[name="package"]'
    )
    .forEach(
      function (radio) {

        radio.addEventListener(
          "change",
          function () {

            /*
              Only update the QR if
              payment section exists.
            */

            updatePaymentPanel();

          }
        );

      }
    );


  /* =======================================================
     CHATBOT
     ======================================================= */

  const chatToggle =
    $("chatToggle");


  const chatPanel =
    $("chatPanel");


  const chatClose =
    $("chatClose");


  const chatBody =
    $("chatBody");


  const chatForm =
    $("chatForm");


  const chatInput =
    $("chatInput");


  const chatQuick =
    $("chatQuick");


  const KB = [

    {
      keywords: [
        "price",
        "cost",
        "how much",
        "ticket",
        "package"
      ],

      answer:
        "There are two packages: Food + Drinks for ₹1,750 per person, and Food Only for ₹750 per person."
    },


    {
      keywords: [
        "payment",
        "upi",
        "qr",
        "pay",
        "scan"
      ],

      answer:
        "Choose your package first. The QR will show the selected amount: ₹1,750 for Food + Drinks or ₹750 for Food Only."
    },


    {
      keywords: [
        "register",
        "registration",
        "sign up"
      ],

      answer:
        "Fill in your details, select your package, make the UPI payment, upload your payment screenshot and transaction ID, then submit the registration."
    },


    {
      keywords: [
        "verify",
        "verification",
        "confirm",
        "pending"
      ],

      answer:
        "Registrations are manually checked against the actual payment received. Your registration remains pending until the payment is verified."
    },


    {
      keywords: [
        "id",
        "entry",
        "proof",
        "document"
      ],

      answer:
        "Carry a valid government photo ID and your event ID when attending."
    },


    {
      keywords: [
        "refund",
        "cancel"
      ],

      answer:
        "Registrations are non-refundable and non-transferable once confirmed."
    },


    {
      keywords: [
        "states",
        "northeast"
      ],

      answer:
        "Northeast Unity Night represents Assam, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, Arunachal Pradesh and Sikkim."
    },


    {
      keywords: [
        "venue",
        "location",
        "where"
      ],

      answer:
        "The event is in Bengaluru. Please check the event page for the latest venue information."
    }

  ];


  function botReply(
    text
  ) {

    const lower =
      String(text || "")
        .toLowerCase();


    const result =
      KB.find(
        function (item) {

          return item.keywords.some(
            function (keyword) {

              return lower.includes(
                keyword
              );

            }
          );

        }
      );


    return result
      ? result.answer
      : "I couldn't find that information. Please contact us on WhatsApp for specific questions.";

  }


  function addChatMessage(
    text,
    sender
  ) {

    if (!chatBody) {
      return;
    }


    const element =
      document.createElement(
        "div"
      );


    element.className =
      "chat-msg " +
      sender;


    element.textContent =
      text;


    chatBody.appendChild(
      element
    );


    chatBody.scrollTop =
      chatBody.scrollHeight;

  }


  function renderQuickReplies() {

    if (!chatQuick) {
      return;
    }


    chatQuick.innerHTML =
      "";


    [
      "Pricing",
      "Payment",
      "How to register",
      "Verification",
      "Talk to a human"
    ].forEach(
      function (label) {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.textContent =
          label;


        button.addEventListener(
          "click",
          function () {

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


            addChatMessage(
              label,
              "user"
            );


            setTimeout(
              function () {

                addChatMessage(
                  botReply(
                    label
                  ),
                  "bot"
                );

              },
              300
            );

          }
        );


        chatQuick.appendChild(
          button
        );

      }
    );

  }


  renderQuickReplies();


  if (
    chatToggle &&
    chatPanel
  ) {

    chatToggle.addEventListener(
      "click",
      function () {

        chatPanel.hidden =
          !chatPanel.hidden;

      }
    );

  }


  if (
    chatClose &&
    chatPanel
  ) {

    chatClose.addEventListener(
      "click",
      function () {

        chatPanel.hidden =
          true;

      }
    );

  }


  if (chatForm) {

    chatForm.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();


        const value =
          chatInput
            ? chatInput.value.trim()
            : "";


        if (!value) {
          return;
        }


        addChatMessage(
          value,
          "user"
        );


        if (chatInput) {

          chatInput.value =
            "";

        }


        setTimeout(
          function () {

            addChatMessage(
              botReply(value),
              "bot"
            );

          },
          350
        );

      }
    );

  }


  /* =======================================================
     INITIAL STATE
     ======================================================= */

  showStep(0);


  console.log(
    "NUN: Northeast Unity Night 2026 script loaded."
  );

}
