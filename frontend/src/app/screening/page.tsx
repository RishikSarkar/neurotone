'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

// --- Updated CDR Data Structure ---
interface Choice {
  shortText: string; // Text for inside the button
  description: string; // Longer explanation below the button
  score: number;
}

interface CdrDomain {
  id: string;
  name: string;
  prompt: string;
  choices: Choice[];
}

// --- Updated cdrData with shortText and description ---
const cdrData: CdrDomain[] = [
  {
    id: 'M',
    name: 'Memory',
    prompt: 'How well do you remember recent events, appointments, or conversations?',
    choices: [
      { shortText: 'Normal', description: 'No memory loss.', score: 0 },
      { shortText: 'Mild Forgetfulness', description: 'Mild, consistent forgetfulness; partial recall of events; "benign" forgetfulness.', score: 0.5 },
      { shortText: 'Moderate Loss', description: 'Moderate memory loss; more marked for recent events; defect interferes with everyday activities.', score: 1 },
      { shortText: 'Severe Loss', description: 'Severe memory loss; only highly learned material retained; new material rapidly lost.', score: 2 },
      { shortText: 'Profound Loss', description: 'Severe memory loss; only fragments remain.', score: 3 },
    ],
  },
  {
    id: 'O',
    name: 'Orientation',
    prompt: 'How well do you know the current date, day of the week, and find your way around familiar places?',
    choices: [
      { shortText: 'Normal', description: 'Fully oriented.', score: 0 },
      { shortText: 'Minor Time Errors', description: 'Fully oriented, except for some difficulty with time relationships.', score: 0.5 },
      { shortText: 'Moderate Time Errors', description: 'Moderate difficulty with time relationships; orientation for place maintained.', score: 1 },
      { shortText: 'Severe Time/Place Errors', description: 'Severe difficulty with time relationships; usually disoriented to time, often to place.', score: 2 },
      { shortText: 'Person Only', description: 'Oriented to person only.', score: 3 },
    ],
  },
  {
    id: 'JPS',
    name: 'Judgment & Problem Solving',
    prompt: 'How well do you handle problems, business affairs, or financial decisions compared to usual?',
    choices: [
      { shortText: 'Normal', description: 'Solves everyday problems well; judgment good in relation to past performance.', score: 0 },
      { shortText: 'Slight Impairment', description: 'Slight impairment in solving problems, similarities, and differences.', score: 0.5 },
      { shortText: 'Moderate Difficulty', description: 'Moderate difficulty in handling problems, similarities, differences; social judgment usually maintained.', score: 1 },
      { shortText: 'Severe Impairment', description: 'Severely impaired in handling problems; social judgment usually impaired.', score: 2 },
      { shortText: 'Unable', description: 'Unable to make judgments or solve problems.', score: 3 },
    ],
  },
  {
    id: 'CA',
    name: 'Community Affairs',
    prompt: 'How involved are you in community activities, work, shopping, or social groups compared to usual?',
    choices: [
      { shortText: 'Normal', description: 'Independent function at usual level in job, shopping, volunteer/groups.', score: 0 },
      { shortText: 'Slight Impairment', description: 'Slight impairment in these activities.', score: 0.5 },
      { shortText: 'Needs Some Help', description: 'Unable to function independently at these activities, though may still be engaged in some; appears normal to casual inspection.', score: 1 },
      { shortText: 'Needs Support Outside', description: 'No pretense of independent function outside home; Appears well enough to be taken to functions outside a family home.', score: 2 },
      { shortText: 'Appears Too Ill', description: 'No pretense of independent function outside home; Appears too ill to be taken to functions outside a family home.', score: 3 },
    ],
  },
  {
    id: 'HH',
    name: 'Home & Hobbies',
    prompt: 'How well are you managing household chores or hobbies compared to your usual?',
    choices: [
      { shortText: 'Normal', description: 'Life at home, hobbies, intellectual interests well maintained.', score: 0 },
      { shortText: 'Slight Impairment', description: 'Life at home, hobbies, intellectual interests slightly impaired.', score: 0.5 },
      { shortText: 'Mild Impairment', description: 'Mild but definite impairment of function at home; more difficult chores abandoned; more complicated hobbies/interests abandoned.', score: 1 },
      { shortText: 'Simple Chores Only', description: 'Only simple chores preserved; very restricted interests, poorly sustained.', score: 2 },
      { shortText: 'None', description: 'No significant function in home.', score: 3 },
    ],
  },
  {
    id: 'PC',
    name: 'Personal Care',
    prompt: 'How independently are you managing personal tasks like dressing, hygiene, and eating?',
    choices: [
      { shortText: 'Normal', description: 'Fully capable of self-care.', score: 0 },
      { shortText: 'Needs Prompting', description: 'Needs occasional prompting.', score: 1 }, // Note: PC jumps from 0 to 1
      { shortText: 'Needs Assistance', description: 'Requires assistance in dressing, hygiene, keeping of personal effects.', score: 2 },
      { shortText: 'Needs Much Help', description: 'Requires much help with personal care; frequently incontinent.', score: 3 },
    ],
  },
];

// --- Scoring Logic ---
type Scores = Record<string, number>; // e.g., { M: 0.5, O: 0, JPS: 0, ... }

function calculateCdrSb(scores: Scores): number {
  return Object.values(scores).reduce((sum, score) => sum + score, 0);
}

function calculateGlobalCdr(scores: Scores): number {
  const M = scores['M'];
  const O = scores['O'];
  const JPS = scores['JPS'];
  const CA = scores['CA'];
  const HH = scores['HH'];
  const PC = scores['PC'];

  const secondaryScores = [O, JPS, CA, HH, PC];

  // Rule 1: Memory is primary
  if (M === undefined) return -1; // Error case

  // Handle M=0 case first
  if (M === 0) {
    const numImpairedSecondary = secondaryScores.filter(score => score >= 0.5).length;
    return numImpairedSecondary >= 2 ? 0.5 : 0;
  }

  // Handle M=0.5 case
  if (M === 0.5) {
    const numZeroSecondary = secondaryScores.filter(score => score === 0).length;
    return numZeroSecondary >= 3 ? 0 : 0.5;
  }

  // General Case (M >= 1)
  const numEqualToM = secondaryScores.filter(score => score === M).length;
  const numHigherThanM = secondaryScores.filter(score => score > M).length;
  const numLowerThanM = secondaryScores.filter(score => score < M).length; // Excludes M=0.5 scenario here due to prior check

  const secondaryCount = secondaryScores.length; // Should be 5

  // If 3 or more secondary scores are equal to M, Global = M
  if (numEqualToM >= Math.ceil(secondaryCount / 2)) { // Usually 3 out of 5
      return M;
  }

  // Determine majority side
  if (numLowerThanM > Math.floor(secondaryCount / 2)) { // Majority are less severe than M
    // If M is 1, and a majority of secondaries are 0.5 or 0, Global CDR is 0.5
     if (M === 1 && (numEqualToM + numLowerThanM) > Math.floor(secondaryCount / 2)) {
         return 0.5;
     }
     // If M > 1 and a majority of secondaries are less severe than M, Global CDR is M-1
     if (M > 1 && numLowerThanM > Math.floor(secondaryCount / 2)) {
        return M - 1;
     }
  }

  if (numHigherThanM > Math.floor(secondaryCount / 2)) { // Majority are more severe than M
      // If a majority of secondaries are higher than M, Global CDR is M+1
      if (numHigherThanM > Math.floor(secondaryCount / 2)) {
          return M + 1;
      }
  }

  // Default to M if no majority rule applies clearly (should cover ties where Memory dictates)
  return M;

  // Simplified approach: If not clearly higher or lower majority, stick with M.
  // This covers cases where scores are distributed around M without a clear trend.
}


// --- Component ---
export default function ScreeningPage() {
  // Survey stage tracking
  enum SurveyStage {
    Intro,       // Introduction with typing animations
    Username,    // Username collection
    Age,         // Age collection
    Questions,   // CDR questions
    FinalComment // Final open-ended comment
  }
  
  // Original states 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [scores, setScores] = useState<Scores>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [results, setResults] = useState<{ cdrSb: number; globalCdr: number } | null>(null);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  
  // New states for additional questions
  const [surveyStage, setSurveyStage] = useState<SurveyStage>(SurveyStage.Intro);
  const [username, setUsername] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [finalComment, setFinalComment] = useState<string>('');
  
  // Intro sequence states
  const introMessages = [
    "Welcome to Neurotone. We will have you complete a short survey before you begin.",
    "The contents of this survey are highly secured and not available to anyone. It is only used to create a starting point to understand how to personalize your plan.",
    "Some of the survey questions would be easier to answer with a caretaker or family member if available.",
    "Let's get started!"
  ];
  const [currentIntroIndex, setCurrentIntroIndex] = useState(0);
  const [showNextButton, setShowNextButton] = useState(false);
  
  // Effect to reset button visibility for intro stage
  useEffect(() => {
    if (surveyStage === SurveyStage.Intro) {
      // Reset button visibility when the message index changes
      setShowNextButton(false);
      // Animation will be triggered by the key change on the motion.div
    }
  }, [currentIntroIndex, surveyStage]); // Depends only on index and stage change
  
  // Handle intro progression
  const handleIntroNext = () => {
    if (currentIntroIndex < introMessages.length - 1) {
      setCurrentIntroIndex(currentIntroIndex + 1);
    } else {
      // Move to username screen when all messages are shown
      setDirection('forward');
      setSurveyStage(SurveyStage.Username);
    }
  };

  const currentDomain = cdrData[currentQuestionIndex];

  // Validation
  const isUsernameValid = username.trim().length > 0;
  const isAgeValid = age.trim().length > 0;

  const handleSelectChoice = (score: number) => {
    const newScores = { ...scores, [currentDomain.id]: score };
    setScores(newScores);
    
    // Automatically advance to the next question if not on the last question
    if (currentQuestionIndex < cdrData.length - 1) {
      setDirection('forward');
      // Small delay to show the selection before advancing
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    } else {
      // If on last question, advance to final comment
      setDirection('forward');
      setTimeout(() => {
        setSurveyStage(SurveyStage.FinalComment);
      }, 300);
    }
  };

  const handleNext = () => {
    // In Questions stage
    if (surveyStage === SurveyStage.Questions) {
      // Check if the current question has been answered before proceeding
      if (scores[currentDomain?.id] === undefined) return;

      if (currentQuestionIndex < cdrData.length - 1) {
        setDirection('forward');
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Last question completed, move to final comment
        setDirection('forward');
        setSurveyStage(SurveyStage.FinalComment);
      }
    }
  };

  const handlePrevious = () => {
    // In Questions stage
    if (surveyStage === SurveyStage.Questions) {
      if (currentQuestionIndex > 0) {
        setDirection('backward');
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else {
        // First question, go back to age
        setDirection('backward');
        setSurveyStage(SurveyStage.Age);
      }
    } else if (surveyStage === SurveyStage.Age) {
      // Go back to username
      setDirection('backward');
      setSurveyStage(SurveyStage.Username);
    } else if (surveyStage === SurveyStage.Username) {
      // Go back to intro (last message)
      setDirection('backward');
      setSurveyStage(SurveyStage.Intro);
      setCurrentIntroIndex(introMessages.length - 1);
    } else if (surveyStage === SurveyStage.FinalComment) {
      // In final comment, go back to last question
      setDirection('backward');
      setSurveyStage(SurveyStage.Questions);
    }
  };

  // Submit username and proceed to age
  const handleUsernameSubmit = () => {
    if (isUsernameValid) {
      setDirection('forward');
      setSurveyStage(SurveyStage.Age);
    }
  };
  
  // Submit age and proceed to questions
  const handleAgeSubmit = () => {
    if (isAgeValid) {
      setDirection('forward');
      setSurveyStage(SurveyStage.Questions);
    }
  };

  // Submit final comment and complete the survey
  const handleFinalSubmit = () => {
    // Calculate results
    const cdrSb = calculateCdrSb(scores);
    const globalCdr = calculateGlobalCdr(scores);
    setResults({ cdrSb, globalCdr });
    setIsCompleted(true);
    console.log("Screening Complete. Raw Scores:", scores);
    console.log("Calculated CDR-SB:", cdrSb);
    console.log("Calculated Global CDR:", globalCdr);
    console.log("Username:", username);
    console.log("Age:", age);
    console.log("Final Comment:", finalComment);
  };

  // Determine button states
  const isCurrentQuestionAnswered = scores[currentDomain?.id] !== undefined;
  const isLastQuestion = currentQuestionIndex === cdrData.length - 1;

  const questionVariants = {
    hidden: (custom: 'forward' | 'backward') => ({
      opacity: 0,
      x: custom === 'forward' ? 100 : -100,
      transition: { duration: 0.3 }
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    },
    exit: (custom: 'forward' | 'backward') => ({
      opacity: 0,
      x: custom === 'forward' ? -100 : 100,
      transition: { duration: 0.3 }
    }),
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const resultVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.3 } },
  };

  // Pulsating animation for next button
  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  };

  const sentenceVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.3, // Delay before starting the sentence fade-in
        staggerChildren: 0.025, // Time between each letter fading in (adjust for speed)
      },
    },
  };

  const letterVariant = {
    hidden: { opacity: 0, y: 10 }, // Start faded out and slightly down
    visible: {
      opacity: 1,
      y: 0,
      transition: {
          type: 'spring', // Optional: use spring for a little bounce
          damping: 12,
          stiffness: 100,
          // Or simpler fade: duration: 0.3
      }
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow w-full flex flex-col items-center justify-center px-4 pt-20 pb-4 bg-gradient-to-b from-bg-color to-primary-teal/5">
        <AnimatePresence mode="wait" custom={direction}>
          {!isCompleted ? (
            <>
              {surveyStage === SurveyStage.Intro && (
                <motion.div
                  // Key still ensures re-animation on index change
                  key={`intro-${currentIntroIndex}`}
                  // Use standard fade for the overall container entrance/exit
                  variants={fadeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full max-w-3xl min-h-[70vh] flex flex-col items-center justify-between py-10 text-center relative"
                >
                  {/* Fixed height text container in the middle */}
                  <div className="flex-1 flex items-center justify-center">
                    {/* Container for the staggered letters */}
                    <motion.div
                      className="text-xl md:text-2xl text-dark-blue font-medium max-w-2xl leading-relaxed text-center"
                      variants={sentenceVariant}
                      initial="hidden"
                      animate="visible"
                      onAnimationComplete={() => setShowNextButton(true)}
                    >
                      {introMessages[currentIntroIndex].split(" ").map((word, wordIndex) => (
                        <span key={`word-${wordIndex}`} className="inline-block mr-1 mb-1">
                          {word.split("").map((char, charIndex) => (
                            <motion.span 
                              key={`${char}-${wordIndex}-${charIndex}`} 
                              variants={letterVariant}
                              className="inline-block"
                            >
                              {/* eslint-disable-next-line react/no-unescaped-entities */}
                              {char === " " ? "\u00A0" : char}
                            </motion.span>
                          ))}
                        </span>
                      ))}
                    </motion.div>
                  </div>
                  
                  {/* Fixed position button container at bottom */}
                  <div className="h-32 flex items-center justify-center w-full">
                    {showNextButton && (
                      <motion.button
                        onClick={handleIntroNext}
                        variants={pulseVariants}
                        animate="pulse"
                        className="px-12 py-4 bg-white rounded-full border-2 border-dark-blue text-dark-blue text-base font-medium hover:bg-blue-teal/10 transition-all duration-200 cursor-pointer"
                      >
                        {currentIntroIndex < introMessages.length - 1 ? 'Continue' : 'Get Started'}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
              
              {surveyStage === SurveyStage.Username && (
                <motion.div
                  key="username"
                  variants={questionVariants}
                  custom={direction}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full max-w-5xl text-center flex flex-col items-center"
                >
                  <h1 className="text-xl font-semibold text-dark-blue mb-4 animate-pulse-slow">
                    Before We Begin
                  </h1>
                  <p className="text-xl sm:text-2xl font-medium text-medium-blue/95 mb-10 animate-pulse-slow max-w-3xl">
                    Please choose a username
                  </p>
                  
                  <div className="w-full max-w-md space-y-8 flex flex-col items-center">
                    <div className="w-full space-y-2">
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-blue-teal/30 focus:border-blue-teal focus:ring-1 focus:ring-blue-teal focus:outline-none bg-white/80 text-dark-blue text-lg"
                        placeholder="Enter a username"
                      />
                    </div>
                    
                    <div className="flex w-full justify-between gap-4">
                      <button
                        onClick={handlePrevious}
                        className="flex-1 px-6 py-3 rounded-lg bg-white border-2 border-dark-blue/50 text-dark-blue hover:bg-blue-teal/10 transition-all duration-200 cursor-pointer"
                      >
                        Back
                      </button>
                      
                      <button
                        onClick={handleUsernameSubmit}
                        disabled={!isUsernameValid}
                        className="flex-1 px-6 py-3 rounded-lg bg-white border-2 border-dark-blue text-dark-blue hover:bg-blue-teal/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {surveyStage === SurveyStage.Age && (
                <motion.div
                  key="age"
                  variants={questionVariants}
                  custom={direction}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full max-w-5xl text-center flex flex-col items-center"
                >
                  <h1 className="text-xl font-semibold text-dark-blue mb-4 animate-pulse-slow">
                    About You
                  </h1>
                  <p className="text-xl sm:text-2xl font-medium text-medium-blue/95 mb-10 animate-pulse-slow max-w-3xl">
                    What is your age?
                  </p>
                  
                  <div className="w-full max-w-md space-y-8 flex flex-col items-center">
                    <div className="w-full space-y-2">
                      <input
                        type="number"
                        id="age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        min="18"
                        max="120"
                        className="w-full px-4 py-3 rounded-lg border-2 border-blue-teal/30 focus:border-blue-teal focus:ring-1 focus:ring-blue-teal focus:outline-none bg-white/80 text-dark-blue text-lg"
                        placeholder="Enter your age"
                      />
                    </div>
                    
                    <div className="flex w-full justify-between gap-4">
                      <button
                        onClick={handlePrevious}
                        className="flex-1 px-6 py-3 rounded-lg bg-white border-2 border-dark-blue/50 text-dark-blue hover:bg-blue-teal/10 transition-all duration-200 cursor-pointer"
                      >
                        Back
                      </button>
                      
                      <button
                        onClick={handleAgeSubmit}
                        disabled={!isAgeValid}
                        className="flex-1 px-6 py-3 rounded-lg bg-white border-2 border-dark-blue text-dark-blue hover:bg-blue-teal/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                      >
                        Continue to Screening
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {surveyStage === SurveyStage.Questions && (
                <motion.div
                  key={`question-${currentQuestionIndex}`}
                  variants={questionVariants}
                  custom={direction}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full max-w-5xl text-center flex flex-col items-center"
                >
                  <h1 className="text-xl font-semibold text-dark-blue mb-4 animate-pulse-slow">
                    {currentDomain?.name}
                  </h1>
                  <p className="text-xl sm:text-2xl font-medium text-medium-blue/95 mb-10 animate-pulse-slow max-w-3xl">
                    {currentDomain?.prompt}
                  </p>
                  
                  <div className="flex flex-row flex-nowrap justify-center items-start gap-6 w-full mb-20">
                    {currentDomain?.choices.map((choice, index) => {
                      const isSelected = scores[currentDomain.id] === choice.score;
                      return (
                        <div key={index} className="flex flex-col items-center text-center flex-1">
                          <motion.button
                            onClick={() => handleSelectChoice(choice.score)}
                            whileHover={{ scale: 1.05, y: -2 }}
                            transition={{ duration: 0.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-full min-h-[70px] px-3 py-3 rounded-lg transition-all duration-100 text-center text-sm flex items-center justify-center cursor-pointer border-2 ${
                              isSelected
                                ? 'bg-white text-dark-blue scale-105'
                                : 'bg-white border-transparent hover:bg-blue-teal/20 text-medium-blue hover:text-dark-blue'
                            }`}
                          >
                            {choice.shortText}
                          </motion.button>
                          <p className="mt-4 text-[10px] font-light text-medium-blue/70 max-w-[150px]">
                            {choice.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              
              {surveyStage === SurveyStage.FinalComment && (
                <motion.div
                  key="finalComment"
                  variants={questionVariants}
                  custom={direction}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full max-w-5xl min-h-[70vh] text-center flex flex-col items-center justify-center"
                >
                  <h1 className="text-xl font-semibold text-dark-blue mb-4 animate-pulse-slow">
                    Final Thoughts
                  </h1>
                  <p className="text-xl sm:text-2xl font-medium text-medium-blue/95 mb-10 animate-pulse-slow max-w-3xl">
                    Is there anything else you'd like to share before we get started?
                  </p>
                  
                  <div className="w-full max-w-md flex flex-col items-center mb-10">
                    <textarea
                      value={finalComment}
                      onChange={(e) => setFinalComment(e.target.value)}
                      className="w-full h-40 px-5 py-4 rounded-lg bg-white focus:outline-none text-dark-blue resize-none"
                      placeholder="Share any additional thoughts or concerns (optional)"
                    />
                    
                    <div className="flex justify-between mt-8 w-full">
                      <button
                        onClick={handlePrevious}
                        className="px-6 py-3 rounded-lg bg-white border-2 border-dark-blue/50 text-dark-blue hover:bg-blue-teal/10 transition-all duration-200 cursor-pointer"
                      >
                        Back to Questions
                      </button>
                      
                      <button
                        onClick={handleFinalSubmit}
                        className="px-6 py-3 rounded-lg bg-white border-2 border-dark-blue text-dark-blue hover:bg-blue-teal/10 transition-all duration-200 cursor-pointer"
                      >
                        Submit & See Results
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
             <motion.div
              key="results"
              variants={resultVariants}
              initial="hidden"
              animate="visible"
              className="w-full max-w-xl text-center bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center justify-center"
            >
              <h1 className="text-3xl font-bold text-dark-blue mb-4">Screening Complete</h1>
              <p className="text-lg text-medium-blue/90 mb-6">
                Thank you for completing the initial screening. Your results are shown below.
              </p>
              {results && (
                 <div className="space-y-3 text-left bg-primary-teal/5 p-6 rounded-lg border border-primary-teal/20 w-full">
                    <p className="text-lg font-semibold text-dark-blue">
                        CDR Sum-of-Boxes (CDR-SB): <span className="font-bold text-blue-teal">{results.cdrSb}</span>
                    </p>
                    <p className="text-lg font-semibold text-dark-blue">
                        Global CDR Score: <span className="font-bold text-blue-teal">{results.globalCdr}</span>
                    </p>
                 </div>
              )}
              <p className="mt-6 text-medium-blue/80 text-sm">
                This is a preliminary screening. Please consult a healthcare professional for a formal diagnosis.
              </p>
               <p className="mt-4 text-medium-blue/80 text-sm">
                Next step: Account creation (to be implemented).
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Fixed Bottom Navigation Bar - Only visible during Questions stage */}
      {surveyStage === SurveyStage.Questions && (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 h-full flex justify-between items-center text-sm">
            {/* Question counter */}
            <p className="text-medium-blue/70 font-medium">
              Question {currentQuestionIndex + 1} of {cdrData.length}
            </p>
            
            {/* Previous Button - Smaller, text-based */}
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="text-medium-blue hover:text-dark-blue disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
            >
              ← Previous
            </button>

            {/* Next/Finish Button - Smaller, text-based */}
            <button
              onClick={handleNext}
              disabled={!isCurrentQuestionAnswered}
              className="text-medium-blue hover:text-dark-blue disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
            >
              {isLastQuestion ? 'Finish Survey' : 'Next'} →
            </button>

            {/* Skip Button - Keep as Link */}
            <Link href="/dashboard"
              className="text-medium-blue hover:text-dark-blue hover:underline transition-colors font-medium">
              Skip for now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
