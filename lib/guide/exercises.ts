// Fixed exercise library for the deterministic guide engine.
// All entries authored for beginner clarity. No em-dashes anywhere in this file.
// Names must EXACTLY match the names produced by build-guide.ts helper functions
// (lowerBody, pushEx, hingeEx, pullEx, coreEx, conditioning) so the per-user
// selection in buildExerciseLibrary finds them by exact string match.

import type { ExerciseEntry } from "@/lib/guide/schema";

export const EXERCISE_ENTRIES: ExerciseEntry[] = [
  // ─── Squat pattern ────────────────────────────────────────────────────────

  {
    name: "Box squat to a chair",
    pattern: "Squat",
    targets: "Quadriceps, glutes, and hamstrings. The chair limits depth and removes knee stress.",
    setup: [
      "Place a sturdy chair or box behind you. It should be at a height where your hips are at or just above parallel when you sit down.",
      "Stand with feet shoulder-width apart, toes angled out 10 to 20 degrees.",
      "Hold your arms straight out in front of you or cross them at the chest for balance.",
    ],
    execution: [
      "Take a breath in and brace your core gently.",
      "Push your hips back and bend your knees, lowering slowly until your glutes just touch the chair. Do not sit down fully.",
      "Pause for one second, then drive through your heels to stand tall.",
      "Squeeze your glutes at the top and exhale.",
      "Lower the chair height by a couple of centimetres each week as you get stronger.",
    ],
    mistakes: [
      "Knees caving inward: push them out over your pinky toe as you descend.",
      "Reaching for the chair too fast: control the descent, do not drop onto it.",
      "Leaning too far forward: keep your chest tall and your weight on your whole foot.",
      "Not bracing: a soft core lets your lower back round. Breathe and create gentle tension before you descend.",
    ],
    easier: "Sit all the way down on the chair between each rep to fully reset.",
    harder: "Progress to a goblet squat once you can complete 3 sets of 10 with no pain.",
    learn: "Search 'box squat form' and watch a slow side-on demo. Focus on a controlled, seated descent rather than speed.",
  },

  {
    name: "Goblet squat",
    pattern: "Squat",
    targets: "Quadriceps, glutes, hamstrings, and upper back. The front-loaded dumbbell keeps your torso upright.",
    setup: [
      "Hold a single dumbbell vertically at chest height, cupping the top end with both hands.",
      "Stand with feet shoulder-width apart, toes turned out 15 to 30 degrees.",
      "Keep your elbows pointing toward the floor.",
    ],
    execution: [
      "Breathe in and brace your core.",
      "Push your knees out and sit straight down, keeping the dumbbell close to your chest.",
      "Squat until your hips are at or below parallel, or as deep as you can without your lower back rounding.",
      "Drive through your full foot to stand, squeezing your glutes at the top.",
      "Exhale at the top of the rep.",
    ],
    mistakes: [
      "Heels rising: this usually means tight ankle mobility. Slightly widen your stance or raise your heels on small plates.",
      "Chest falling forward: grip the dumbbell tighter and keep your elbows up.",
      "Shallow depth: aim to get hips level with knees at minimum. Use a lighter weight if depth is limited.",
      "Rushing: slow the descent to 2 to 3 seconds to build control.",
    ],
    easier: "Hold a lighter dumbbell or a water bottle and only squat to the depth that feels comfortable.",
    harder: "Increase the dumbbell weight once you complete all reps with clean form and full depth. Progress toward a barbell back squat.",
    learn: "Search 'goblet squat tutorial' for a front-on and side-on view. Focus on keeping your chest tall throughout.",
  },

  {
    name: "Back squat",
    pattern: "Squat",
    targets: "Quadriceps, glutes, hamstrings, and the whole posterior chain. The primary compound strength movement.",
    setup: [
      "Set the barbell at upper-chest height on a squat rack.",
      "Step under the bar and position it across your upper traps (high bar) or lower on your rear delts (low bar).",
      "Grip the bar just outside shoulder width, squeeze your shoulder blades together to create a shelf.",
      "Unrack by stepping back two small steps. Feet shoulder-width, toes out 20 to 30 degrees.",
    ],
    execution: [
      "Take a deep breath into your belly and brace hard.",
      "Break at the hips and knees simultaneously, pushing your knees out over your toes.",
      "Descend until your hips are at or below parallel. Keep your chest up and your lower back neutral.",
      "Drive through your whole foot to stand, pushing the floor away.",
      "Exhale at the top, then reset your brace before the next rep.",
    ],
    mistakes: [
      "Knees caving in: a common sign of weak glutes or adductors. Actively push the knees out.",
      "Butt wink (lower back rounds at the bottom): often caused by depth beyond current mobility. Squat to just above the point where it occurs.",
      "Good morning squat (hips rise faster than shoulders out of the hole): the bar is too heavy or bar position is off.",
      "Shallow depth: if you cannot reach parallel, prioritise mobility work and reduce load.",
    ],
    easier: "Use a box squat to a chair to limit depth until mobility and strength develop.",
    harder: "Add a small amount of weight each session using the smallest plates available. Front squats are a useful variation to build quad strength.",
    learn: "Search 'back squat form tutorial' by a reputable coach. Watch the side-on view. Consider getting one session with a coach if you are new to barbell work.",
  },

  // ─── Push pattern ─────────────────────────────────────────────────────────

  {
    name: "Incline push-up on a counter",
    pattern: "Push",
    targets: "Chest, front shoulders, and triceps. The incline angle reduces the load compared to a floor push-up.",
    setup: [
      "Find a stable, fixed surface at roughly kitchen-counter height, about waist to hip level.",
      "Place your hands shoulder-width apart on the edge of the surface.",
      "Step your feet back until your body forms a straight line from head to heels.",
      "Hands should be directly below your shoulders or slightly wider.",
    ],
    execution: [
      "Brace your core so your hips do not sag.",
      "Lower your chest toward the surface in a controlled way, bending your elbows at roughly 45 degrees from your body, not flaring wide.",
      "Lower until your chest almost touches the surface.",
      "Press firmly through your hands to return to the start.",
      "Breathe in on the way down, out on the way up.",
    ],
    mistakes: [
      "Hips sagging or piking: keep your body like a plank from head to heels.",
      "Half reps: lower all the way so your chest nearly touches the surface.",
      "Elbows flaring out wide: this strains the shoulder. Keep them at about 45 degrees.",
      "Speeding through it: a 2-second lowering phase builds more strength than dropping fast.",
    ],
    easier: "Use a higher surface such as a wall push-up. The more upright you are, the lighter the load.",
    harder: "Progressively lower the surface height, moving to a table, then a bench, then the floor as you get stronger.",
    learn: "Search 'incline push-up form' for a side-on demo. The key cue is a straight body line throughout.",
  },

  {
    name: "Push-up or incline push-up",
    pattern: "Push",
    targets: "Chest, front shoulders, and triceps. A full body stability challenge with the floor version.",
    setup: [
      "For a floor push-up: place your hands just wider than shoulder-width, fingers pointing forward or angled slightly out.",
      "For an incline: place hands on a bench, box, or step at the height that allows clean form.",
      "Set your body in a straight line from head to heels. Squeeze your glutes and brace your abs.",
    ],
    execution: [
      "Breathe in and lower your chest toward the floor or surface, elbows tracking at about 45 degrees from your torso.",
      "Lower until your chest nearly touches, then press back up.",
      "Keep your body rigid throughout, no hip sag, no piking.",
      "Exhale at the top.",
    ],
    mistakes: [
      "Head dropping or chin jutting forward: keep your neck neutral, eyes looking slightly ahead of your hands.",
      "Hips sagging: the most common error. Brace your core before the first rep and hold it.",
      "Partial range: a half push-up trains half the muscle. Go full range.",
      "Elbows too wide: flaring elbows loads the rotator cuff. Keep them closer to the body.",
    ],
    easier: "Use an incline surface. Start at counter height and work the surface lower over weeks.",
    harder: "Progress to floor push-ups and then add reps, moving toward sets of 15 to 20 before adding external load.",
    learn: "Search 'push-up form tutorial'. The floor push-up and the incline are the same movement pattern, just at different angles.",
  },

  {
    name: "Bench or dumbbell press",
    pattern: "Push",
    targets: "Chest, front shoulders, and triceps. Dumbbells also challenge shoulder stability and allow a fuller range of motion than a barbell.",
    setup: [
      "Sit on a flat bench with dumbbells resting on your thighs, then lean back and bring the dumbbells to chest height.",
      "Set your shoulder blades back and down, pressing them gently into the bench. This creates a stable base.",
      "Feet flat on the floor, slight natural arch in your lower back.",
      "Dumbbells at chest height, elbows at roughly 45 to 75 degrees from your torso.",
    ],
    execution: [
      "Breathe in, brace, then press the dumbbells up and slightly toward each other until your arms are extended but not locked out.",
      "Lower in a controlled way, 2 to 3 seconds, bringing the dumbbells to the sides of your chest.",
      "Feel a slight stretch in your chest at the bottom before pressing again.",
      "Exhale at the top of each rep.",
    ],
    mistakes: [
      "Shoulder blades lifting off the bench: keep them set. Floating shoulder blades shift stress to the rotator cuff.",
      "Elbows too wide: a 45 to 75 degree angle is safer and stronger than 90 degrees.",
      "Dumbbells too far from the chest: bring them in close to your armpits at the bottom.",
      "Bouncing off the chest: lower under control to get the benefit of the eccentric phase.",
    ],
    easier: "Reduce the dumbbell weight. You can also use push-ups as a regression.",
    harder: "Increase the dumbbell weight when you consistently reach the top of the rep range. Incline bench press shifts emphasis to the upper chest.",
    learn: "Search 'dumbbell bench press form' for a demo. Shoulder blade retraction is the cue most beginners miss.",
  },

  // ─── Hinge pattern ────────────────────────────────────────────────────────

  {
    name: "Glute bridge",
    pattern: "Hinge",
    targets: "Glutes and hamstrings, with low demand on the lower back. Ideal for learning hip extension without spinal loading.",
    setup: [
      "Lie on your back on the floor with knees bent, feet flat, about hip-width apart.",
      "Feet should be close enough that your fingertips can just graze your heels.",
      "Arms at your sides, palms flat on the floor.",
    ],
    execution: [
      "Breathe in.",
      "Exhale, press through your heels, and drive your hips up toward the ceiling.",
      "At the top, squeeze your glutes hard. Your body should form a straight line from shoulders to knees.",
      "Hold for one second, then lower your hips slowly to the floor.",
      "Reset your breathing and repeat.",
    ],
    mistakes: [
      "Pushing through the toes: drive through your heels to bias the glutes.",
      "Hyperextending the lower back: stop when your body is in a straight line. Going higher loads the lumbar spine.",
      "Not squeezing: the glute squeeze at the top is where the work happens. Do not rush through it.",
      "Feet too far away: if your hamstrings cramp, move your feet closer to your glutes.",
    ],
    easier: "Place your feet on a low step to reduce the range of motion.",
    harder: "Progress to a single-leg glute bridge by extending one leg straight out. This roughly doubles the load per glute.",
    learn: "Search 'glute bridge how to'. Look for cues about heel drive and the glute squeeze at the top.",
  },

  {
    name: "Dumbbell Romanian deadlift",
    pattern: "Hinge",
    targets: "Hamstrings, glutes, and lower back. The hip hinge is the most important movement pattern to learn for long-term strength.",
    setup: [
      "Stand holding a dumbbell in each hand, arms in front of your thighs.",
      "Feet hip-width apart, soft bend in the knees.",
      "Shoulders back and down, chest slightly lifted.",
    ],
    execution: [
      "Take a breath in and brace your core.",
      "Push your hips backward as if you are touching the wall behind you with your glutes.",
      "Slide the dumbbells down your thighs as your torso lowers. Keep the dumbbells close to your legs.",
      "Lower until you feel a strong stretch in your hamstrings, usually just below the knee for most people.",
      "Drive your hips forward to return to standing, squeezing your glutes at the top.",
      "Exhale at the top.",
    ],
    mistakes: [
      "Squatting instead of hinging: hips go back, not down. Imagine shutting a car door with your glutes.",
      "Rounding the back: keep a neutral spine. If your back rounds, reduce the range of motion.",
      "Letting the dumbbells swing away from the body: keep them in contact with your thighs throughout.",
      "Locking out too hard at the top: stand tall and squeeze, but do not hyperextend.",
    ],
    easier: "Use lighter dumbbells and only hinge to shin level until the pattern feels natural.",
    harder: "Increase load gradually. Progress toward a barbell Romanian deadlift once the dumbbell version is comfortable.",
    learn: "Search 'dumbbell Romanian deadlift tutorial'. The 'hip push back' and 'dumbbells down the legs' cues are the most useful.",
  },

  {
    name: "Romanian deadlift",
    pattern: "Hinge",
    targets: "Hamstrings, glutes, and erector spinae. A primary posterior chain strength builder with a barbell.",
    setup: [
      "Stand with a barbell in your hands at hip height, using an overhand grip shoulder-width apart.",
      "Feet hip-width, soft bend in the knees.",
      "Shoulder blades retracted, chest up, bar touching your thighs.",
    ],
    execution: [
      "Breathe in and brace your core and lats.",
      "Push your hips back and hinge forward, the bar sliding down your thighs.",
      "Lower until you feel a strong stretch in the hamstrings, usually to mid-shin.",
      "Keep your back flat and the bar close to your body the entire way down.",
      "Drive the hips forward and squeeze the glutes to return to standing.",
      "Exhale at the top.",
    ],
    mistakes: [
      "Bar drifting forward: the bar must stay in contact with or very close to your legs.",
      "Rounding the lumbar spine: brace hard before each rep. If your back rounds, you have gone too deep or the load is too heavy.",
      "Knee straightening too much: keep a soft bend throughout. This is not a straight-leg deadlift.",
      "Jerking the weight: initiate the lift with a deliberate hip push, not a yank.",
    ],
    easier: "Use dumbbells for the Romanian deadlift until barbell technique is reliable.",
    harder: "Add load each week while maintaining a flat back. Deficit Romanian deadlifts (standing on a small plate) extend the range of motion.",
    learn: "Search 'Romanian deadlift barbell form'. A side-on slow-motion view is most helpful for seeing the hip hinge and bar path.",
  },

  // ─── Pull pattern ─────────────────────────────────────────────────────────

  {
    name: "Band row",
    pattern: "Pull",
    targets: "Mid and upper back, rear shoulders, and biceps. The band provides progressive resistance and is easy on injured shoulders.",
    setup: [
      "Anchor a resistance band to a fixed point at roughly waist height, for example a door anchor, a sturdy post, or a rack upright.",
      "Hold one end of the band in each hand, arms extended, with slight tension in the band from the start.",
      "Step back until there is moderate tension with arms extended. Stand tall with feet hip-width apart.",
    ],
    execution: [
      "Brace your core and pull both handles to your ribs, driving your elbows back.",
      "Squeeze your shoulder blades together at the end of the movement and hold for one second.",
      "Slowly return your arms to the extended position, resisting the band on the way out.",
      "Breathe in before pulling, out as you return.",
    ],
    mistakes: [
      "Shrugging the shoulders: keep them down and away from your ears throughout.",
      "Using momentum: pull with a deliberate, controlled rhythm. No yanking.",
      "Not squeezing at the end: the contraction with the blades together is where the back muscle works hardest.",
      "Band too slack: you should feel resistance from the start. Step back further if needed.",
    ],
    easier: "Use a lighter or thinner band, or step closer to reduce tension.",
    harder: "Use a thicker band, step further back, or move to a seated cable row or dumbbell row.",
    learn: "Search 'resistance band row form'. Focus on the shoulder blade squeeze at the end of each pull.",
  },

  {
    name: "One-arm dumbbell row",
    pattern: "Pull",
    targets: "Lats, mid-back, rear shoulder, and biceps. Working one side at a time allows a greater range of motion.",
    setup: [
      "Place your right hand and right knee on a flat bench for support. Your torso should be roughly parallel to the floor.",
      "Hold a dumbbell in your left hand, arm hanging straight down.",
      "Keep your back flat, not rounded.",
    ],
    execution: [
      "Breathe in.",
      "Pull the dumbbell up toward your hip, driving your elbow past your torso.",
      "At the top, squeeze your shoulder blade inward and hold for one second.",
      "Lower the dumbbell under control back to the starting position.",
      "Complete all reps on one side before switching.",
    ],
    mistakes: [
      "Twisting the torso: the rotation should come from the shoulder and elbow, not from rotating your whole body.",
      "Pulling to the chest instead of the hip: the elbow should travel back along your side.",
      "Short range: the full movement goes from arm straight to elbow well past your back.",
      "Rushing the descent: lower slowly for maximum muscle work.",
    ],
    easier: "Use a lighter dumbbell or perform a two-arm band row instead.",
    harder: "Increase dumbbell weight when you can complete all reps with controlled form. Progress toward a chest-supported row.",
    learn: "Search 'one arm dumbbell row form'. Look for the cue about pulling to the hip rather than the chest.",
  },

  {
    name: "Bent-over row",
    pattern: "Pull",
    targets: "Full back width and thickness: lats, rhomboids, traps, and rear delts. One of the best compound pull exercises.",
    setup: [
      "Stand holding a barbell or dumbbells with an overhand grip, hands just outside shoulder-width.",
      "Hinge at the hips until your torso is at about 45 degrees to the floor or more parallel, back flat.",
      "Arms hanging straight down from the shoulders, knees slightly bent.",
    ],
    execution: [
      "Breathe in and brace your core to protect your lower back.",
      "Pull the bar or dumbbells to your lower abdomen, driving your elbows back and close to your sides.",
      "Squeeze your shoulder blades together at the top for one second.",
      "Lower the weight under control.",
      "Exhale as you return to the start.",
    ],
    mistakes: [
      "Jerking upright to use momentum: stay at the same hip angle throughout the set.",
      "Pulling to the chest: aim for the belly button. Rowing to the chest shifts stress to the front shoulder.",
      "Rounded back under load: this puts the lumbar spine at risk. Reduce the weight and brace harder.",
      "Elbows too wide: keep them tracking back and reasonably close to your torso.",
    ],
    easier: "Use lighter dumbbells or switch to a chest-supported row to eliminate lower-back demand.",
    harder: "Add load each week. Vary between overhand and underhand grip to target slightly different areas.",
    learn: "Search 'bent over row form barbell'. Look for cues on maintaining hip-hinge position throughout the set.",
  },

  // ─── Core pattern ─────────────────────────────────────────────────────────

  {
    name: "Dead bug",
    pattern: "Core",
    targets: "Deep core stabilisers (transverse abdominis), with no spinal compression. Safe for lower-back and hip issues.",
    setup: [
      "Lie on your back with your lower back pressed firmly and flat against the floor.",
      "Raise your arms straight above your chest, perpendicular to the floor.",
      "Bring your knees up to a 90-degree position, shins parallel to the floor.",
    ],
    execution: [
      "Breathe out and brace your core, pressing your low back into the floor. Hold this throughout.",
      "Slowly lower your right arm toward the floor overhead while simultaneously extending your left leg toward the floor.",
      "Lower as far as you can while keeping your lower back flat. Stop before your back lifts.",
      "Return both limbs to the start position and repeat on the opposite side (left arm and right leg).",
      "That is one rep per side.",
    ],
    mistakes: [
      "Lower back arching off the floor: the moment your back lifts, the core has stopped working. Reduce the range of motion.",
      "Holding your breath: breathe steadily. The challenge is to keep the back flat despite breathing.",
      "Moving too fast: this is a slow, controlled drill. Take 3 to 4 seconds per limb movement.",
      "Not reaching full extension: within the range that keeps your back flat, reach long with the arm and leg.",
    ],
    easier: "Move one limb at a time rather than opposite pairs. For example, extend just one arm or just one leg per rep.",
    harder: "Slow the tempo to 5 seconds per movement, add a pause at full extension, or progress to a hollow body hold.",
    learn: "Search 'dead bug exercise how to'. The key cue is keeping the lower back flush with the floor the entire time.",
  },

  {
    name: "Plank",
    pattern: "Core",
    targets: "Entire anterior core (rectus abdominis, transverse abdominis), shoulders, and glutes. A full-body stability hold.",
    setup: [
      "Start in a push-up position. Lower to your forearms so elbows are directly below your shoulders.",
      "Hands clasped or flat, forearms parallel.",
      "Body in a straight line from head to heels.",
    ],
    execution: [
      "Squeeze your glutes hard.",
      "Brace your core as if you are about to take a punch.",
      "Push the floor away with your forearms to keep your shoulder blades apart, not squeezing together.",
      "Hold for the prescribed time, breathing steadily.",
      "If your hips start to sag or rise, the set is done.",
    ],
    mistakes: [
      "Hips sagging: the most common error. Squeeze your glutes and core together to prevent this.",
      "Head dropping: keep your neck neutral, eyes looking at the floor.",
      "Holding the breath: breathe in and out. Holding the breath spikes blood pressure and is not sustainable.",
      "Piking hips upward: your body should be a flat plank, not a tent.",
    ],
    easier: "Perform the plank from your knees while keeping your hips in line with your shoulders and knees.",
    harder: "Add 5 to 10 seconds each week. Progress to a push-up plank (arms extended) or add shoulder taps.",
    learn: "Search 'forearm plank form'. Watch for the glute-squeeze and neutral-spine cues.",
  },

  // ─── Conditioning ─────────────────────────────────────────────────────────

  {
    name: "Brisk walk",
    pattern: "Conditioning",
    targets: "Cardiovascular system, lower body, and mental recovery. Low impact and suitable for all fitness levels.",
    setup: [
      "Wear comfortable, supportive shoes.",
      "Choose a route that is flat or has gentle inclines.",
      "No equipment needed.",
    ],
    execution: [
      "Walk at a quick pace where you can hold a conversation but feel some effort. You should not be strolling.",
      "Swing your arms naturally, keep your chest up, and look ahead rather than down.",
      "Aim for 20 to 25 minutes continuously.",
      "If you need to break it into two shorter walks, that is fine.",
    ],
    mistakes: [
      "Too slow: a leisurely stroll has little cardiovascular benefit. You should feel lightly breathless.",
      "Skipping rest days because it feels too easy: the recovery value is real. Walk consistently every day.",
      "Staring at your phone: look up, swing your arms, and walk with purpose.",
    ],
    easier: "Shorten the session to 10 to 15 minutes. Any walking counts.",
    harder: "Add 5 minutes each week or include a gentle hill to increase effort.",
    learn: "No technique video needed. The main cue is keeping a pace where you feel warm and lightly challenged.",
  },

  {
    name: "Zone 2 cardio, bike row or fast walk",
    pattern: "Conditioning",
    targets: "Aerobic base and cardiovascular efficiency. Zone 2 is the pace where your body primarily uses fat for fuel and builds long-term heart and lung capacity.",
    setup: [
      "Choose a bike, rowing machine, or fast walk.",
      "Set the resistance low enough that you can maintain the effort for 25 to 30 minutes without stopping.",
    ],
    execution: [
      "Aim for a pace where you can breathe through your nose, or speak in short sentences without gasping.",
      "If you cannot sustain a conversation, slow down. Zone 2 should feel comfortably challenging.",
      "Maintain this pace for the full session. Do not push hard intervals.",
      "Keep pedalling, rowing, or walking smoothly throughout.",
    ],
    mistakes: [
      "Going too hard: if you cannot say a few words out loud, you have left Zone 2. Ease off.",
      "Going too easy: a completely comfortable stroll is below Zone 2. You should feel some aerobic demand.",
      "Skipping this session because it does not feel hard: Zone 2 is where cardiovascular adaptation is built over time.",
    ],
    easier: "A fast walk is the most accessible Zone 2 option and needs no equipment.",
    harder: "Add 5 minutes each week. Once you can do 45 to 60 minutes, increase pace slightly.",
    learn: "Search 'Zone 2 cardio how to'. The nose-breathing or 'conversational pace' test is the simplest guide.",
  },

  {
    name: "Intervals, bike row or hill walk",
    pattern: "Conditioning",
    targets: "VO2 max, anaerobic capacity, and calorie burn. Intervals deliver a greater cardiovascular stimulus than steady-state in less time.",
    setup: [
      "Choose a bike, rowing machine, or a hill for walking.",
      "Set up a timer or use a phone app for 30-second intervals.",
      "Start with a 3 to 5 minute easy warm-up at low effort.",
    ],
    execution: [
      "Work for 30 seconds at a hard but controlled effort. You should not be able to hold a conversation.",
      "Recover for 60 seconds at very easy effort or a complete stop.",
      "Repeat for 8 rounds.",
      "Finish with 2 to 3 minutes of easy movement to cool down.",
    ],
    mistakes: [
      "Going flat out in round 1: pace yourself so round 8 is still hard. Burning out early defeats the purpose.",
      "Skipping the warm-up: cold muscles and a cold cardiovascular system increase the risk of a strain.",
      "Rest periods too short: 60 seconds of easy recovery is necessary for the next hard effort to be meaningful.",
      "Doing this session on back-to-back days: at least one full rest or easy day between interval sessions.",
    ],
    easier: "Reduce to 5 or 6 rounds while keeping the effort honest. You can also use a gentle incline rather than a steep hill.",
    harder: "Add one round each week, up to 12, or increase the work interval to 40 seconds.",
    learn: "Search 'HIIT intervals bike tutorial' or 'rowing machine intervals beginner'. The key is honest hard efforts followed by real recovery.",
  },
];
