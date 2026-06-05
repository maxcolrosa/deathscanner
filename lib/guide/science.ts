// Science & authority layer - Layer C
//
// Each entry covers one major modifiable lever with:
//   - lever:     the lever name (short, plain-language)
//   - mechanism: an accurate plain-language explanation of WHY it changes
//                health and longevity (physiology a smart non-specialist can
//                follow, no jargon dumps).
//   - evidence:  what the research broadly shows. Named references are used
//                ONLY where they are well-established and correctly described.
//                Where a precise citation is not certain, measured general
//                phrasing is used instead of inventing one.
//
// ACCURACY NOTE: The one named reference used here is Mandsager et al.,
// JAMA Network Open (2018), which reported on cardiorespiratory fitness
// and mortality risk across fitness groups in a large cohort. All other
// evidence statements use general phrasing deliberately, because fabricating
// specific author names, sample sizes, or effect-size numbers would be worse
// than a true general statement.
//
// No em-dashes. No Math.random. No Date.now. Purely authored, deterministic data.

import type { ScienceEntry } from "@/lib/guide/schema";

export const SCIENCE_ENTRIES: ScienceEntry[] = [
  {
    lever: "Cardiorespiratory fitness",
    mechanism:
      "Cardiorespiratory fitness - measured as VO2max or estimated from how hard exertion feels - reflects how well your heart, lungs, and muscles can extract and use oxygen. A well-conditioned cardiovascular system pumps blood more efficiently, keeps resting heart rate and blood pressure lower, and handles metabolic stress without overloading the heart. Higher fitness also improves insulin sensitivity, which keeps blood sugar stable and reduces the chronic inflammation that drives most age-related disease.",
    evidence:
      "A large prospective cohort study by Mandsager and colleagues published in JAMA Network Open in 2018 found that low cardiorespiratory fitness was associated with a higher risk of all-cause mortality than most other traditional risk factors, and that moving from the lowest fitness group to even a moderate fitness level was associated with a substantial reduction in that risk. This is one of the most replicated findings in exercise science: large cohort studies and meta-analyses consistently show that cardiorespiratory fitness is among the strongest predictors of longevity.",
  },
  {
    lever: "Strength and muscle mass",
    mechanism:
      "Skeletal muscle is not just a tissue for moving things - it is the largest site of glucose disposal in the body, acting like a metabolic sponge that absorbs blood sugar after meals and keeps insulin working properly. It also stores amino acids that the body draws on during illness or injury and supports bone density, balance, and the ability to perform everyday tasks without strain. Muscle mass declines steadily from the mid-thirties onward if it is not challenged, and that loss accelerates the metabolic and functional decline associated with ageing.",
    evidence:
      "Large meta-analyses consistently show that higher muscle strength and resistance training are associated with lower all-cause mortality and reduced risk of cardiovascular disease, type 2 diabetes, and physical disability in later life. The benefit appears dose-dependent up to a point: even two resistance training sessions per week are associated with meaningful reductions in mortality risk compared to no resistance training at all.",
  },
  {
    lever: "Protein intake",
    mechanism:
      "Protein provides the amino acids muscles use to repair and rebuild after training - a process called muscle protein synthesis. Without adequate dietary protein, the body cannot maintain or build muscle tissue regardless of how much training you do. Protein also has a higher thermic effect than carbohydrates or fat, meaning the body uses more energy digesting it, which supports fat management without deliberate restriction. Adequate protein at each meal also suppresses ghrelin (the hunger hormone) more effectively than other macronutrients, making it easier to eat less without feeling deprived.",
    evidence:
      "Systematic reviews of resistance training studies consistently show that protein intakes of approximately 0.7 to 1.0 g per lb of body weight per day maximize the muscle-building response to training in most adults. The evidence for higher intakes is weaker and diminishing returns set in beyond roughly 0.9 g per lb. Major health and sports nutrition bodies recommend distributing protein across three to four meals rather than consuming it all at once, because muscle protein synthesis is limited per feeding.",
  },
  {
    lever: "Progressive overload",
    mechanism:
      "Muscle and cardiovascular fitness only adapt when exposed to a demand that slightly exceeds what they are already accustomed to. When you lift a load that is at the edge of what you can manage, muscle fibres develop microscopic damage that is repaired and rebuilt slightly thicker and stronger during recovery. Repeat that cycle - stimulus, recovery, slightly more stimulus - and the body gradually becomes more capable. Without progressive overload, adaptation stalls: doing the same workout at the same intensity week after week keeps the body at its current level rather than building it.",
    evidence:
      "Progressive overload is one of the foundational principles of exercise science, supported by decades of experimental research. Studies consistently show that programmes incorporating progressive increases in load, volume, or intensity produce significantly greater gains in strength and muscle mass than non-progressive programmes. The US Physical Activity Guidelines and the WHO Physical Activity Guidelines both recommend muscle-strengthening activities at progressive intensity on at least two days per week for health benefit.",
  },
  {
    lever: "Sleep",
    mechanism:
      "Sleep is the primary recovery window for almost every physiological system. During deep sleep, the body releases the majority of its daily growth hormone, which drives muscle repair and fat metabolism. The brain clears metabolic waste through the glymphatic system, consolidates memory, and resets emotional regulation. Short or poor-quality sleep elevates cortisol and ghrelin, which together increase hunger (especially for high-calorie food), blunt insulin sensitivity, and slow muscle recovery. Chronically disrupted sleep raises resting blood pressure and increases inflammation markers associated with cardiovascular disease.",
    evidence:
      "Major sleep and health bodies - including the American Academy of Sleep Medicine and the Sleep Research Society - recommend seven or more hours of sleep per night for adults, based on consistent evidence linking shorter sleep duration to higher rates of obesity, type 2 diabetes, cardiovascular disease, and all-cause mortality. Large cohort studies show a J-shaped relationship between sleep duration and health outcomes, with both under- and over-sleeping associated with elevated risk, and the lowest risk sitting in the seven-to-nine-hour range.",
  },
  {
    lever: "Chronic stress and cortisol",
    mechanism:
      "Cortisol is a glucocorticoid hormone released by the adrenal glands in response to stress. In short bursts it is useful: it mobilises energy, sharpens focus, and prepares the body for demand. The problem is chronic elevation - when the stress response is never fully switched off. Persistently high cortisol promotes visceral fat storage (particularly around the abdomen), raises blood pressure, suppresses immune function, disrupts sleep architecture, and impairs both insulin sensitivity and muscle protein synthesis. It also drives craving for high-sugar, high-fat foods as the brain seeks quick energy to match the perceived threat.",
    evidence:
      "The link between chronic psychosocial stress, cortisol dysregulation, and poor health outcomes is well-established across epidemiological and experimental research. Large cohort studies consistently associate high perceived stress with elevated cardiovascular risk, immune dysfunction, and accelerated biological aging markers. Mind-body practices that lower cortisol - including regular aerobic exercise, controlled breathing, and adequate sleep - show measurable reductions in resting blood pressure and inflammatory markers in randomized trials.",
  },
  {
    lever: "Daily movement and NEAT",
    mechanism:
      "Non-exercise activity thermogenesis (NEAT) is the energy burned by all movement that is not formal exercise - walking to the kitchen, standing at a desk, taking the stairs. For most people, NEAT accounts for more daily calorie expenditure than structured workouts, because low-level movement is constant. Sedentary behavior - sitting for prolonged periods - is an independent risk factor for metabolic disease: it reduces the activity of lipoprotein lipase (an enzyme involved in fat clearing from the bloodstream), lowers insulin sensitivity, and contributes to the loss of muscle function over time. Increasing daily step count, even without any change to gym sessions, measurably improves blood sugar regulation and cardiovascular biomarkers.",
    evidence:
      "Epidemiological research consistently shows that higher daily step counts are associated with lower all-cause mortality and cardiovascular disease risk, with meaningful benefits appearing from around 7,000 steps per day upward. The WHO Physical Activity Guidelines recommend reducing sedentary behavior specifically and note that any amount of additional physical activity - including light activity - confers health benefit beyond being sedentary. Multiple randomized trials have shown that breaking up prolonged sitting with short bouts of walking improves postprandial glucose and insulin responses.",
  },
  {
    lever: "Body fat and visceral fat",
    mechanism:
      "Not all body fat carries the same risk. Visceral fat - the fat stored deep in the abdominal cavity around the liver, pancreas, and intestines - is metabolically active tissue. It secretes inflammatory cytokines (such as IL-6 and TNF-alpha), releases fatty acids directly into the portal circulation, and promotes insulin resistance in the liver. This makes visceral fat a central driver of type 2 diabetes, non-alcoholic fatty liver disease, and cardiovascular disease. Subcutaneous fat (under the skin) carries much lower risk. The good news is that visceral fat is highly responsive to the interventions in this program: aerobic exercise, resistance training, improved diet quality, and better sleep all reduce visceral fat preferentially, often before visible body composition changes appear.",
    evidence:
      "Large cohort studies and meta-analyses consistently show that higher amounts of visceral fat, often estimated by waist circumference, are associated with elevated risk of metabolic syndrome, cardiovascular disease, type 2 diabetes, and all-cause mortality, independent of overall body weight. Research also consistently shows that modest reductions in body weight - around 5 to 10 percent - produce disproportionately large reductions in visceral fat and measurable improvements in metabolic markers including fasting glucose, blood pressure, and lipid profiles.",
  },
];
