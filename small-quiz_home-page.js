/*Daily & Pro tabs switcher start*/
$("#tabDaily").on("click", function () {
  $(".select-plan_content-wrap").removeClass("is-active");
  $("#contentDaily").addClass("is-active");
});

$("#tabPro").on("click", function (e) {
  $(".select-plan_content-wrap").removeClass("is-active");
  $("#contentPro").addClass("is-active");

  /*MEAL 2000 SCROLL TO LEFT START*/
  if ($(window).width() <= 1280) {
    const Wrap = $("#radioContainer");
    const meal2000 = $("#radioContainer .w-radio:eq(4)");
    const resultOffset = $(window).width() / 2 - meal2000.width() / 2;
    const originOffset = meal2000.offset().left;
    Wrap.animate(
      {
        scrollLeft: originOffset - resultOffset,
      },
      555
    );
  }
  /*MEAL 2000 SCROLL TO LEFT END*/
});
/*Daily & Pro tabs switcher end*/

/*Daily second tabs switcher start*/
const cardDaily = $(".selected-day-info, .select-plan_days-group.is-daily");

$("#3-days").on("click", function () {
  cardDaily.removeClass("is-active");
  $("#text-3-ateriaa, #daysGroup-3-days").addClass("is-active");
});

$("#4-days").on("click", function () {
  cardDaily.removeClass("is-active");
  $("#text-4-ateriaa, #daysGroup-4-days").addClass("is-active");
});

$("#5-days").on("click", function () {
  cardDaily.removeClass("is-active");
  $("#text-5-ateriaa, #daysGroup-5-days").addClass("is-active");
});
/*Daily second tabs switcher end*/

/*Daily third tabs switcher start*/
$("#weekDay").on("click", function () {
  $(".select-plan_tarifs-wrap.is-daily").removeClass("is-active");
  $("#3-ateriaa-1, #4-ateriaa-1, #5-ateriaa-1").addClass("is-active");
});

$("#everyDay").on("click", function () {
  $(".select-plan_tarifs-wrap.is-daily").removeClass("is-active");
  $("#3-ateriaa-2, #4-ateriaa-2, #5-ateriaa-2").addClass("is-active");
});
/*Daily third tabs switcher end*/

/*Plans select start*/
const cardPro = $(".result-plan-meal-card, .select-plan_days-group.is-pro");

$("#1000").on("click", function () {
  cardPro.removeClass("is-active");
  $("#plan1000, #tarif1000").addClass("is-active");
});

$("#1250").on("click", function () {
  cardPro.removeClass("is-active");
  $("#plan1250, #tarif1250").addClass("is-active");
});

$("#1500").on("click", function () {
  cardPro.removeClass("is-active");
  $("#plan1500, #tarif1500").addClass("is-active");
});

$("#1750").on("click", function () {
  cardPro.removeClass("is-active");
  $("#plan1750, #tarif1750").addClass("is-active");
});

$("#2000").on("click", function () {
  cardPro.removeClass("is-active");
  $("#plan2000, #tarif2000").addClass("is-active");
});

$("#2250").on("click", function () {
  cardPro.removeClass("is-active");
  $("#plan2250, #tarif2250").addClass("is-active");
});

$("#2500").on("click", function () {
  cardPro.removeClass("is-active");
  $("#plan2500, #tarif2500").addClass("is-active");
});

$("#2750").on("click", function () {
  cardPro.removeClass("is-active");
  $("#plan2750, #tarif2750").addClass("is-active");
});

$("#3000").on("click", function () {
  cardPro.removeClass("is-active");
  $("#plan3000, #tarif3000").addClass("is-active");
});
/*Plans select start*/

/*Pro third tabs switcher start*/
$("#weekDayPro").on("click", function () {
  $(".select-plan_tarifs-wrap.is-pro").removeClass("is-active");
  $(
    "#1000-1, #1250-1, #1500-1, #1750-1, #2000-1, #2250-1, #2500-1, #2750-1, #3000-1"
  ).addClass("is-active");
});

$("#everyDayPro").on("click", function () {
  $(".select-plan_tarifs-wrap.is-pro").removeClass("is-active");
  $(
    "#1000-2, #1250-2, #1500-2, #1750-2, #2000-2, #2250-2, #2500-2, #2750-2, #3000-2"
  ).addClass("is-active");
});
/*Pro third tabs switcher end*/

/* CALCULATOR START */
$(document).ready(function () {
  $("#female").prop("checked", true);
  $("#age").val(25);
  $("#height").val(170);
  $("#weight").val(65);
  $(
    "#wf-form-Home-page-Select-Plan input, #wf-form-Home-page-Select-Plan select"
  ).on("change", function () {
    /* INPUT VARIABLES HERE*/
    const $age = $("#age");
    const $height = $("#height");
    const $currentWeight = $("#weight");
    const $gender = $("input[name='Gender']:checked");
    const $activity = $("#activity");
    /* RESULT VARIABLES HERE*/
    const $bmr = $("#bmr");
    const $bmrDeficit = $("#bmrDeficit");
    const $bmrProficit = $("#bmrSurplus");

    var a = $age.val(),
      h = $height.val(),
      w = $currentWeight.val(),
      g = $gender.val(),
      act = $activity.val(),
      bmr = parseInt(calculateBMR(g, a, w, h, act));
    console.log(g);
    $bmr.text(`${bmr} kcal`);
    $bmrDeficit.text(`${bmr - 700} kcal`);
    $bmrProficit.text(`${bmr + 300} kcal`);
  });

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

  function activityLevelMultiplier(activityLevel) {
    const multipliers = {
      Inactive: 1.2,
      Light: 1.375,
      Moderate: 1.55,
    };
    return multipliers[activityLevel] || 1.2;
  }
});
/* CALCULATOR END */
