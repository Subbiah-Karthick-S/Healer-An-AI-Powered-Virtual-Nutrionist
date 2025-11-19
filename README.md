# Healer – AI Powered Virtual Nutritionist

**Healer** is an AI-powered virtual nutritionist that creates personalized meal plans by analyzing user health metrics, lifestyle patterns, allergies, and medical conditions. The system uses the Gemini AI model to generate intelligent diet suggestions, dynamic recipe scaling, nutritional visualizations, and downloadable PDF reports. No database is used—data is stored temporarily in session until the PDF is generated.

---

## Features

### User Features
- **Health Profile Input**: Users enter age, weight, height, gender, activity level, allergies, food preferences, and medical conditions.
- **AI-Powered Meal Plan Generation**: Uses Gemini API to produce personalized diet plans instantly.
- **Dynamic Recipe Scaling**: Adjust recipes based on servings with automatic nutritional recalculation.
- **Nutritional Chart Insights**: View calories, macronutrients, and micronutrients using interactive charts.
- **PDF Meal Plan Export**: Generate and download a structured diet plan PDF.
- **Session-Based Data Storage**: No database involved; all user details and AI output are held only during the session.

### System Features
- **Gemini AI Integration** for accurate and personalized meal planning.
- **Vite + Babel** for fast frontend performance and modern JavaScript compilation.
- **Native Node.js Server** to handle API requests and session logic.
- **Lightweight System Architecture** without database or heavy backend frameworks.
- **Responsive UI** optimized for all screen sizes.

---

## Screenshots

### Input

<img width="1898" height="865" alt="image" src="https://github.com/user-attachments/assets/b302d1eb-4e63-4655-ba35-911ca5af4cbc" />



<img width="1900" height="868" alt="image" src="https://github.com/user-attachments/assets/bc77b0fa-9265-4a74-80d5-d0c7dc1498f1" />



<img width="1901" height="867" alt="image" src="https://github.com/user-attachments/assets/a2484611-835d-46ad-8e6d-8f26eafbf615" />



<img width="1900" height="862" alt="image" src="https://github.com/user-attachments/assets/eaf8f139-de56-4931-919e-31e55074576c" />



<img width="1900" height="862" alt="image" src="https://github.com/user-attachments/assets/15699eb0-e448-4f9b-9b93-bc0951f58038" />



<img width="1895" height="857" alt="image" src="https://github.com/user-attachments/assets/d0be2381-8204-49dc-a7b8-bf636270c049" />



<img width="1895" height="862" alt="image" src="https://github.com/user-attachments/assets/c915d0c2-e157-4e30-ac19-ea3fd9fa985f" />



<img width="1882" height="862" alt="image" src="https://github.com/user-attachments/assets/36f96878-8584-4d62-9b80-bdadd48d6fb6" />



---

## Architecture Overview

### Components

1. **Frontend (React + Vite + Babel)**
   - Collects user input and displays results.
   - Sends requests to the Node.js backend.
   - Renders meal plans and charts.

2. **Backend (Pure Node.js)**
   - Uses the built-in `http` module.
   - Handles API routes manually without Express.
   - Calls Gemini API for meal plan generation.
   - Stores data in memory/session.
   - Generates PDF files on request.

3. **Gemini API**
   - Main engine used to create personalized diet plans based on user inputs.

4. **No Database**
   - All data is held only during the user session and cleared after PDF download.

---

