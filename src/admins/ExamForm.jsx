import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import QuestionInput from "./QuestionInput";
import "../styles/examForm.css";

const ExamForm = () => {
  const { courseId } = useParams();
  const [description, setDescription] = useState(
    "General Knowledge Practice Test"
  );
  const [duration, setDuration] = useState(30);
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(
    // { text: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" },
    [
      {
        text: "What is the capital city of Australia?",
        options: ["Sydney", "Canberra", "Melbourne", "Perth"],
        correctAnswer: 1,
        explanation: "Canberra is the capital city, not Sydney or Melbourne.",
      },
      {
        text: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Mercury"],
        correctAnswer: 1,
        explanation:
          "Mars is called the Red Planet due to its iron oxide surface.",
      },
      {
        text: "Who developed the theory of relativity?",
        options: [
          "Isaac Newton",
          "Nikola Tesla",
          "Albert Einstein",
          "Stephen Hawking",
        ],
        correctAnswer: 2,
        explanation:
          "Albert Einstein proposed both special and general relativity.",
      },
      {
        text: "Which gas do plants absorb during photosynthesis?",
        options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
        correctAnswer: 1,
        explanation: "Plants use carbon dioxide and release oxygen.",
      },
      {
        text: "What is the largest ocean on Earth?",
        options: [
          "Indian Ocean",
          "Pacific Ocean",
          "Atlantic Ocean",
          "Arctic Ocean",
        ],
        correctAnswer: 1,
        explanation: "The Pacific Ocean is the largest and deepest.",
      },
      {
        text: "Who wrote 'Romeo and Juliet'?",
        options: [
          "Charles Dickens",
          "Jane Austen",
          "William Shakespeare",
          "Mark Twain",
        ],
        correctAnswer: 2,
        explanation: "Shakespeare is the author of the famous tragedy.",
      },
      {
        text: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correctAnswer: 2,
        explanation: "2 is the only even prime number.",
      },
      {
        text: "What is the boiling point of water at sea level?",
        options: ["90°C", "100°C", "110°C", "120°C"],
        correctAnswer: 1,
        explanation: "Water boils at 100°C under standard pressure.",
      },
      {
        text: "Who painted the Mona Lisa?",
        options: [
          "Pablo Picasso",
          "Vincent van Gogh",
          "Leonardo da Vinci",
          "Claude Monet",
        ],
        correctAnswer: 2,
        explanation: "The Mona Lisa was painted by Leonardo da Vinci.",
      },
      {
        text: "Which is the longest river in the world?",
        options: [
          "Amazon River",
          "Nile River",
          "Yangtze River",
          "Mississippi River",
        ],
        correctAnswer: 1,
        explanation: "The Nile is slightly longer than the Amazon.",
      },
      {
        text: "What part of the cell contains genetic material?",
        options: ["Nucleus", "Cytoplasm", "Ribosome", "Cell wall"],
        correctAnswer: 0,
        explanation: "The nucleus contains DNA, the genetic material.",
      },
      {
        text: "Which language has the most native speakers worldwide?",
        options: ["English", "Mandarin Chinese", "Spanish", "Hindi"],
        correctAnswer: 1,
        explanation: "Mandarin Chinese has over 900 million native speakers.",
      },
      {
        text: "Which continent is the Sahara Desert located on?",
        options: ["Asia", "Africa", "Australia", "South America"],
        correctAnswer: 1,
        explanation: "The Sahara covers much of North Africa.",
      },
      {
        text: "Who invented the telephone?",
        options: [
          "Alexander Graham Bell",
          "Thomas Edison",
          "Guglielmo Marconi",
          "Nikola Tesla",
        ],
        correctAnswer: 0,
        explanation:
          "Alexander Graham Bell is credited with the invention of the telephone.",
      },
      {
        text: "What is the chemical symbol for gold?",
        options: ["Ag", "Au", "Gd", "Go"],
        correctAnswer: 1,
        explanation: "Gold’s symbol is Au, from its Latin name 'Aurum'.",
      },
      {
        text: "Which country is both an island and a continent?",
        options: ["Greenland", "Australia", "New Zealand", "Madagascar"],
        correctAnswer: 1,
        explanation: "Australia is the only country that is also a continent.",
      },
      {
        text: "Which vitamin is produced when the skin is exposed to sunlight?",
        options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"],
        correctAnswer: 3,
        explanation: "Sunlight helps the body produce Vitamin D.",
      },
      {
        text: "What is H2O commonly known as?",
        options: ["Hydrogen", "Oxygen", "Water", "Salt"],
        correctAnswer: 2,
        explanation: "H2O is the chemical formula for water.",
      },
      {
        text: "Which instrument measures atmospheric pressure?",
        options: ["Thermometer", "Barometer", "Altimeter", "Hygrometer"],
        correctAnswer: 1,
        explanation: "A barometer measures atmospheric pressure.",
      },
      {
        text: "What is the fastest land animal?",
        options: ["Lion", "Cheetah", "Horse", "Tiger"],
        correctAnswer: 1,
        explanation: "The cheetah can reach speeds up to 120 km/h.",
      },
      {
        text: "How many continents are there on Earth?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 2,
        explanation: "Earth has seven continents.",
      },
      {
        text: "Who is known as the father of computers?",
        options: [
          "Alan Turing",
          "Charles Babbage",
          "Bill Gates",
          "John von Neumann",
        ],
        correctAnswer: 1,
        explanation: "Charles Babbage designed the first mechanical computer.",
      },
      {
        text: "Which planet is closest to the Sun?",
        options: ["Venus", "Earth", "Mercury", "Mars"],
        correctAnswer: 2,
        explanation: "Mercury is the closest planet to the Sun.",
      },
      {
        text: "What is the main gas found in the air we breathe?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        correctAnswer: 2,
        explanation: "Nitrogen makes up about 78% of Earth’s atmosphere.",
      },
      {
        text: "What is the largest mammal on Earth?",
        options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
        correctAnswer: 1,
        explanation: "The blue whale is the largest mammal ever known.",
      },
      {
        text: "Which metal is liquid at room temperature?",
        options: ["Mercury", "Lead", "Silver", "Iron"],
        correctAnswer: 0,
        explanation: "Mercury is the only metal liquid at room temperature.",
      },
      {
        text: "What is the hardest natural substance on Earth?",
        options: ["Steel", "Gold", "Diamond", "Granite"],
        correctAnswer: 2,
        explanation: "Diamond is the hardest known natural material.",
      },
      {
        text: "Which organ in the human body pumps blood?",
        options: ["Brain", "Lungs", "Heart", "Liver"],
        correctAnswer: 2,
        explanation: "The heart pumps blood through the circulatory system.",
      },
      {
        text: "Which part of the plant conducts photosynthesis?",
        options: ["Stem", "Root", "Leaf", "Flower"],
        correctAnswer: 2,
        explanation: "Photosynthesis mainly occurs in the leaves.",
      },
      {
        text: "What is the largest planet in our solar system?",
        options: ["Saturn", "Neptune", "Earth", "Jupiter"],
        correctAnswer: 3,
        explanation: "Jupiter is the largest planet in our solar system.",
      },
    ]
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ]);
  };
  const handleDeleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, updated) => {
    const copy = [...questions];
    copy[index] = updated;
    setQuestions(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.post("/exam", {
        course: courseId,
        description,
        duration,
        questions,
      });
      setMessage("Exam created successfully!");
      navigate("/courses");
      console.log(res.data);
    } catch (err) {
      setMessage(err?.response?.data?.error || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exam-form-container">
      <h2>Create New Exam</h2>
      <form onSubmit={handleSubmit}>
        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label>Duration (minutes):</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          required
        />

        <h3>Questions</h3>
        {questions.map((q, i) => (
          <QuestionInput
            key={i}
            index={i}
            data={q}
            onDelete={() => handleDeleteQuestion(i)}
            onChange={(updated) => handleQuestionChange(i, updated)}
          />
        ))}

        <button type="button" onClick={handleAddQuestion} className="add-btn">
          + Add Question
        </button>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Saving..." : "Save Exam"}
        </button>
      </form>

      {message && <p className="msg">{message}</p>}
    </div>
  );
};

export default ExamForm;
