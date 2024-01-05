sessionStorage.clear();

$(document).ready(function () {
  // CONFIG VARIABLES HERE
  const safeWeightLossRate = 0.5;
  const rations = [1250, 1500, 1750, 2000, 2250, 2500];
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

  // RESULT VARIABLES HERE
  const $bmi = $("#bmi");
  const $recommendedWeight = $("#recommendedWeight");
  const $bmiResult = $("#bmiResult");
  const $caloriesNeeded = $("#caloriesNeeded");
  const $userName = $("#userName");
  const $weightToLoss = $("#weightToLoss");

  function activityLevelMultiplier(activityLevel) {
    const multipliers = {
      inactive: 1.2,
      light: 1.375,
      moderate: 1.55,
    };
    return multipliers[activityLevel.toLowerCase()] || 1.2;
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
    safeWeightLossRate
  ) {
    const weeks = Math.ceil(
      (currentWeight - desiredWeight) / safeWeightLossRate
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
      activityLevel
    ).toFixed(2);
    const minBMR = bmr - 700;
    const maxBMR = bmr - 450;

    return showMatchingPlans(minBMR, maxBMR);
  }

  function formatMonths(weeks) {
    let months = Math.floor(weeks / 4.34524),
      left_weeks = Math.floor(weeks % 4.34524);
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

  function changeValues() {
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
      calculateBMR(gender, age, currentWeight, height, activityLevel)
    );

    const timeResults = calculateTimeToReachDesiredWeight(
      currentWeight,
      desiredWeight,
      safeWeightLossRate
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
    $caloriesNeeded.val(`${bmr} calories/day`);
    $userName.text($name.val());
    $weightToLoss.text(`${weightToLoss}`);

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
      JSON.stringify(recommendedWeightRange)
    );
  }

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
      1250: [
        "https://buy.stripe.com/3cs15O32n4yx7za4gm",
        "https://buy.stripe.com/7sI9Ck5av8ON8De3cj",
      ],
      1500: [
        "https://buy.stripe.com/fZe15OcCX5CBbPq00i",
        "https://buy.stripe.com/dR64i046rghf2eQ4gp",
      ],
      1750: [
        "https://buy.stripe.com/fZe8ygcCX4yx2eQaEP",
        "https://buy.stripe.com/00g9CkbyT4yx4mY9AK",
      ],
      2000: [
        "https://buy.stripe.com/00g9Ck6ez4yx9HicMZ",
        "https://buy.stripe.com/9AQ6q87iD8ONf1C00c",
      ],
      2250: [
        "https://buy.stripe.com/bIYbKs5av6GFdXy3cr",
        "https://buy.stripe.com/00gaGo7iD0ih3iUcN0",
      ],
      2500: [
        "https://buy.stripe.com/aEU7uc5avfdb6v614l",
        "https://buy.stripe.com/8wMbKseL51mlbPq9AW",
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
        inactive: 130,
        light: 105,
        moderate: 90,
      },
      female: {
        inactive: 150,
        light: 150,
        moderate: 124,
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
          sessionStorage.getItem("recommendedWeightRange")
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
    $(`#${current_plan}-2`).prop("checked", true);
    $(
      `#tarif-${current_plan} label:nth-child(2) div.w-form-formradioinput`
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
      $send.show().removeClass("disabled");
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
      weeks = parseInt(selectedPlan[1]) - 1;

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
      }${formattedTimeResult.weeks} weeks`
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
