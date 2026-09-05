/* =========================================================
   NORTHEAST UNITY NIGHT 2026
   COMPLETE script.js
   ========================================================= */

const CONFIG = {
  WHATSAPP_NUMBER: "918660945151",
  UPI_ID: "8660945151@upi",
  PAYEE_NAME: "Northeast Unity Night",
  GOOGLE_SHEET_ENDPOINT: ""
};


/* =========================================================
   GENERAL HELPERS
   ========================================================= */

function escapeHtml(value) {
  return String(value ?? "").replace(
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

function toTitleCase(str) {
  return String(str || "")
    .trim()
    .split(/\s+/)
    .map(function (word) {
      return word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase();
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

const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", function () {
    const isOpen =
      mainNav.classList.toggle("open");

    navToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });

  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("open");
    });
  });
}


/* =========================================================
   WHATSAPP BUTTONS
   ========================================================= */

const enquiryMessage =
  "Hi! I'd like to know more about Northeast Unity Night 2026.";

[
  "heroWhatsapp",
  "floatWhatsapp",
  "footerWhatsapp",
  "footerWhatsapp2"
].forEach(function (id) {
  const element =
    document.getElementById(id);

  if (element) {
    element.href =
      waLink(enquiryMessage);
  }
});


/* =========================================================
   FAQ
   ========================================================= */

document.querySelectorAll(".faq-q").forEach(function (button) {

  button.addEventListener("click", function () {

    const item =
      button.parentElement;

    const answer =
      item
        ? item.querySelector(".faq-a")
        : null;

    const currentlyOpen =
      button.getAttribute("aria-expanded") === "true";

    document.querySelectorAll(".faq-q").forEach(function (otherButton) {

      otherButton.setAttribute(
        "aria-expanded",
        "false"
      );

      const otherAnswer =
        otherButton.parentElement
          ? otherButton.parentElement.querySelector(".faq-a")
          : null;

      if (otherAnswer) {
        otherAnswer.style.maxHeight = null;
      }
    });

    if (!currentlyOpen && answer) {

      button.setAttribute(
        "aria-expanded",
        "true"
      );

      answer.style.maxHeight =
        answer.scrollHeight + 40 + "px";
    }
  });

});


/* =========================================================
   REGISTRATION FORM
   ========================================================= */

const form =
  document.getElementById("regForm");

if (form) {

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


  /* =======================================================
     STEP CONTROL
     ======================================================= */

  function showStep(index) {

    if (
      index < 0 ||
      index >= steps.length
    ) {
      return;
    }

    steps.forEach(function (step, i) {

      step.classList.toggle(
        "active",
        i === index
      );

    });

    stepIndicators.forEach(function (indicator, i) {

      indicator.classList.toggle(
        "active",
        i === index
      );

      indicator.classList.toggle(
        "done",
        i < index
      );

    });

    currentStep = index;

    const progress =
      document.getElementById(
        "stepsLineFill"
      );

    if (
      progress &&
      steps.length > 1
    ) {

      progress.style.width =
        (index / (steps.length - 1)) *
        100 +
        "%";
    }

    const registrationShell =
      document.querySelector(
        ".reg-shell"
      );

    if (registrationShell) {

      registrationShell.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }
  }


  /* =======================================================
     PACKAGE
     ======================================================= */

  function getSelectedPackage() {

    const selected =
      form.querySelector(
        'input[name="package"]:checked'
      );

    return {
      name: selected
        ? selected.value
        : "",

      price: selected
        ? selected.dataset.price
        : "0"
    };
  }


  /* =======================================================
     PAYMENT PANEL
     ======================================================= */

  function updatePaymentPanel() {

    const packageData =
      getSelectedPackage();

    const price =
      packageData.price;

    const payAmount =
      document.getElementById(
        "payAmount"
      );

    if (payAmount) {

      payAmount.textContent =
        "₹" + price;

    }

    const qrBox =
      document.getElementById(
        "qrcode"
      );

    if (!qrBox) {
      return;
    }


    /*
      REAL STATIC QR FALLBACK

      This image must exist here:

      img/payment-qr.png
    */

    const fallbackQR = `
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
      />
    `;


    /*
      IMPORTANT FIX

      If qrcode.min.js does not load,
      the page MUST NOT stop.

      The Continue button will still work.
    */

    if (
      typeof QRCode === "undefined"
    ) {

      qrBox.innerHTML =
        fallbackQR +
        `
        <p class="dynamic-payment-note">
          <strong>Scan to pay ₹${price}</strong><br>
          Please enter ₹${price} manually in your UPI app.
        </p>
        `;

      return;
    }


    /*
      DYNAMIC UPI PAYMENT LINK
    */

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


    const qrTarget =
      document.createElement("div");

    qrTarget.id =
      "dynamicPaymentQr";

    qrTarget.setAttribute(
      "aria-label",
      "UPI payment QR for ₹" + price
    );

    qrBox.appendChild(
      qrTarget
    );


    try {

      new QRCode(
        qrTarget,
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
        "Payment QR generation failed:",
        error
      );

      qrBox.innerHTML =
        fallbackQR;
    }


    const note =
      document.createElement("p");

    note.className =
      "dynamic-payment-note";

    note.innerHTML =
      `
      <strong>Scan to pay ₹${price}</strong><br>
      Amount will be pre-filled in your UPI app.
      `;

    qrBox.appendChild(
      note
    );
  }


  /* =======================================================
     STEP VALIDATION
     ======================================================= */

  function validateStep(index) {

    if (
      !steps[index]
    ) {
      return false;
    }

    const requiredFields =
      steps[index].querySelectorAll(
        "[required]"
      );

    for (
      const field of requiredFields
    ) {

      if (
        !field.reportValidity()
      ) {
        return false;
      }
    }


    /*
      PAYMENT STEP
    */

    if (index === 1) {

      const transactionInput =
        form.querySelector(
          'input[name="txnId"]'
        );

      const transactionId =
        transactionInput
          ? transactionInput.value.trim()
          : "";


      if (
        !/^[A-Za-z0-9]{9,22}$/.test(
          transactionId
        )
      ) {

        if (transactionInput) {

          transactionInput.setCustomValidity(
            "Enter a valid transaction / UPI reference ID (9–22 letters or numbers, no spaces)."
          );

          transactionInput.reportValidity();

          transactionInput.addEventListener(
            "input",
            function () {
              transactionInput.setCustomValidity("");
            },
            {
              once: true
            }
          );
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


      /*
        Duplicate transaction warning
      */

      const usedTransactions =
        JSON.parse(
          localStorage.getItem(
            "nun_used_txn_ids"
          ) || "[]"
        );

      if (
        usedTransactions.includes(
          transactionId.toLowerCase()
        )
      ) {

        const continueAnyway =
          confirm(
            "This transaction ID was already used on this device. If this is a genuine second registration, press OK to continue. The organising team will verify the payment."
          );

        if (!continueAnyway) {
          return false;
        }
      }
    }


    return true;
  }


  /* =======================================================
     NEXT BUTTONS
     ======================================================= */

  form
    .querySelectorAll("[data-next]")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          if (
            !validateStep(
              currentStep
            )
          ) {
            return;
          }


          /*
            Step 1 -> Payment

            QR generation is now SAFE.
          */

          if (
            currentStep === 0
          ) {

            updatePaymentPanel();

          }


          /*
            Payment -> Review
          */

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

  form
    .querySelectorAll("[data-back]")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

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

          photoInput.value = "";

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
     PAYMENT SCREENSHOT
     ======================================================= */

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


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      alert(
        "Please upload a PNG or JPG image."
      );

      return;
    }


    const reader =
      new FileReader();


    reader.onload =
      function (event) {

        uploadedScreenshotFile =
          file;


        const previewImg =
          document.getElementById(
            "previewImg"
          );

        const fileName =
          document.getElementById(
            "uploadFileName"
          );


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
    ].forEach(function (eventName) {

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

    });


    [
      "dragleave",
      "drop"
    ].forEach(function (eventName) {

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

    });


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
    document.getElementById(
      "removeScreenshot"
    );


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

      }
    );

  }


  /* =======================================================
     GET FORM DATA
     ======================================================= */

  function getFormData() {

    const formData =
      new FormData(form);

    const packageData =
      getSelectedPackage();


    const generatedId =
      "NUN-" +
      Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase() +
      "-" +
      new Date()
        .getFullYear();


    return {

      fullName:
        toTitleCase(
          formData.get(
            "fullName"
          ) || ""
        ),

      age:
        formData.get(
          "age"
        ) || "",

      gender:
        formData.get(
          "gender"
        ) || "",

      mobile:
        formData.get(
          "mobile"
        ) || "",

      email:
        formData.get(
          "email"
        ) || "",

      state:
        formData.get(
          "state"
        ) || "",

      city:
        formData.get(
          "city"
        ) || "",

      package:
        packageData.name,

      amount:
        packageData.price,

      txnId:
        formData.get(
          "txnId"
        ) || "",

      id:
        generatedId
    };
  }


  /* =======================================================
     REVIEW
     ======================================================= */

  function buildReview() {

    const data =
      getFormData();


    const reviewPanel =
      document.getElementById(
        "reviewPanel"
      );


    if (!reviewPanel) {
      return;
    }


    reviewPanel.innerHTML =
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
     LOAD IMAGE
     ======================================================= */

  function loadImage(src) {

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
                "Image could not be loaded."
              )
            );
          };


        image.src =
          src;

      }
    );
  }


  /* =======================================================
     ROUNDED RECT
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
     DRAW MONOGRAM
     ======================================================= */

  function drawMonogram(
    ctx,
    data,
    centerX,
    centerY,
    radius
  ) {

    const gradient =
      ctx.createLinearGradient(
        centerX - radius,
        centerY - radius,
        centerX + radius,
        centerY + radius
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
      centerX - radius,
      centerY - radius,
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
      "700 64px 'Fraunces', serif";


    ctx.textAlign =
      "center";


    ctx.textBaseline =
      "middle";


    ctx.fillText(
      initials || "G",
      centerX,
      centerY
    );


    ctx.textBaseline =
      "alphabetic";
  }


  /* =======================================================
     CREATE EVENT ID QR
     =======================================================

     VERY IMPORTANT:

     This creates a temporary element only while
     generating the QR.

     finally{} ALWAYS removes it.

     So you will NOT get lots of:

     <div style="position: fixed; left: -9999px">

     elements left behind.
     ======================================================= */

  async function makeEventIdQrDataUrl(
    id
  ) {

    if (
      typeof QRCode === "undefined"
    ) {

      return null;
    }


    const temporary =
      document.createElement(
        "div"
      );


    temporary.style.position =
      "fixed";

    temporary.style.left =
      "-10000px";

    temporary.style.top =
      "-10000px";

    temporary.style.width =
      "150px";

    temporary.style.height =
      "150px";

    temporary.style.visibility =
      "hidden";

    temporary.style.pointerEvents =
      "none";


    document.body.appendChild(
      temporary
    );


    try {

      new QRCode(
        temporary,
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
        temporary.querySelector(
          "canvas"
        );


      if (canvas) {

        return canvas.toDataURL(
          "image/png"
        );

      }


      const image =
        temporary.querySelector(
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
        "Event QR generation failed:",
        error
      );

      return null;

    } finally {

      /*
        THIS IS THE IMPORTANT FIX.
        The temporary QR div is ALWAYS removed.
      */

      if (
        temporary.parentNode
      ) {

        temporary.parentNode.removeChild(
          temporary
        );

      }

    }
  }


  /* =======================================================
     QR PLACEHOLDER
     ======================================================= */

  function drawIdQrPlaceholder(
    ctx,
    width,
    pillY
  ) {

    const size =
      150;

    const x =
      width / 2 -
      size / 2;

    const y =
      pillY + 156;


    ctx.fillStyle =
      "#ffffff";


    roundedRect(
      ctx,
      x - 10,
      y - 10,
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
      width / 2,
      y + 70
    );


    ctx.fillText(
      "QR",
      width / 2,
      y + 92
    );
  }


  /* =======================================================
     DRAW ID CARD
     ======================================================= */

  async function drawIdCard(
    data
  ) {

    const canvas =
      document.getElementById(
        "idCanvas"
      );


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


    const width =
      canvas.width;

    const height =
      canvas.height;


    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    /* ---------------- BACKGROUND ---------------- */

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        width,
        height
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
      width,
      height
    );


    /* ---------------- BORDER ---------------- */

    ctx.strokeStyle =
      "rgba(200,155,60,0.5)";


    ctx.lineWidth =
      3;


    roundedRect(
      ctx,
      8,
      8,
      width - 16,
      height - 16,
      22
    );


    ctx.stroke();


    /* ---------------- TOP BAND ---------------- */

    const bandColors = [
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
      width - 16,
      bandHeight
    );


    ctx.clip();


    for (
      let x = -bandHeight, i = 0;
      x < width + bandHeight;
      x += stripWidth, i++
    ) {

      ctx.fillStyle =
        bandColors[
          i % bandColors.length
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


    /* ---------------- TITLE ---------------- */

    ctx.textAlign =
      "center";


    ctx.fillStyle =
      "#e8c877";


    ctx.font =
      "800 22px Arial";


    ctx.fillText(
      "NORTHEAST UNITY NIGHT",
      width / 2,
      92
    );


    ctx.fillStyle =
      "#cfc4ac";


    ctx.font =
      "600 15px Arial";


    ctx.fillText(
      "OFFICIAL EVENT PASS · 2026",
      width / 2,
      118
    );


    /* ---------------- PHOTO ---------------- */

    const centerX =
      width / 2;

    const centerY =
      250;

    const radius =
      100;


    ctx.save();


    ctx.beginPath();


    ctx.arc(
      centerX,
      centerY,
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


        const square =
          Math.min(
            photo.width,
            photo.height
          );


        const sourceX =
          (photo.width - square) /
          2;


        const sourceY =
          (photo.height - square) /
          2;


        ctx.drawImage(
          photo,
          sourceX,
          sourceY,
          square,
          square,
          centerX - radius,
          centerY - radius,
          radius * 2,
          radius * 2
        );


      } catch (error) {

        drawMonogram(
          ctx,
          data,
          centerX,
          centerY,
          radius
        );

      }

    } else {

      drawMonogram(
        ctx,
        data,
        centerX,
        centerY,
        radius
      );

    }


    ctx.restore();


    ctx.strokeStyle =
      "#c89b3c";


    ctx.lineWidth =
      4;


    ctx.beginPath();


    ctx.arc(
      centerX,
      centerY,
      radius,
      0,
      Math.PI * 2
    );


    ctx.stroke();


    /* ---------------- NAME ---------------- */

    ctx.fillStyle =
      "#f4ecdb";


    ctx.font =
      "700 34px Arial";


    ctx.fillText(
      data.fullName ||
        "Guest",

      width / 2,
      centerY + radius + 56
    );


    /* ---------------- LOCATION ---------------- */

    ctx.fillStyle =
      "#cfc4ac";


    ctx.font =
      "500 16px Arial";


    ctx.fillText(
      data.state +
      " · " +
      data.city,

      width / 2,
      centerY + radius + 84
    );


    /* ---------------- PACKAGE ---------------- */

    const pillWidth =
      220;

    const pillHeight =
      34;

    const pillY =
      centerY +
      radius +
      106;


    roundedRect(
      ctx,
      width / 2 - pillWidth / 2,
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
      width / 2 - pillWidth / 2,
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

      width / 2,
      pillY + 22
    );


    /* ---------------- ID LABEL ---------------- */

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
      width - 60,
      pillY + 66
    );


    ctx.stroke();


    ctx.fillStyle =
      "#cfc4ac";


    ctx.font =
      "600 13px Arial";


    ctx.fillText(
      "REGISTRATION ID · UNIQUE & PERMANENT",

      width / 2,
      pillY + 100
    );


    ctx.fillStyle =
      "#f4ecdb";


    ctx.font =
      "700 26px Arial";


    ctx.fillText(
      data.id,

      width / 2,
      pillY + 132
    );


    /* ---------------- ID QR ---------------- */

    const qrData =
      await makeEventIdQrDataUrl(
        data.id
      );


    if (qrData) {

      try {

        const qrImage =
          await loadImage(
            qrData
          );


        const qrSize =
          150;


        const qrX =
          width / 2 -
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
          width,
          pillY
        );

      }

    } else {

      drawIdQrPlaceholder(
        ctx,
        width,
        pillY
      );

    }


    /* ---------------- STATUS ---------------- */

    ctx.save();


    ctx.translate(
      width - 96,
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


    /* ---------------- FOOTER ---------------- */

    ctx.fillStyle =
      "#8a8070";


    ctx.font =
      "400 13px Arial";


    ctx.fillText(
      "Carry a valid photo ID at entry. This pass is confirmed only after",
      width / 2,
      height - 56
    );


    ctx.fillText(
      "payment verification by the organising team.",
      width / 2,
      height - 38
    );


    ctx.textAlign =
      "left";
  }


  /* =======================================================
     BASIC ID CARD FALLBACK
     ======================================================= */

  function drawBasicIdCard(
    data
  ) {

    const canvas =
      document.getElementById(
        "idCanvas"
      );


    if (!canvas) {
      return;
    }


    const ctx =
      canvas.getContext(
        "2d"
      );


    const width =
      canvas.width;

    const height =
      canvas.height;


    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    ctx.fillStyle =
      "#201b17";


    ctx.fillRect(
      0,
      0,
      width,
      height
    );


    ctx.textAlign =
      "center";


    ctx.fillStyle =
      "#e8c877";


    ctx.font =
      "800 28px Arial";


    ctx.fillText(
      "NORTHEAST UNITY NIGHT",
      width / 2,
      100
    );


    ctx.fillStyle =
      "#ffffff";


    ctx.font =
      "700 38px Arial";


    ctx.fillText(
      data.fullName ||
        "Guest",
      width / 2,
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
      width / 2,
      270
    );


    ctx.fillStyle =
      "#e8c877";


    ctx.fillText(
      data.id,
      width / 2,
      350
    );


    ctx.fillStyle =
      "#ffffff";


    ctx.font =
      "600 18px Arial";


    ctx.fillText(
      "Package: " +
      data.package,
      width / 2,
      410
    );


    ctx.fillText(
      "Amount: ₹" +
      data.amount,
      width / 2,
      450
    );


    ctx.fillStyle =
      "#e8b45a";


    ctx.fillText(
      "PENDING VERIFICATION",
      width / 2,
      height - 100
    );
  }


  /* =======================================================
     FORM SUBMIT
     ======================================================= */

  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      if (
        !validateStep(
          currentStep
        )
      ) {

        return;
      }


      if (
        !uploadedScreenshotFile
      ) {

        alert(
          "Please upload your payment screenshot before submitting."
        );

        showStep(1);

        return;
      }


      const data =
        getFormData();


      /* ---------------- STORE TRANSACTION ID ---------------- */

      const usedTransactions =
        JSON.parse(
          localStorage.getItem(
            "nun_used_txn_ids"
          ) || "[]"
        );


      if (
        !usedTransactions.includes(
          data.txnId.toLowerCase()
        )
      ) {

        usedTransactions.push(
          data.txnId.toLowerCase()
        );


        localStorage.setItem(
          "nun_used_txn_ids",
          JSON.stringify(
            usedTransactions
          )
        );
      }


      /* ---------------- WHATSAPP MESSAGE ---------------- */

      const whatsappMessage =
`New registration — Northeast Unity Night 2026

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

Please verify this transaction ID and payment screenshot against the actual payment received before confirming.`;


      const whatsappURL =
        waLink(
          whatsappMessage
        );


      const openWhatsappBtn =
        document.getElementById(
          "openWhatsappBtn"
        );


      if (openWhatsappBtn) {

        openWhatsappBtn.href =
          whatsappURL;

      }


      /* ---------------- GOOGLE SHEET ---------------- */

      if (
        CONFIG.GOOGLE_SHEET_ENDPOINT
      ) {

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
            console.error(
              "Google Sheet submission failed:",
              error
            );
          }
        );

      }


      /* ---------------- ID CARD ---------------- */

      try {

        await drawIdCard(
          data
        );

      } catch (error) {

        console.error(
          "ID card generation failed:",
          error
        );


        /*
          VERY IMPORTANT:

          Even if QR or canvas fails,
          registration continues.
        */

        drawBasicIdCard(
          data
        );
      }


      /* ---------------- SUCCESS MODAL ---------------- */

      const successModal =
        document.getElementById(
          "successModal"
        );


      if (successModal) {

        successModal.hidden =
          false;

      }


      /*
        Try native share if supported.
      */

      let shared =
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
              whatsappMessage

          });


          shared =
            true;
        }

      } catch (error) {

        /*
          User cancelled sharing
          or browser does not support it.
        */

        console.log(
          "Share cancelled or unavailable."
        );

      }


      /*
        If native sharing wasn't used,
        open WhatsApp.
      */

      if (!shared) {

        setTimeout(
          function () {

            window.open(
              whatsappURL,
              "_blank"
            );

          },
          500
        );

      }

    }
  );


  /* =======================================================
     DOWNLOAD ID CARD
     ======================================================= */

  const downloadIdBtn =
    document.getElementById(
      "downloadIdBtn"
    );


  if (downloadIdBtn) {

    downloadIdBtn.addEventListener(
      "click",
      function () {

        const canvas =
          document.getElementById(
            "idCanvas"
          );


        if (!canvas) {
          return;
        }


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


        document.body.appendChild(
          link
        );


        link.click();


        link.remove();

      }
    );

  }


  /* =======================================================
     CLOSE SUCCESS MODAL
     ======================================================= */

  const modalClose =
    document.getElementById(
      "modalClose"
    );


  if (modalClose) {

    modalClose.addEventListener(
      "click",
      function () {

        const modal =
          document.getElementById(
            "successModal"
          );


        if (modal) {

          modal.hidden =
            true;

        }

      }
    );

  }


  /* =======================================================
     CHATBOT
     ======================================================= */

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


  const KNOWLEDGE_BASE = [

    {
      keywords: [
        "price",
        "cost",
        "how much",
        "ticket",
        "package"
      ],

      answer:
        "There are two packages: Food + Drinks for ₹1,750 per person, and Food Only for ₹750 per person. Payment is made by UPI during registration."
    },


    {
      keywords: [
        "venue",
        "location",
        "where",
        "address"
      ],

      answer:
        "The event will be in Bengaluru. Check the event page for the latest venue information."
    },


    {
      keywords: [
        "date",
        "time",
        "when"
      ],

      answer:
        "Please check the event page for the latest confirmed date and timing."
    },


    {
      keywords: [
        "drink",
        "alcohol",
        "bar"
      ],

      answer:
        "The Food + Drinks package includes drinks for guests of legal drinking age as applicable under Karnataka law. The Food Only package is non-alcoholic."
    },


    {
      keywords: [
        "id",
        "proof",
        "entry",
        "documents"
      ],

      answer:
        "Carry a valid government photo ID and your digital or printed event ID when attending."
    },


    {
      keywords: [
        "refund",
        "cancel",
        "cancellation"
      ],

      answer:
        "Registrations are non-refundable and non-transferable once confirmed."
    },


    {
      keywords: [
        "register",
        "registration",
        "sign up",
        "how do i register"
      ],

      answer:
        "Scroll to the Register section, enter your details, choose your package, pay through UPI, upload your payment screenshot and transaction ID, then submit the form."
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
        "The payment QR is generated based on your selected package. Food Only is ₹750 and Food + Drinks is ₹1,750."
    },


    {
      keywords: [
        "amount",
        "pre filled",
        "prefilled"
      ],

      answer:
        "The dynamic QR contains the selected amount: ₹750 for Food Only or ₹1,750 for Food + Drinks. Compatible UPI apps can show the amount pre-filled."
    },


    {
      keywords: [
        "states",
        "northeast",
        "who can come",
        "who is invited"
      ],

      answer:
        "Northeast Unity Night celebrates all 8 Northeast states — Assam, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, Arunachal Pradesh and Sikkim. Everyone is welcome."
    },


    {
      keywords: [
        "verify",
        "verification",
        "confirm",
        "approved",
        "pending"
      ],

      answer:
        "Registrations are manually checked against actual payments received. Submitting the form does not automatically confirm your registration."
    }

  ];


  /* =======================================================
     CHATBOT RESPONSE
     ======================================================= */

  function getBotReply(
    text
  ) {

    const lower =
      String(text || "")
        .toLowerCase();


    const result =
      KNOWLEDGE_BASE.find(
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


    if (result) {
      return result.answer;
    }


    return (
      "I couldn't find that information in my notes. Please message us directly on WhatsApp for specific questions."
    );
  }


  /* =======================================================
     CHAT MESSAGE
     ======================================================= */

  function addChatMessage(
    text,
    sender
  ) {

    if (!chatBody) {
      return;
    }


    const message =
      document.createElement(
        "div"
      );


    message.className =
      "chat-msg " +
      sender;


    message.textContent =
      text;


    chatBody.appendChild(
      message
    );


    chatBody.scrollTop =
      chatBody.scrollHeight;
  }


  /* =======================================================
     QUICK REPLIES
     ======================================================= */

  function renderQuickReplies() {

    if (!chatQuick) {
      return;
    }


    chatQuick.innerHTML =
      "";


    const quickQuestions = [

      "Pricing",

      "Venue & date",

      "How verification works",

      "Talk to a human"

    ];


    quickQuestions.forEach(
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


            let question =
              label;


            if (
              label ===
              "How verification works"
            ) {

              question =
                "verification";

            }


            setTimeout(
              function () {

                addChatMessage(
                  getBotReply(
                    question
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


  /* =======================================================
     CHAT OPEN
     ======================================================= */

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


  /* =======================================================
     CHAT CLOSE
     ======================================================= */

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


  /* =======================================================
     CHAT FORM
     ======================================================= */

  if (chatForm) {

    chatForm.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();


        const text =
          chatInput
            ? chatInput.value.trim()
            : "";


        if (!text) {
          return;
        }


        addChatMessage(
          text,
          "user"
        );


        if (chatInput) {

          chatInput.value =
            "";

        }


        setTimeout(
          function () {

            addChatMessage(
              getBotReply(
                text
              ),
              "bot"
            );

          },
          350
        );

      }
    );

  }

}


/* =========================================================
   INITIAL PAYMENT UPDATE
   ========================================================= */

document
  .querySelectorAll(
    'input[name="package"]'
  )
  .forEach(function (radio) {

    radio.addEventListener(
      "change",
      function () {

        /*
          Only update if payment panel
          already exists on the page.
        */

        if (
          typeof updatePaymentPanel ===
          "function"
        ) {

          updatePaymentPanel();

        }

      }
    );

  });


/* =========================================================
   FINAL LOG
   ========================================================= */

console.log(
  "Northeast Unity Night 2026 script loaded successfully."
);
