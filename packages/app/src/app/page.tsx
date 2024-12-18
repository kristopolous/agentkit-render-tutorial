"use client";

import { useState, useEffect } from "react";

interface Interest {
  id: number;
  name: string;
  email: string;
}

interface Question {
  id: number;
  interest_id: number;
  question: string;
  frequency: string;
}

const FREQUENCY_OPTIONS = [
  { value: "hourly", label: "Every hour" },
  { value: "daily", label: "Once a day" },
  { value: "weekly", label: "Once a week" },
  { value: "monthly", label: "Once a month" },
];

export default function Home() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newInterest, setNewInterest] = useState({ name: "", email: "" });
  const [newQuestion, setNewQuestion] = useState({
    interest_id: 0,
    question: "",
    frequency: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInterests();
    fetchQuestions();
  }, []);

  const fetchInterests = async () => {
    try {
      const response = await fetch("/api/interests");
      if (!response.ok) throw new Error("Failed to fetch interests");
      const data = await response.json();
      setInterests(data);
    } catch (err) {
      setError("Failed to load interests");
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions");
      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      setError("Failed to load questions");
      console.error(err);
    }
  };

  const addInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInterest),
      });

      if (!response.ok) throw new Error("Failed to create interest");

      const interest = await response.json();
      setInterests([interest, ...interests]);
      setNewInterest({ name: "", email: "" });
    } catch (err) {
      setError("Failed to add interest");
      console.error(err);
    }
  };

  const addQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });

      if (!response.ok) throw new Error("Failed to create question");

      const question = await response.json();
      setQuestions([question, ...questions]);
      setNewQuestion({ interest_id: 0, question: "", frequency: "" });
    } catch (err) {
      setError("Failed to add question");
      console.error(err);
    }
  };

  const removeInterest = async (id: number) => {
    try {
      const response = await fetch(`/api/interests?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete interest");

      setInterests(interests.filter((i) => i.id !== id));
      // Also remove associated questions
      setQuestions(questions.filter((q) => q.interest_id !== id));
    } catch (err) {
      setError("Failed to remove interest");
      console.error(err);
    }
  };

  const removeQuestion = async (id: number) => {
    try {
      const response = await fetch(`/api/questions?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete question");

      setQuestions(questions.filter((q) => q.id !== id));
    } catch (err) {
      setError("Failed to remove question");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6ef]">
      <header className="bg-[#ff6600] p-2 flex justify-between items-center">
        <h1 className="text-black font-bold">
          Hacker News Agent Configuration
        </h1>
        <button
          onClick={async () => {
            await fetch("/api/auth", { method: "DELETE" });
            window.location.href = "/login";
          }}
          className="text-black hover:text-gray-800 text-sm"
        >
          Logout
        </button>
      </header>

      <main className="flex-grow max-w-3xl mx-auto w-full p-4 mb-16">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Interests Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Interests</h2>

          <form onSubmit={addInterest} className="mb-4">
            <input
              type="text"
              placeholder="Interest name"
              value={newInterest.name}
              onChange={(e) =>
                setNewInterest({ ...newInterest, name: e.target.value })
              }
              className="border p-1 mr-2"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newInterest.email}
              onChange={(e) =>
                setNewInterest({ ...newInterest, email: e.target.value })
              }
              className="border p-1 mr-2"
              required
            />
            <button
              type="submit"
              className="bg-[#ff6600] text-white px-4 py-1 text-sm hover:bg-[#ff7720]"
            >
              Add Interest
            </button>
          </form>

          <ul className="list-none">
            {interests.map((interest) => (
              <li
                key={interest.id}
                className="flex items-center mb-2 hover:bg-[#f0f0f0] p-1"
              >
                <span className="flex-grow">
                  {interest.name} ({interest.email})
                </span>
                <button
                  onClick={() => removeInterest(interest.id)}
                  className="text-[#828282] hover:text-black ml-2"
                >
                  [remove]
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Questions Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Questions</h2>

          <form onSubmit={addQuestion} className="mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={newQuestion.interest_id}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    interest_id: Number(e.target.value),
                  })
                }
                className="border p-1"
                required
              >
                <option value={0}>Select an interest</option>
                {interests.map((interest) => (
                  <option key={interest.id} value={interest.id}>
                    {interest.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Question"
                value={newQuestion.question}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, question: e.target.value })
                }
                className="border p-1 flex-grow"
                required
              />
              <select
                value={newQuestion.frequency}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, frequency: e.target.value })
                }
                className="border p-1"
                required
              >
                <option value="">Select frequency</option>
                {FREQUENCY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-[#ff6600] text-white px-4 py-1 text-sm hover:bg-[#ff7720]"
              >
                Add Question
              </button>
            </div>
          </form>

          <ul className="list-none">
            {questions.map((question) => (
              <li
                key={question.id}
                className="flex items-center mb-2 hover:bg-[#f0f0f0] p-1"
              >
                <span className="flex-grow">
                  <span className="text-[#828282]">
                    {interests.find((i) => i.id === question.interest_id)?.name}
                    :
                  </span>{" "}
                  {question.question}
                  <span className="text-[#828282] ml-2">
                    (
                    {
                      FREQUENCY_OPTIONS.find(
                        (f) => f.value === question.frequency
                      )?.label
                    }
                    )
                  </span>
                </span>
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="text-[#828282] hover:text-black ml-2"
                >
                  [remove]
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#f6f6ef] border-t border-[#ff6600] py-2">
        <div className="max-w-3xl mx-auto px-4 text-center text-[#828282] text-sm">
          Powered by{" "}
          <a
            href="https://render.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff6600] hover:underline"
          >
            Render
          </a>{" "}
          and{" "}
          <a
            href="https://inngest.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff6600] hover:underline"
          >
            Inngest
          </a>
        </div>
      </footer>
    </div>
  );
}
