sessionStorage.clear();

$(document).ready(function () {
  // CONFIG VARIABLES HERE
  var safeWeightLossRate = 1;
  sessionStorage.setItem("safeWeightLossRate", safeWeightLossRate);
  const rations = [1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000];
  const bmiLevels = {
    underweight: 18.5,
    normal: 25,
    overweight: 30,
  };

  // INPUT VARIABLES HERE
  const $age = $("#age");
  const $height = $("#height");
  const $currentWeight = $("#weight");
  const $desiredWeight = $("#desiredWeight");
  const $name = $("#name");
  const $emailInput = $("#email");

  // RESULT VARIABLES HERE
  const $bmi = $("#bmi");
  const $recommendedWeight = $("#recommendedWeight");
  const $bmiResult = $("#bmiResult");
  const $BMR = $("#BMR");
  const $userName = $("#userName");
  const $weightToLoss = $("#weightToLoss");
  const $email = $("#hiddenEmail");
  const $recommendedMealPlan = $("#recommendedMealPlan");

  $("#speed-2").prop("checked", true);
  $("#speed-2").siblings("div").addClass("w--redirected-checked");

  function activityLevelMultiplier(activityLevel) {
    const multipliers = {
      inactive: 1.2,
      light: 1.375,
      moderate: 1.55,
    };
    return multipliers[activityLevel] || 1.2;
  }

  function calculateBMI(height, weight) {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    for (const level in bmiLevels) {
      if (bmi < bmiLevels[level]) {
        return {
          bmi: bmi.toFixed(2),
          level: level,
        };
      }
    }
    return {
      bmi: bmi.toFixed(2).toString(),
      level: "obese",
    };
  }

  function calculateBMR(gender, age, weight, height, activityLevel) {
    const genderLower = gender;
    const constants = {
      male: { a: 66.47, b1: 13.75, b2: 5.0, b3: 6.74 },
      female: { a: 655.1, b1: 9.6, b2: 1.85, b3: 4.68 },
    };
    const actvt = activityLevelMultiplier(activityLevel);
    if (genderLower in constants) {
      const { a, b1, b2, b3 } = constants[genderLower];
      return (a + b1 * weight + b2 * height - b3 * age) * actvt;
    } else {
      return "Invalid gender";
    }
  }

  function calculateRecommendedWeight(height) {
    const lowerNormalBMI = bmiLevels.underweight;
    const upperNormalBMI = bmiLevels.normal;
    const lowerWeight = lowerNormalBMI * (height / 100) ** 2;
    const upperWeight = upperNormalBMI * (height / 100) ** 2;
    return {
      lowerWeight: parseInt((lowerWeight + upperWeight) / 2),
      upperWeight: upperWeight,
    };
  }

  function calculateTimeToReachDesiredWeight(
    currentWeight,
    desiredWeight,
    safeWeightLossRate,
  ) {
    const weeks = Math.ceil(
      (currentWeight - desiredWeight) / safeWeightLossRate,
    );
    return weeks;
  }

  function showMatchingPlans(minBMR, maxBMR) {
    const matchingPlans = [];

    for (const ration of rations) {
      if (ration >= minBMR && ration <= maxBMR) {
        matchingPlans.push(ration);
      }
    }

    // Hide all plans first
    $("[id^=plan]").hide();
    $("[id^=tarif]").hide();

    var ration_plan = matchingPlans[matchingPlans.length - 1];

    $(`#plan${ration_plan}`).show();

    if (matchingPlans.length === 0) {
      return "No matching plans found";
    }

    return ration_plan;
  }

  function closestRation() {
    const gender = $("input[name='gender']:checked").val();
    const activityLevel = $("input[name='activity']:checked").val();
    const age = $age.val();
    const currentWeight = $currentWeight.val();
    const height = $height.val();

    const bmr = calculateBMR(
      gender,
      age,
      currentWeight,
      height,
      activityLevel,
    ).toFixed(2);

    var weightLossRate = sessionStorage.getItem("safeWeightLossRate");
    var minBMR, maxBMR;
    if (weightLossRate == 0.5) {
      minBMR = bmr - 700;
      maxBMR = bmr - 450;
    } else {
      minBMR = bmr - 1250;
      maxBMR = bmr - 800;
    }

    return showMatchingPlans(minBMR, maxBMR);
  }

  function formatMonths(weeks) {
    let months = Math.floor(weeks / 4),
      left_weeks = Math.floor(weeks % 4);
    let result = { months: 0, weeks: 0 };
    if (months > 0) {
      result.months = months;
    }
    if (left_weeks > 0) {
      result.weeks = left_weeks;
    }
    sessionStorage.setItem("time", JSON.stringify(result));
    return result;
  }

  function calculateFutureDate(months, weeks) {
    const today = new Date();
    const futureDate = new Date(today);

    // Add months
    futureDate.setMonth(futureDate.getMonth() + months);

    // Add weeks
    futureDate.setDate(futureDate.getDate() + weeks * 7);

    // Format the date
    const day = futureDate.getDate().toString().padStart(2, "0");
    const month = (futureDate.getMonth() + 1).toString().padStart(2, "0"); // January is 0!
    const year = futureDate.getFullYear();

    return `${day}.${month}.${year}`;
  }

  function changeValues() {
    console.log("Changing values");
    const $gender = $("input[name='gender']:checked");
    const $activityLevel = $("input[name='activity']:checked");
    const $allergy = $("input[name='allergy']:checked");

    const gender = $gender.val();
    const age = $("#age").val();
    const height = $("#height").val();
    const currentWeight = $("#weight").val();
    const activityLevel = $activityLevel.val();
    const desiredWeight = $("#desiredWeight").val();

    const weightToLoss = currentWeight - desiredWeight;

    const recommendedWeightRange = calculateRecommendedWeight(height);
    var { lowerWeight, upperWeight } = recommendedWeightRange;
    lowerWeight = Math.ceil(lowerWeight);
    upperWeight = Math.floor(upperWeight);

    const ration_plan = closestRation();

    const bmi = calculateBMI(height, currentWeight);
    const { level: bmi_level, bmi: bmi_int } = bmi;
    const bmr = parseInt(
      calculateBMR(gender, age, currentWeight, height, activityLevel),
    );

    if (bmr <= 1800 && sessionStorage.getItem("currentStep") >= 7) {
      $("#speed-2").prop("disabled", true);
      $("#speed-1").prop("checked", false);
      $("#speed-2").siblings("div").addClass("disabled");
      $("#speed-2").siblings("div").removeClass("w--redirected-checked");
      $("#speed-1").prop("checked", true);
      $("#speed-1").siblings("div").addClass("w--redirected-checked");
      $("#errorSpeed").show();
      weightLossRate();
    } else {
      $("#speed-2").prop("disabled", false);
      $("#speed-2").siblings("div").removeClass("disabled");
      $("#errorSpeed").hide();
    }

    const timeResults = calculateTimeToReachDesiredWeight(
      currentWeight,
      desiredWeight,
      sessionStorage.getItem("safeWeightLossRate"),
    );
    const formattedTimeResult = formatMonths(timeResults);

    if ($allergy.val() == "yes") {
      $("#allergy-list").css("display", "grid");
      $("#step8 label").first().hide();
      $(".is-allergy").hide();
    }

    //CLOSE ALLERGY LIST
    const $allergy_cancel = $("#cancel");
    $allergy_cancel.on("click", function () {
      $("#allergy-list").css("display", "none");
      $("#step8 label").first().show();
      $(".is-allergy").show();
      $("#step8 .w-form-formradioinput")
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

    $recommendedWeight.val(`${lowerWeight} - ${upperWeight}`);
    $("#recommendedWeightText").text(`${lowerWeight} - ${upperWeight}`);
    $(`#plan${ration_plan} .deficit`).text(`${bmr - ration_plan}`);
    $(`#tarif-${ration_plan}`).show();
    $bmi.val(`${bmi_int}`);
    $bmiResult.val(bmi_level);
    $BMR.val(`${bmr} kcal/day`);
    $userName.text($name.val());
    $weightToLoss.text(`${weightToLoss}`);
    $email.val($emailInput.val());
    $recommendedMealPlan.val(`${ration_plan} kcal/day`);
    $("#timeResult").text(
      `(${formattedTimeResult.months === 0 ? (formattedTimeResult.weeks !== 0 ? `${formattedTimeResult.weeks}vko` : "") : formattedTimeResult.weeks === 0 ? `${formattedTimeResult.months}kk` : `${formattedTimeResult.months}kk ${formattedTimeResult.weeks}vko`})`,
    );
    $("#dateResult").text(
      `${calculateFutureDate(formattedTimeResult.months, formattedTimeResult.weeks)}`,
    );
    $("#timeAndDate").val(
      `${calculateFutureDate(formattedTimeResult.months, formattedTimeResult.weeks)} ${formattedTimeResult.months === 0 ? (formattedTimeResult.weeks !== 0 ? `${formattedTimeResult.weeks}vko` : "") : formattedTimeResult.weeks === 0 ? `(${formattedTimeResult.months}kk)` : `(${formattedTimeResult.months}kk ${formattedTimeResult.weeks}vko)`}`,
    );

    //STORE VALUES
    sessionStorage.setItem("allergy", $allergy.val());
    sessionStorage.setItem("ration_plan", ration_plan);
    sessionStorage.setItem("bmr", bmr);
    sessionStorage.setItem("bmi", bmi_int);
    sessionStorage.setItem("gender", gender);
    sessionStorage.setItem("age", age);
    sessionStorage.setItem("height", height);
    sessionStorage.setItem("currentWeight", currentWeight);
    sessionStorage.setItem("desiredWeight", desiredWeight);
    sessionStorage.setItem("activityLevel", activityLevel);
    sessionStorage.setItem(
      "recommendedWeightRange",
      JSON.stringify(recommendedWeightRange),
    );
  }

  function weightLossRate() {
    if ($("#speed-1").is(":checked")) {
      safeWeightLossRate = 0.5;
    } else {
      safeWeightLossRate = 1;
    }
    sessionStorage.setItem("safeWeightLossRate", safeWeightLossRate);
  }

  $("#speed-1, #speed-2").on("click", function () {
    weightLossRate();
    changeValues();

    $('input[name="Subscription-selected"]').prop("checked", false);
    let _plan = sessionStorage.getItem("ration_plan");
    $(`#${_plan}-0`).prop("checked", true);
    $(`#tarif-${_plan} label:first div.w-form-formradioinput`).toggleClass(
      "w--redirected-checked",
    );
  });

  // PREVENT HITTING ENTER KEY
  $(window).keydown(function (event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });

  $("#Quiz-weight-loss input, #Quiz-weight-loss select").on(
    "click change paste keyup",
    function () {
      if ($(this).attr("type") == "number") {
        let sanitizedValue = parseInt($(this).val().toString());

        if (sanitizedValue !== "") {
          let parsedValue = parseFloat(sanitizedValue);
          $(this).val(parsedValue);
        }
      }
      changeValues();
    },
  );
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
        "https://buy.stripe.com/eVa7ucgTd4yx6v64hG",
        "https://buy.stripe.com/9AQ4i09qL3utbPqg0p",
        "https://buy.stripe.com/aEU9Ck9qLc0Z7zag0r",
      ],
      1250: [
        "https://buy.stripe.com/9AQ7uc5avaWVg5G9Bg",
        "https://buy.stripe.com/6oE5m48mH0ih8De6pc",
        "https://buy.stripe.com/28ocOw46r2qp7zaaFK",
        "https://buy.stripe.com/28o01K1Yj1ml1aM4gN",
      ],
      1500: [
        "https://buy.stripe.com/00g5m4dH12qp8DefZF",
        "https://buy.stripe.com/00gbKsauPfdbdXy8xl",
        "https://buy.stripe.com/bIY9Ck46raWVdXy8xD",
        "https://buy.stripe.com/3cs8yggTdghf8DeeVq",
      ],
      1750: [
        "https://buy.stripe.com/6oEeWEbyT6GFf1C3cU",
        "https://buy.stripe.com/aEU5m47iDc0Zg5G5la",
        "https://buy.stripe.com/5kA01K7iD1ml5r2cNU",
        "https://buy.stripe.com/fZeg0I6ez6GF9Hi00y",
      ],
      2000: [
        "https://buy.stripe.com/6oE01KgTdaWVg5G14N",
        "https://buy.stripe.com/5kAg0IfP99SR9Hi00R",
        "https://buy.stripe.com/9AQ6q80Uf0ihcTu5lt",
        "https://buy.stripe.com/00g15O46r1ml8De3cL",
      ],
      2250: [
        "https://buy.stripe.com/bIYdSA6ezaWV06I14O",
        "https://buy.stripe.com/cN27uc46r1ml1aM5lc",
        "https://buy.stripe.com/6oE5m4fP97KJ9Hi4hq",
        "https://buy.stripe.com/8wMcOwauP7KJf1CaFf",
      ],
      2500: [
        "https://buy.stripe.com/14k5m446raWV06I14P",
        "https://buy.stripe.com/7sI8yg0Ufc0Z3iU14X",
        "https://buy.stripe.com/5kAcOweL52qp5r29BL",
        "https://buy.stripe.com/7sIcOw9qL5CBdXy3cO",
      ],
      2750: [
        "https://buy.stripe.com/4gw4i0dH1c0Z1aM28U",
        "https://buy.stripe.com/14k9CkauPd53dXybJC",
        "https://buy.stripe.com/5kA8yg0Uf1mlaLmcNY",
        "https://buy.stripe.com/5kAg0I7iD2qp8De3dg",
      ],
      3000: [
        "https://buy.stripe.com/8wMg0I6ezd53f1C4h3",
        "https://buy.stripe.com/14kcOwcCX3ut3iU4hb",
        "https://buy.stripe.com/8wMeWEdH11ml06Ig0b",
        "https://buy.stripe.com/9AQ7uccCX6GFg5GdRV",
      ],
    },
  ];
  const errorIDs = [
    "",
    "",
    "",
    "errorYear",
    "errorHeight",
    "errorCurrentWeight",
    ["errorMinWeight", "errorMaxWeight"],
    ["errorAllergy", "errorOther"],
    "",
  ];

  function checkInput(input) {
    var type = input.attr("type");
    var name = input.attr("name");
    var val = input.val();
    const nextQ = $("#nextQ");
    var currentStep = sessionStorage.getItem("currentStep");
    const allowedMaxWeight = {
      male: {
        inactive: 170,
        light: 140,
        moderate: 115,
      },
      female: {
        inactive: 180,
        light: 170,
        moderate: 160,
      },
    };

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
      case "Height":
        var height = val;
        if (height < 150 || height > 200) {
          $(`#${errorIDs[currentStep]}`).show();
          nextQ.addClass("disabled");
          return true;
        } else {
          $(`#${errorIDs[currentStep]}`).hide();
          nextQ.removeClass("disabled");
          return false;
        }
        break;
      case "Current-weight":
        var gender = sessionStorage.getItem("gender");
        var activityLevel = sessionStorage
          .getItem("activityLevel")
          .toLowerCase();
        var weight = val;

        if (weight < 50 || weight > allowedMaxWeight[gender][activityLevel]) {
          $(`#${errorIDs[currentStep]}`).show();
          nextQ.addClass("disabled");
          return true;
        } else {
          $(`#${errorIDs[currentStep]}`).hide();
          nextQ.removeClass("disabled");
          return false;
        }
        break;
      //i.e. desired weight
      case "Recommended-weight":
        var desiredWeight = parseInt(sessionStorage.getItem("desiredWeight"));
        var { lowerWeight, upperWeight } = JSON.parse(
          sessionStorage.getItem("recommendedWeightRange"),
        );
        lowerWeight = Math.ceil(lowerWeight);
        upperWeight = Math.floor(upperWeight);
        if (desiredWeight < lowerWeight) {
          $(`#${errorIDs[currentStep][0]}`).show();
          $(`#${errorIDs[currentStep][1]}`).hide();
          nextQ.addClass("disabled");
          return true;
        } else if (
          desiredWeight >= parseInt(sessionStorage.getItem("currentWeight"))
        ) {
          $(`#${errorIDs[currentStep][0]}`).hide();
          $(`#${errorIDs[currentStep][1]}`).show();
          nextQ.addClass("disabled");
          return true;
        } else {
          $(`#${errorIDs[currentStep][0]}`).hide();
          $(`#${errorIDs[currentStep][1]}`).hide();
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

    if (currentStep + 1 == 9) {
      $nextQ.addClass("disabled").hide();
      $prevQ.removeClass("disabled");
      // $send.show().removeClass("disabled");
      $send.show();
      selectTariff();
    } else {
      $nextQ.removeClass("disabled").show();
      $prevQ.toggleClass("disabled", currentStep + 1 == 1);
      $send
        .toggle(currentStep + 1 == 9)
        .toggleClass("disabled", currentStep + 1 != 9);
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
      if (currentStep + 1 == 9) {
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

  //SEND BUTTON
  $("#send").on("click", function () {
    const $timeResultMonths = $("#timeResultMonths");
    const $timeResultWeeks = $("#timeResultWeeks");
    const $timeResult = $("#timeResult");
    const formattedTimeResult = JSON.parse(sessionStorage.getItem("time"));

    $timeResultMonths.text(formattedTimeResult.months);
    $timeResultWeeks.text(formattedTimeResult.weeks);

    $timeResult.val(
      `${
        formattedTimeResult.months > 0
          ? formattedTimeResult.months + " months "
          : ""
      }${formattedTimeResult.weeks} weeks`,
    );

    if (formattedTimeResult.months == 0) {
      $timeResultMonths.hide();
      $("#months").hide();
    }
    if (formattedTimeResult.weeks == 0) {
      $timeResultWeeks.hide();
      $("#weeks").hide();
    }
  });
});
