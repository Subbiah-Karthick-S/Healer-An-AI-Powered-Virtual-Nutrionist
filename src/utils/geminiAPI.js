import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateMealPlan = async (userDetails) => {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Calculate BMI if not provided
    const bmiValue = userDetails.bmi?.value || calculateBMI(userDetails.weight, userDetails.height);
    const bmiCategory = userDetails.bmi?.category || getBMICategory(bmiValue);

    const prompt = `
      You are an expert nutritionist, chef, and medical AI assistant. Based on the following comprehensive health profile, generate exactly 5 detailed, healthy meal recipes that will specifically address the person's health conditions and preferences.

      HEALTH PROFILE:
      - Name: ${userDetails.name}
      - Age: ${userDetails.age}
      - Gender: ${userDetails.gender}
      - Height: ${userDetails.height} cm
      - Weight: ${userDetails.weight} kg
      - BMI: ${bmiValue} (${bmiCategory})
      
      - Blood Pressure: ${userDetails.bpAdvancedMode ? `${userDetails.systolic}/${userDetails.diastolic} mmHg` : userDetails.bpLevel}
      - Cholesterol: ${userDetails.cholesterolAdvancedMode ? `${userDetails.totalCholesterol} mg/dL` : userDetails.cholesterolLevel}
      - Diabetes Fasting: ${userDetails.diabetesFasting || 'Not specified'} mg/dL
      - Diabetes Post-Meal: ${userDetails.diabetesPostMeal || 'Not specified'} mg/dL
      
      - Allergies: ${userDetails.allergies?.length > 0 ? userDetails.allergies.join(', ') : 'None'}
      - Activity Level: ${userDetails.activityLevel}
      - Available Ingredients: ${userDetails.availableIngredients || 'Not specified'}
      - Health Issues: ${userDetails.healthIssues?.length > 0 ? userDetails.healthIssues.join(', ') : 'None specified'}

      CRITICAL REQUIREMENTS:
      1. PRIORITIZE medical conditions: High BP → Low-sodium (<500mg/serving), High Cholesterol → High-fiber, low-saturated fat
      2. AVOID ALLERGIES: Strictly exclude any ingredients related to: ${userDetails.allergies?.join(', ') || 'none'}
      3. PREFER available ingredients: ${userDetails.availableIngredients || 'use common healthy ingredients'}
      4. Address specific health issues with targeted nutrition: ${userDetails.healthIssues?.join(', ') || 'general health maintenance'}

      RECIPE REQUIREMENTS:
      1. Make recipes VERY DETAILED and PRACTICAL for home cooking
      2. Include exact quantities and measurements for all ingredients
      3. Provide clear, numbered step-by-step cooking instructions
      4. Specify cooking time, temperature, and techniques
      5. Include total calorie count and macronutrient breakdown
      6. Calculate ingredient-level calorie distribution
      7. Explain why this meal helps their specific conditions
      8. Specify dietary category (Vegetarian, Eggetarian, Non-vegetarian, Vegan)
      9. Include estimated cooking time category (<15min, 15-30min, 30-60min, >60min)

      Please respond with ONLY valid JSON in this exact format (no additional text):
      {
        "meals": [
          {
            "name": "Detailed Recipe Name with Health Benefits",
            "dietaryPreference": "Vegetarian/Eggetarian/Non-vegetarian/Vegan",
            "cookingTime": "15-30min",
            "totalCalories": 450,
            "ingredients": [
              "1 cup specific ingredient with quantity", 
              "2 tablespoons another ingredient", 
              "1/2 pound protein with details"
            ],
            "ingredientCalories": {
              "ingredient1": 150,
              "ingredient2": 80,
              "ingredient3": 220
            },
            "nutrients": {
              "protein": 25,
              "carbs": 45,
              "fats": 15,
              "fiber": 8,
              "sugar": 12,
              "sodium": 380
            },
            "steps": [
              "Step 1: Detailed explanation including time and temperature", 
              "Step 2: Next detailed step with specific instructions", 
              "Step 3: Continue with clear, elaborate instructions"
            ],
            "keyBenefits": "Brief description of key health benefits for this user",
            "whyThisHelps": "Detailed explanation of how this meal addresses specific health conditions with scientific rationale",
            "matchScore": 92
          }
        ]
      }

      Generate exactly 5 different meal recipes. Make each recipe medically appropriate, nutritionally balanced, and practical for home cooking.
      Focus on ingredients that specifically help with their health conditions and consider their activity level and available ingredients.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw API Response:', text);

    // Clean and parse the response
    let cleanedText = text.trim();
    
    // Remove any markdown formatting
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON in the response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Validate the structure
        if (parsedData.meals && Array.isArray(parsedData.meals) && parsedData.meals.length > 0) {
          console.log('Successfully parsed meals:', parsedData.meals.length);
          return parsedData;
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
      }
    }
    
    // Fallback: Create sample meals if parsing fails
    return createFallbackMeals(userDetails, bmiValue, bmiCategory);
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    console.error('Error details:', error.message);
    
    // Return fallback meals in case of error
    return createFallbackMeals(userDetails);
  }
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

// Helper function to create fallback meals
function createFallbackMeals(userDetails, bmiValue, bmiCategory) {
  const hasHighBP = userDetails.bpLevel === 'High' || (userDetails.systolic > 130);
  const hasHighCholesterol = userDetails.cholesterolLevel === 'High' || (userDetails.totalCholesterol > 200);
  const hasDiabetes = userDetails.diabetesFasting || userDetails.diabetesPostMeal;
  
  return {
    meals: [
      {
        name: "Heart-Healthy Mediterranean Quinoa Bowl with Avocado & Salmon",
        dietaryPreference: "Non-vegetarian",
        cookingTime: "25-30min",
        totalCalories: 480,
        ingredients: [
          "1 cup organic quinoa, rinsed thoroughly",
          "2 cups low-sodium vegetable broth",
          "4 oz wild-caught salmon fillet",
          "1/2 large ripe avocado, sliced",
          "1 cup fresh baby spinach leaves",
          "1/4 cup cherry tomatoes, halved",
          "2 tablespoons extra virgin olive oil",
          "1 tablespoon fresh lemon juice",
          "1 teaspoon dried oregano",
          "1/2 teaspoon garlic powder",
          "1/4 cup red onion, finely diced",
          "Salt and black pepper to taste"
        ],
        ingredientCalories: {
          "quinoa": 220,
          "salmon": 180,
          "avocado": 120,
          "olive oil": 240,
          "vegetables": 60,
          "seasonings": 10
        },
        nutrients: {
          "protein": 28,
          "carbs": 42,
          "fats": 22,
          "fiber": 9,
          "sugar": 4,
          "sodium": hasHighBP ? 380 : 450
        },
        steps: [
          "Rinse 1 cup quinoa under cold water using a fine mesh strainer for 2 minutes until water runs clear",
          "In a medium saucepan, bring 2 cups of low-sodium vegetable broth to a rolling boil over high heat",
          "Add rinsed quinoa to boiling broth, reduce heat to low, cover and simmer for 15 minutes until liquid is fully absorbed",
          "While quinoa cooks, preheat oven to 400°F and line a baking sheet with parchment paper",
          "Place 4 oz salmon fillet on baking sheet, drizzle with 1 tablespoon olive oil, and season with oregano, garlic powder, salt and pepper",
          "Bake salmon for 12-15 minutes until it flakes easily with a fork and reaches internal temperature of 145°F",
          "Remove quinoa from heat and let stand covered for 5 minutes, then fluff with fork to separate grains",
          "Prepare dressing by whisking together 1 tablespoon olive oil, lemon juice, and seasonings in a small bowl",
          "Assemble bowls with spinach base, warm quinoa, flaked salmon, avocado slices, tomatoes, and red onion",
          "Drizzle with prepared dressing and serve immediately for optimal freshness and nutrition"
        ],
        keyBenefits: "Low sodium, high omega-3, rich in fiber and antioxidants",
        whyThisHelps: "Salmon provides anti-inflammatory omega-3 fatty acids that support cardiovascular health and help lower cholesterol. Quinoa offers complete protein and high fiber to stabilize blood sugar. Avocado provides healthy monounsaturated fats and potassium to help regulate blood pressure. Leafy greens are rich in nitrates that naturally lower blood pressure.",
        matchScore: 92
      },
      {
        name: "Blood Sugar Friendly Chickpea & Vegetable Curry with Brown Rice",
        dietaryPreference: "Vegan",
        cookingTime: "30-40min",
        totalCalories: 420,
        ingredients: [
          "1 cup brown rice, uncooked",
          "1 can (15 oz) low-sodium chickpeas, drained and rinsed",
          "1 cup cauliflower florets",
          "1/2 cup green beans, trimmed and cut",
          "1/2 onion, finely chopped",
          "2 cloves garlic, minced",
          "1 tablespoon fresh ginger, grated",
          "1 can (14 oz) diced tomatoes, no salt added",
          "1 cup light coconut milk",
          "2 teaspoons curry powder",
          "1 teaspoon turmeric",
          "1/2 teaspoon cumin",
          "1 tablespoon coconut oil",
          "Fresh cilantro for garnish"
        ],
        ingredientCalories: {
          "brown rice": 220,
          "chickpeas": 270,
          "vegetables": 80,
          "coconut milk": 120,
          "coconut oil": 120,
          "spices": 10
        },
        nutrients: {
          "protein": 18,
          "carbs": 65,
          "fats": 12,
          "fiber": 15,
          "sugar": 8,
          "sodium": hasHighBP ? 320 : 400
        },
        steps: [
          "Rinse 1 cup brown rice under cold water and cook according to package instructions using water or low-sodium broth",
          "Heat 1 tablespoon coconut oil in a large skillet over medium heat for 2 minutes until shimmering",
          "Add chopped onion and sauté for 5 minutes until translucent and fragrant",
          "Add minced garlic and grated ginger, cooking for 1 minute until aromatic but not browned",
          "Stir in curry powder, turmeric, and cumin, toasting spices for 30 seconds to release flavors",
          "Add diced tomatoes with their juices and bring mixture to a gentle simmer for 5 minutes",
          "Add drained chickpeas, cauliflower florets, and green beans to the skillet, stirring to coat with sauce",
          "Pour in light coconut milk and bring to a simmer, then reduce heat to low and cover",
          "Cook for 15-20 minutes until vegetables are tender but still have some bite",
          "Season with herbs and spices to taste, avoiding added salt for blood pressure concerns",
          "Serve over cooked brown rice, garnished with fresh cilantro leaves"
        ],
        keyBenefits: "High fiber, low glycemic index, plant-based protein",
        whyThisHelps: "Chickpeas provide slow-digesting carbohydrates and plant-based protein that help stabilize blood sugar levels. Brown rice has a lower glycemic index than white rice. Turmeric contains curcumin with anti-inflammatory properties. The high fiber content (15g) helps lower cholesterol and improves digestive health. This meal is specifically designed for diabetes management and heart health.",
        matchScore: 88
      },
      {
        name: "Immune-Boosting Ginger Turmeric Chicken Soup with Vegetables",
        dietaryPreference: "Non-vegetarian",
        cookingTime: "40-50min",
        totalCalories: 380,
        ingredients: [
          "6 cups low-sodium chicken broth",
          "2 chicken breasts, boneless and skinless",
          "1 tablespoon fresh ginger, grated",
          "2 teaspoons fresh turmeric, grated",
          "3 cloves garlic, minced",
          "1 onion, diced",
          "2 carrots, sliced",
          "2 celery stalks, chopped",
          "1 cup kale, stems removed and chopped",
          "1 zucchini, diced",
          "2 tablespoons olive oil",
          "1 bay leaf",
          "1 teaspoon thyme",
          "Black pepper to taste",
          "Fresh parsley for garnish"
        ],
        ingredientCalories: {
          "chicken": 230,
          "broth": 40,
          "vegetables": 80,
          "olive oil": 240,
          "herbs and spices": 10
        },
        nutrients: {
          "protein": 35,
          "carbs": 22,
          "fats": 18,
          "fiber": 6,
          "sugar": 8,
          "sodium": hasHighBP ? 350 : 420
        },
        steps: [
          "Heat 2 tablespoons olive oil in a large stockpot over medium heat for 2 minutes",
          "Add diced onion and sauté for 5 minutes until softened and translucent",
          "Add minced garlic, grated ginger and turmeric, cooking for 1 minute until fragrant",
          "Pour in 6 cups of low-sodium chicken broth and bring to a gentle boil",
          "Add whole chicken breasts to the pot along with bay leaf and thyme",
          "Reduce heat to low, cover and simmer for 20 minutes until chicken is cooked through",
          "Remove chicken from pot and set aside to cool slightly, then shred with two forks",
          "Add sliced carrots and chopped celery to the broth and simmer for 10 minutes until slightly tender",
          "Add diced zucchini and cook for another 5 minutes until all vegetables are tender but not mushy",
          "Return shredded chicken to the pot and add chopped kale, cooking for 2-3 minutes until kale wilts",
          "Season with black pepper to taste and remove bay leaf before serving",
          "Garnish with fresh parsley and serve hot for maximum immune-boosting benefits"
        ],
        keyBenefits: "Anti-inflammatory, hydrating, rich in vitamins and minerals",
        whyThisHelps: "Ginger and turmeric have powerful anti-inflammatory and immune-boosting properties. Chicken provides lean protein for tissue repair and immune function. The broth base ensures hydration while being low in calories. This soup is particularly beneficial for immune system support, inflammation reduction, and provides easily digestible nutrition during recovery from illness. The low sodium content makes it heart-healthy.",
        matchScore: 95
      },
      {
        name: "Low-Sodium Asian Stir-Fry with Tofu and Vegetables",
        dietaryPreference: "Vegetarian",
        cookingTime: "20-25min",
        totalCalories: 350,
        ingredients: [
          "8 oz firm tofu, pressed and cubed",
          "2 cups mixed vegetables (broccoli, bell peppers, carrots, snap peas)",
          "2 cloves garlic, minced",
          "1 tablespoon fresh ginger, grated",
          "2 tablespoons low-sodium soy sauce",
          "1 tablespoon rice vinegar",
          "1 teaspoon sesame oil",
          "1 tablespoon olive oil",
          "1 teaspoon cornstarch",
          "2 tablespoons water",
          "1/4 cup green onions, chopped",
          "1 tablespoon sesame seeds",
          "1 cup brown rice, cooked"
        ],
        ingredientCalories: {
          "tofu": 180,
          "vegetables": 100,
          "rice": 220,
          "oils": 120,
          "sauces": 30,
          "seasonings": 10
        },
        nutrients: {
          "protein": 22,
          "carbs": 45,
          "fats": 12,
          "fiber": 8,
          "sugar": 6,
          "sodium": hasHighBP ? 320 : 380
        },
        steps: [
          "Press tofu for 15 minutes to remove excess water, then cut into 1-inch cubes",
          "Heat 1 tablespoon olive oil in a large wok or skillet over medium-high heat",
          "Add tofu cubes and cook for 5-7 minutes until golden brown on all sides, then remove from pan",
          "In the same pan, add minced garlic and grated ginger, cooking for 30 seconds until fragrant",
          "Add mixed vegetables and stir-fry for 4-5 minutes until crisp-tender",
          "In a small bowl, whisk together low-sodium soy sauce, rice vinegar, and cornstarch with water",
          "Return tofu to the pan and pour the sauce mixture over everything",
          "Stir constantly for 2-3 minutes until sauce thickens and coats the ingredients",
          "Drizzle with sesame oil and toss to combine",
          "Serve over cooked brown rice, garnished with green onions and sesame seeds"
        ],
        keyBenefits: "Low sodium, plant-based protein, rich in antioxidants",
        whyThisHelps: "Tofu provides complete plant-based protein that's low in saturated fat. The variety of vegetables offers diverse antioxidants and phytonutrients. Using low-sodium soy sauce makes this stir-fry heart-healthy. The high fiber content aids digestion and helps maintain stable blood sugar levels. This meal is excellent for weight management and cardiovascular health.",
        matchScore: 90
      },
      {
        name: "Omega-3 Rich Baked Mackerel with Roasted Sweet Potatoes and Greens",
        dietaryPreference: "Non-vegetarian",
        cookingTime: "30-35min",
        totalCalories: 420,
        ingredients: [
          "2 mackerel fillets (6 oz each)",
          "2 medium sweet potatoes, peeled and cubed",
          "4 cups mixed greens (spinach, arugula, kale)",
          "2 tablespoons olive oil",
          "1 lemon, sliced",
          "2 cloves garlic, minced",
          "1 teaspoon paprika",
          "1/2 teaspoon dried thyme",
          "1/4 teaspoon black pepper",
          "1 tablespoon balsamic vinegar",
          "1/4 cup red onion, thinly sliced"
        ],
        ingredientCalories: {
          "mackerel": 280,
          "sweet potatoes": 180,
          "greens": 40,
          "olive oil": 240,
          "seasonings": 10
        },
        nutrients: {
          "protein": 30,
          "carbs": 35,
          "fats": 18,
          "fiber": 7,
          "sugar": 12,
          "sodium": hasHighBP ? 280 : 350
        },
        steps: [
          "Preheat oven to 400°F and line two baking sheets with parchment paper",
          "Toss sweet potato cubes with 1 tablespoon olive oil, paprika, and black pepper",
          "Spread sweet potatoes in a single layer on one baking sheet and roast for 25-30 minutes until tender",
          "Place mackerel fillets on the second baking sheet, skin side down",
          "Rub fish with minced garlic, thyme, and remaining olive oil, then top with lemon slices",
          "Bake fish for 12-15 minutes until it flakes easily with a fork",
          "While fish and sweet potatoes cook, prepare salad with mixed greens and red onion",
          "Drizzle salad with balsamic vinegar and a pinch of black pepper",
          "Serve mackerel alongside roasted sweet potatoes and fresh green salad",
          "Squeeze additional lemon juice over fish before serving for extra flavor"
        ],
        keyBenefits: "High omega-3, anti-inflammatory, blood sugar stabilizing",
        whyThisHelps: "Mackerel is exceptionally rich in omega-3 fatty acids that reduce inflammation and support brain health. Sweet potatoes provide complex carbohydrates with a lower glycemic index than white potatoes. The combination of healthy fats, complex carbs, and fiber helps maintain stable blood sugar levels. This meal is particularly beneficial for heart health, cognitive function, and inflammation reduction.",
        matchScore: 93
      }
    ]
  };
}