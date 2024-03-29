sessionStorage.clear();

$(document).ready(function () {
  // CONFIG VARIABLES HERE
  //const safeWeightLossRate = 0.5;
  const rations = [1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000];
  const bmiLevels = {
    underweight: 18.5,
    normal: 25,
    overweight: 30,
  };

  // INPUT VARIABLES HERE
  const $age = $("#age");
  const $height = $("#height");
  const $currentWeight = $("#weight");
  const $name = $("#name");
  const $emailInput = $("#email");

  // RESULT VARIABLES HERE
  const $bmi = $("#bmi");
  const $bmiResult = $("#bmiResult");
  const $caloriesNeeded = $("#caloriesNeeded");
  const $userName = $("#userName");
  const $email = $("#hiddenEmail");
  const $recommendedMealPlan = $("#recommendedMealPlan");

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

  function showMatchingPlan(recMealPlan) {
    const matchingPlans = [recMealPlan];

    // Hide all plans first
    $("[id^=plan]").hide();
    $("[id^=tarif]").hide();

    var ration_plan = matchingPlans[matchingPlans.length - 1];

    $(`#plan${ration_plan}`).show();

    if (matchingPlans.length === 0) {
      sessionStorage.setItem("maintainWeightPlan", "No matching plans found");
      return "No matching plans found";
    }
    sessionStorage.setItem("maintainWeightPlan", ration_plan);
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

    if (bmr < 1050 || bmr > 3100) {
      return "No plans found for your BMR";
    } else if (bmr > 3000) {
      return showMatchingPlan(3000);
    } else if (bmr < 1250) {
      return showMatchingPlan(1250);
    }

    const bmi = parseFloat(sessionStorage.getItem("bmi"));
    let recommendedRation;
    // Check if bmi is greater than 21.75
    if (bmi > 21.75) {
      recommendedRation = 0;

      // Find the highest closest ration which is smaller than bmr
      for (let i = 0; i < rations.length; i++) {
        if (rations[i] > bmr) {
          recommendedRation = rations[i];
          break;
        }
      }
    } else {
      recommendedRation = Number.MAX_SAFE_INTEGER;

      // Find the lowest closest ration which is greater than bmr
      for (let i = 0; i < rations.length; i++) {
        if (rations[i] <= bmr) {
          recommendedRation = rations[i];
        }
      }
    }
    console.log(recommendedRation);
    return showMatchingPlan(recommendedRation);
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

    const ration_plan = closestRation();

    const bmi = calculateBMI(height, currentWeight);
    const { level: bmi_level, bmi: bmi_int } = bmi;
    const bmr = parseInt(
      calculateBMR(gender, age, currentWeight, height, activityLevel)
    );

    if ($allergy.val() == "yes") {
      $("#allergy-list").css("display", "grid");
      $("#step8 label").first().hide();
      $(".is-allergy").hide();
    }

    //CLOSE ALLERGY LIST
    const $allergy_cancel = $("#cancel");
    $allergy_cancel.on("click", function () {
      $("#allergy-list").css("display", "none");
      $("#step7 label").first().show();
      $(".is-allergy").show();
      $("#step7 .w-form-formradioinput")
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

    $(`#plan${ration_plan} .deficit`).text(`${bmr - ration_plan}`);
    $(`#tarif-${ration_plan}`).show();
    $bmi.val(`${bmi_int}`);
    $bmiResult.val(bmi_level);
    $caloriesNeeded.val(`${bmr} kcal/day`);
    $userName.text($name.val());
    $email.val($emailInput.val());
    $recommendedMealPlan.val(`${ration_plan} kcal/day`);

    //STORE VALUES
    sessionStorage.setItem("allergy", $allergy.val());
    sessionStorage.setItem("ration_plan", ration_plan);
    sessionStorage.setItem("bmr", bmr);
    sessionStorage.setItem("bmi", bmi_int);
    sessionStorage.setItem("gender", gender);
    sessionStorage.setItem("age", age);
    sessionStorage.setItem("height", height);
    sessionStorage.setItem("currentWeight", currentWeight);
    sessionStorage.setItem("activityLevel", activityLevel);
  }

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
    "errorHeight",
    "errorCurrentWeight",
    //["errorMinWeight", "errorMaxWeight"],
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
        moderate: 88,
      },
      female: {
        inactive: 170,
        light: 145,
        moderate: 120,
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
      `#tarif-${current_plan} label:first div.w-form-formradioinput`
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

    if (currentStep + 1 == 8) {
      $nextQ.addClass("disabled").hide();
      $prevQ.removeClass("disabled");
      // $send.show().removeClass("disabled");
      $send.show();
      selectTariff();
    } else {
      $nextQ.removeClass("disabled").show();
      $prevQ.toggleClass("disabled", currentStep + 1 == 1);
      $send
        .toggle(currentStep + 1 == 8)
        .toggleClass("disabled", currentStep + 1 != 8);
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
      if (currentStep + 1 == 8) {
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
