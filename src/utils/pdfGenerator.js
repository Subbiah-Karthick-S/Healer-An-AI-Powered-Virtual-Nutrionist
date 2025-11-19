import jsPDF from 'jspdf';

export const generatePDF = (userDetails, meals) => {
  // Initialize PDF with better defaults
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set Times New Roman font
  pdf.setFont('times');
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPosition = 25;

  // Header with improved styling
  pdf.setFontSize(22);
  pdf.setFont('times', 'bold');
  pdf.setTextColor(44, 138, 106); // HEALER green color
  pdf.text('HEALER - Personalized Meal Plan', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('times', 'italic');
  pdf.setTextColor(100, 100, 100);
  pdf.text('"An AI Powered Virtual Nutrionist for Your Health Needs"', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Divider line
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
  yPosition += 15;

  // User Details section
  pdf.setFontSize(16);
  pdf.setFont('times', 'bold');
  pdf.setTextColor(44, 138, 106);
  pdf.text('Health Profile Summary:', margin, yPosition);
  yPosition += 12;

  pdf.setFontSize(11);
  pdf.setFont('times', 'normal');
  pdf.setTextColor(0, 0, 0);

  // Calculate BMI if not provided
  const bmiValue = userDetails.bmi?.value || calculateBMI(userDetails.weight, userDetails.height);
  const bmiCategory = userDetails.bmi?.category || getBMICategory(bmiValue);

  const userDetailsLines = [
    `Name: ${userDetails.name}`,
    `Age: ${userDetails.age} | Gender: ${userDetails.gender}`,
    `Height: ${userDetails.height} cm | Weight: ${userDetails.weight} kg`,
    `BMI: ${bmiValue} (${bmiCategory})`,
    `Activity Level: ${userDetails.activityLevel}`,
    `Blood Pressure: ${userDetails.bpAdvancedMode ? `${userDetails.systolic}/${userDetails.diastolic} mmHg` : userDetails.bpLevel}`,
    `Cholesterol: ${userDetails.cholesterolAdvancedMode ? `${userDetails.totalCholesterol} mg/dL` : userDetails.cholesterolLevel}`,
    userDetails.diabetesFasting ? `Diabetes Fasting: ${userDetails.diabetesFasting} mg/dL` : null,
    userDetails.diabetesPostMeal ? `Diabetes Post-Meal: ${userDetails.diabetesPostMeal} mg/dL` : null,
    `Allergies: ${userDetails.allergies?.length > 0 ? userDetails.allergies.join(', ') : 'None'}`,
    `Health Issues: ${userDetails.healthIssues?.length > 0 ? userDetails.healthIssues.join(', ') : 'None specified'}`,
    `Available Ingredients: ${userDetails.availableIngredients || 'Not specified'}`,
    `Generated on: ${userDetails.submissionDate || new Date().toLocaleDateString()}`
  ].filter(Boolean);

  userDetailsLines.forEach(line => {
    const lines = pdf.splitTextToSize(line, maxWidth);
    lines.forEach(textLine => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(textLine, margin, yPosition);
      yPosition += 6;
    });
  });

  yPosition += 15;

  // Health Priority Summary
  pdf.setFontSize(12);
  pdf.setFont('times', 'bold');
  pdf.setTextColor(44, 138, 106);
  pdf.text('Health Priorities Applied:', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('times', 'italic');
  pdf.setTextColor(80, 80, 80);

  const healthPriorities = [];
  if (userDetails.bpLevel === 'High' || (userDetails.systolic > 130)) {
    healthPriorities.push('• Low sodium diet (<500mg per meal) for blood pressure management');
  }
  if (userDetails.cholesterolLevel === 'High' || (userDetails.totalCholesterol > 200)) {
    healthPriorities.push('• High fiber, low saturated fat for cholesterol control');
  }
  if (userDetails.diabetesFasting || userDetails.diabetesPostMeal) {
    healthPriorities.push('• Low glycemic index foods for blood sugar management');
  }
  if (userDetails.allergies?.length > 0) {
    healthPriorities.push(`• Allergen-free: Excluded ${userDetails.allergies.join(', ')}`);
  }
  if (userDetails.healthIssues?.length > 0) {
    healthPriorities.push(`• Targeted nutrition for: ${userDetails.healthIssues.join(', ')}`);
  }

  healthPriorities.forEach(priority => {
    const lines = pdf.splitTextToSize(priority, maxWidth);
    lines.forEach(textLine => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(textLine, margin + 5, yPosition);
      yPosition += 6;
    });
  });

  yPosition += 15;

  // Meals section
  pdf.setFontSize(16);
  pdf.setFont('times', 'bold');
  pdf.setTextColor(44, 138, 106);
  pdf.text('Personalized Meal Recommendations:', margin, yPosition);
  yPosition += 15;

  meals.forEach((meal, index) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }

    // Meal header with metadata
    pdf.setFontSize(14);
    pdf.setFont('times', 'bold');
    pdf.setTextColor(60, 100, 60);
    const mealName = `${index + 1}. ${meal.name}`;
    pdf.text(mealName, margin, yPosition);
    yPosition += 8;

    // Meal metadata
    pdf.setFontSize(10);
    pdf.setFont('times', 'normal');
    pdf.setTextColor(100, 100, 100);
    
    const metadata = [
      `Dietary: ${meal.dietaryPreference || 'Not specified'}`, 
      `Cooking Time: ${meal.cookingTime || 'Not specified'}`,
      `Total Calories: ${meal.totalCalories || 'N/A'}`,
      `Match Score: ${meal.matchScore || 'N/A'}%`
    ].filter(Boolean);

    metadata.forEach((meta, i) => {
      pdf.text(meta, margin + (i * 50), yPosition);
    });
    yPosition += 8;

    // Key benefits
    if (meal.keyBenefits) {
      pdf.setFontSize(10);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(44, 138, 106);
      pdf.text('Key Benefits:', margin, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('times', 'italic');
      pdf.setTextColor(80, 80, 80);
      const benefitLines = pdf.splitTextToSize(meal.keyBenefits, maxWidth);
      benefitLines.forEach(line => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }

    // Ingredients subheading
    pdf.setFontSize(12);
    pdf.setFont('times', 'bold');
    pdf.setTextColor(80, 80, 80);
    pdf.text('Ingredients:', margin, yPosition);
    yPosition += 8;

    // Ingredients list
    pdf.setFontSize(10);
    pdf.setFont('times', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    meal.ingredients.forEach(ingredient => {
      const lines = pdf.splitTextToSize(`• ${ingredient}`, maxWidth - 10);
      lines.forEach(textLine => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(textLine, margin + 5, yPosition);
        yPosition += 5;
      });
    });

    yPosition += 8;

    // Nutrition Information if available
    if (meal.nutrients) {
      pdf.setFontSize(12);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(80, 80, 80);
      pdf.text('Nutrition Information:', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('times', 'normal');
      
      const nutrientInfo = [
        `Protein: ${meal.nutrients.protein || 'N/A'}g`,
        `Carbohydrates: ${meal.nutrients.carbs || 'N/A'}g`,
        `Fats: ${meal.nutrients.fats || 'N/A'}g`,
        `Fiber: ${meal.nutrients.fiber || 'N/A'}g`,
        `Sugar: ${meal.nutrients.sugar || 'N/A'}g`,
        meal.nutrients.sodium ? `Sodium: ${meal.nutrients.sodium}mg` : null
      ].filter(Boolean);

      nutrientInfo.forEach((nutrient, i) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(nutrient, margin + 5 + (i % 2 * 80), yPosition + Math.floor(i / 2) * 5);
      });
      yPosition += Math.ceil(nutrientInfo.length / 2) * 5 + 8;
    }

    // Steps subheading
    pdf.setFontSize(12);
    pdf.setFont('times', 'bold');
    pdf.setTextColor(80, 80, 80);
    pdf.text('Preparation Instructions:', margin, yPosition);
    yPosition += 8;

    // Steps list
    pdf.setFontSize(10);
    pdf.setFont('times', 'normal');
    pdf.setTextColor(0, 0, 0);

    meal.steps.forEach((step, stepIndex) => {
      const stepText = `${stepIndex + 1}. ${step}`;
      const lines = pdf.splitTextToSize(stepText, maxWidth - 10);
      
      lines.forEach(textLine => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(textLine, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 2;
    });

    // Why This Helps section
    if (meal.whyThisHelps) {
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(44, 138, 106);
      pdf.text('Why This Meal Helps:', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('times', 'italic');
      pdf.setTextColor(80, 80, 80);
      const whyLines = pdf.splitTextToSize(meal.whyThisHelps, maxWidth - 10);
      whyLines.forEach(line => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
    }

    // Add space between meals
    yPosition += 15;
    
    // Add divider line between meals (except after last one)
    if (index < meals.length - 1) {
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
      yPosition += 10;
    }
  });

  // Medical Disclaimer
  pdf.addPage();
  yPosition = 20;
  
  pdf.setFontSize(14);
  pdf.setFont('times', 'bold');
  pdf.setTextColor(44, 138, 106);
  pdf.text('Important Medical Disclaimer', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  pdf.setFontSize(10);
  pdf.setFont('times', 'italic');
  pdf.setTextColor(100, 100, 100);
  
  const disclaimerText = [
    "HEALER provides meal suggestions based on the health information you provided.",
    "This is not a substitute for professional medical advice, diagnosis, or treatment.",
    "Always seek the advice of your physician or other qualified health provider with",
    "any questions you may have regarding a medical condition. Never disregard",
    "professional medical advice or delay in seeking it because of something you",
    "have read or received from this application.",
    "",
    "The meal plans generated are suggestions and should be adjusted based on",
    "your personal tolerances, preferences, and any specific medical advice you",
    "have received from your healthcare providers.",
    "",
    "If you have severe allergies, medical conditions, or are pregnant, please",
    "consult with your healthcare provider before making significant dietary changes."
  ];

  disclaimerText.forEach(line => {
    pdf.text(line, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
  });

  // Footer
  pdf.setFontSize(9);
  pdf.setFont('times', 'italic');
  pdf.setTextColor(150, 150, 150);
  const footerText = `Generated by HEALER - AI Powered Healthy Meal Planner • ${new Date().toLocaleDateString()}`;
  pdf.text(footerText, pageWidth / 2, 285, { align: 'center' });

  // Save PDF
  const fileName = `${userDetails.name.replace(/\s+/g, '_')}_HEALER_Meal_Plan.pdf`;
  pdf.save(fileName);
};

// Helper function to calculate BMI
function calculateBMI(weight, height) {
  if (!weight || !height) return 'N/A';
  const heightInM = height / 100;
  return (weight / (heightInM * heightInM)).toFixed(1);
}

// Helper function to get BMI category
function getBMICategory(bmiValue) {
  if (bmiValue === 'N/A') return 'Not calculated';
  const bmi = parseFloat(bmiValue);
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}