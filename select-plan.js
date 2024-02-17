sessionStorage.clear();

$(document).ready(function () {
  // CONFIG VARIABLES HERE
  const rations = [1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000];

  // INPUT VARIABLES HERE
  const $emailInput = $("#email");

  // RESULT VARIABLES HERE
  const $email = $("#hiddenEmail");

  $emailInput.change(function () {
    $email.val($(this).val());
  });

  if ($allergy.val() == "yes") {
    $("#allergy-list").css("display", "grid");
    $("#step5 label").first().hide();
    $(".is-allergy").hide();
  }

  //CLOSE ALLERGY LIST
  const $allergy_cancel = $("#cancel");
  $allergy_cancel.on("click", function () {
    $("#allergy-list").css("display", "none");
    $("#step5 label").first().show();
    $(".is-allergy").show();
    $("#step5 .w-form-formradioinput")
      .eq(1)
      .removeClass("w--redirected-checked");

    $("#errorAllergy, #errorOther").hide();

    $("input[name='allergy']").prop("checked", false);

    const allergyListIDs = [
      "Citrus-allergy",
      "Vegetarian-diet",
      "Vegan-diet",
      "Shellfish-and-fish-allergy",
      "other",
      "Nut-allergy",
      "Gluten",
      "Lactose",
    ];

    for (var i = 0; i < allergyListIDs.length; i++) {
      $(`#${allergyListIDs[i]}`).prop("checked", false);
      $(`#${allergyListIDs[i]}`)
        .siblings("div.w-checkbox-input")
        .removeClass("w--redirected-checked");
    }
  });

  // PREVENT HITTING ENTER KEY
  $(window).keydown(function (event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });

  $("input, select").on("change paste keyup", function () {
    if ($(this).attr("type") == "number") {
      let sanitizedValue = parseInt($(this).val().toString());

      if (sanitizedValue !== "") {
        let parsedValue = parseFloat(sanitizedValue);
        $(this).val(parsedValue);
      }
    }
    changeValues();
  });
});

// QUIZ CONTROLLER
$(document).ready(function () {
  const steps = [],
    navs = [];
  var currentStep = 0;
  for (var i = 1; i < 10; i++) {
    steps.push(`step${i}`);
    navs.push(`nav${i}`);
  }

  const planLinks = [
    {
      1000: [
        "https://buy.stripe.com/9AQ4i01Yj8ON9HibK6",
        "https://buy.stripe.com/5kA9CkgTd2qp06IaG3",
        "https://buy.stripe.com/eVa7ucgTd4yx6v64hG",
        "https://buy.stripe.com/3csg0I9qLc0ZaLm01s",
        "https://buy.stripe.com/aEU9Ck9qLc0Z7zag0r",
      ],
      1250: [
        "https://buy.stripe.com/9AQ7uc5avaWVg5G9Bg",
        "https://buy.stripe.com/28o8ygauP9SRf1C7to",
        "https://buy.stripe.com/6oE5m48mH0ih8De6pc",
        "https://buy.stripe.com/bIYdSA8mHghf6v63dr",
        "https://buy.stripe.com/28o01K1Yj1ml1aM4gN",
      ],
      1500: [
        "https://buy.stripe.com/00g5m4dH12qp8DefZF",
        "https://buy.stripe.com/00g8ygbyTe97aLmaFB",
        "https://buy.stripe.com/00gbKsauPfdbdXy8xl",
        "https://buy.stripe.com/aEU9Ck32nd53cTubJY",
        "https://buy.stripe.com/3cs8yggTdghf8DeeVq",
      ],
      1750: [
        "https://buy.stripe.com/6oEeWEbyT6GFf1C3cU",
        "https://buy.stripe.com/fZe9Ck46r0ih3iU7tq",
        "https://buy.stripe.com/aEU5m47iDc0Zg5G5la",
        "https://buy.stripe.com/4gweWE46r9SR7zaaFV",
        "https://buy.stripe.com/fZeg0I6ez6GF9Hi00y",
      ],
      2000: [
        "https://buy.stripe.com/6oE01KgTdaWVg5G14N",
        "https://buy.stripe.com/cN23dW32nfdb5r2297",
        "https://buy.stripe.com/5kAg0IfP99SR9Hi00R",
        "https://buy.stripe.com/9AQ3dW9qL4yx2eQ6pG",
        "https://buy.stripe.com/00g15O46r1ml8De3cL",
      ],
      2250: [
        "https://buy.stripe.com/bIYdSA6ezaWV06I14O",
        "https://buy.stripe.com/8wM15OeL57KJbPqaFE",
        "https://buy.stripe.com/cN27uc46r1ml1aM5lc",
        "https://buy.stripe.com/3csaGofP98ONdXyeWd",
        "https://buy.stripe.com/8wMcOwauP7KJf1CaFf",
      ],
      2500: [
        "https://buy.stripe.com/14k5m446raWV06I14P",
        "https://buy.stripe.com/5kAg0I9qL6GF8DedRR",
        "https://buy.stripe.com/7sI8yg0Ufc0Z3iU14X",
        "https://buy.stripe.com/dR65m4gTd1ml06I3dw",
        "https://buy.stripe.com/7sIcOw9qL5CBdXy3cO",
      ],
      2750: [
        "https://buy.stripe.com/4gw4i0dH1c0Z1aM28U",
        "https://buy.stripe.com/cN25m446r8ON6v66pq",
        "https://buy.stripe.com/14k9CkauPd53dXybJC",
        "https://buy.stripe.com/bIY9CkeL5fdb7za15p",
        "https://buy.stripe.com/5kAg0I7iD2qp8De3dg",
      ],
      3000: [
        "https://buy.stripe.com/8wMg0I6ezd53f1C4h3",
        "https://buy.stripe.com/6oE4i0byT3utbPqaFH",
        "https://buy.stripe.com/14kcOwcCX3ut3iU4hb",
        "https://buy.stripe.com/6oE7uccCXe977zacO8",
        "https://buy.stripe.com/9AQ7uccCX6GFg5GdRV",
      ],
    },
  ];
  const errorIDs = [
    "",
    "",
    "",
    "errorYear",
    ["errorAllergy", "errorOther"],
    "",
  ];

  function checkInput(input) {
    var type = input.attr("type");
    var name = input.attr("name");
    var val = input.val();
    const nextQ = $("#nextQ");
    var currentStep = sessionStorage.getItem("currentStep");

    if (val == "") {
      return true;
    }

    switch (name) {
      case "Age":
        var age = val;
        if (age < 18 || age > 70) {
          $(`#${errorIDs[currentStep]}`).show();
          nextQ.addClass("disabled");
          return true;
        } else {
          $(`#${errorIDs[currentStep]}`).hide();
          nextQ.removeClass("disabled");
          return false;
        }
        break;
      case "allergy":
        var hasBadAllergy = false;
        var hasOther = false;
        const badAllergies = [
          "Citrus-allergy",
          "Vegetarian-diet",
          "Vegan-diet",
          "Shellfish-and-fish-allergy",
          "Gluten",
        ];
        for (var i = 0; i < badAllergies.length; i++) {
          if ($(`#${badAllergies[i]}`).is(":checked")) {
            hasBadAllergy = true;
          }
        }
        if ($("#other").is(":checked")) {
          hasOther = true;
        }
        if (hasBadAllergy) {
          $(`#${errorIDs[currentStep][0]}`).show();
          nextQ.addClass("disabled");
        } else {
          $(`#${errorIDs[currentStep][0]}`).hide();
          nextQ.removeClass("disabled");
        }
        if (hasOther) {
          $(`#${errorIDs[currentStep][1]}`).show();
          nextQ.addClass("disabled");
        } else {
          $(`#${errorIDs[currentStep][1]}`).hide();
          nextQ.removeClass("disabled");
        }
        return hasBadAllergy || hasOther;
        break;
      default:
        break;
    }
    //RETURN true IF INPUT IS BAD
  }

  function selectTariff() {
    const current_plan = sessionStorage.getItem("ration_plan");
    $(`#${current_plan}-0`).prop("checked", true);
    $(
      `#tarif-${current_plan} label:first div.w-form-formradioinput`,
    ).toggleClass("w--redirected-checked");
  }

  function showCurrentStep() {
    sessionStorage.setItem("currentStep", currentStep);

    const allergy = $('input[name="allergy"]');
    const inputElem = `#${steps[currentStep]} input`;
    const $nextQ = $("#nextQ");
    const $prevQ = $("#prevQ");
    const $send = $("#send");

    steps.forEach((stepID) => {
      $(`#${stepID}`).css("display", "none");
    });

    if (currentStep + 1 == 6) {
      $nextQ.addClass("disabled").hide();
      $prevQ.removeClass("disabled");
      // $send.show().removeClass("disabled");
      $send.show();
      selectTariff();
    } else {
      $nextQ.removeClass("disabled").show();
      $prevQ.toggleClass("disabled", currentStep + 1 == 1);
      $send
        .toggle(currentStep + 1 == 6)
        .toggleClass("disabled", currentStep + 1 != 6);
    }

    for (let i = 0; i < navs.length; i++) {
      $(`#${navs[i]}`).toggleClass("is-current", i <= currentStep);
    }

    // if input is not empty
    if (currentStep == 0) {
      $nextQ.addClass("disabled");
    }

    $(inputElem).on("input change paste keyup focus load", function () {
      // Check if the input is empty
      $nextQ.toggleClass("disabled", $(this).val().trim() === "");
      if (currentStep + 1 == 6) {
        $send.toggleClass("disabled", $(this).val().trim() === "");
      }
    });

    $("#nextQ").addClass("disabled");

    $(`#${steps[currentStep]}`).css("display", "flex");
  }

  function showNextStep() {
    const inputElem = `#${steps[currentStep]} input`;
    if (checkInput($(inputElem))) {
      // console.log();
    } else {
      currentStep = (currentStep + 1) % steps.length;
      showCurrentStep();
    }
  }

  function showPrevStep() {
    currentStep = Math.abs(currentStep - 1) % steps.length;
    showCurrentStep();
  }

  showCurrentStep();

  $("#prevQ").on("click", showPrevStep);
  $("#nextQ").on("click", showNextStep);

  // SUBMIT PLAN
  const submit = $("#submit");

  $(submit).on("click", function () {
    var goTo = "";
    const selectedPlan = $('input[name="Subscription-selected"]:checked')
      .attr("id")
      .split("-");
    var plan = parseInt(selectedPlan[0]),
      weeks = parseInt(selectedPlan[1]);

    goTo = planLinks[0][plan][weeks];
    window.open(goTo, "_blank");
  });
});

$(document).ready(function () {
  // initially hide all divs with 'ms-code-more-info' attribute
  $("div[ms-code-more-info]").removeClass("is-active");
  $("div[ms-code-more-info=" + "2000" + "]").addClass("is-active");

  $("#tarif-2000") /* РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ */
    .find("label:first .w-form-formradioinput")
    .addClass("w--redirected-checked")
    .next()
    .click();

  // listen for change events on all radios with 'ms-code-radio-option' attribute
  $("input[ms-code-radio-option]").change(function () {
    // hide all divs again
    $("div[ms-code-more-info]").removeClass("is-active");
    // get the value of the selected radio button
    let selectedValue = $(this).attr("ms-code-radio-option");
    // find the div with the 'ms-code-more-info' attribute that matches the selected value and show it
    $("div[ms-code-more-info=" + selectedValue + "]").addClass("is-active");
    /* 26.1.2024 */
    $(".tarif-wrap .w-form-formradioinput").removeClass(
      "w--redirected-checked",
    );
    const selTarif = $("#tarif-" + selectedValue);
    selTarif
      .find("label:first .w-form-formradioinput")
      .addClass("w--redirected-checked")
      .next()
      .click();
    /* /26.1.2024 */
  });

  /* 27.1.2024 */
  if ($(window).width() <= 670) {
    const Wrap = $(".radio-plans-wrap");
    const meal2000 = $(".radio-plans-wrap .meal-plan-radio:eq(4)");
    meal2000.click(function () {
      const resultOffset = $(window).width() / 2 - meal2000.width() / 2;
      const originOffset = meal2000.offset().left;
      Wrap.animate(
        {
          scrollLeft: originOffset - resultOffset,
        },
        555,
      );
    });
  }
  /* /27.1.2024 */

  $("#trigger").on("click", function () {
    $(".section-quiz").css("display", "none");
    $(".section-quiz-loading-result").css("display", "flex");
    setTimeout(function () {
      $(".section-quiz-loading-result").css("display", "none");
      $(
        ".section-quiz-result, .section-quiz-customer-review, .section-FAQs",
      ).css("display", "flex");
      $(".meal-plan-radio").eq(4).click();
    }, 3000);
  });
});
