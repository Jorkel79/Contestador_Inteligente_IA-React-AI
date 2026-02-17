import { useState } from "react";

function App() {
  const [emailText, setEmailText] = useState("");
  const [reply, setReply] = useState("");

  const generateReply = async () => {
    const res = await fetch("http://localhost:4000/generate-reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailText: emailText,
      }),
    });

    const data = await res.json();
    setReply(data.reply);
  };

  return (
    <div style={{ padding: 50 }}>
      <h1>Smart Reply AI / Contestador Inteligente IA 📩</h1>

      <textarea
        rows="5"
        cols="50"
        placeholder="Pega aquí el correo..."
        onChange={(e) => setEmailText(e.target.value)}
      />

      <br /><br />

      <button onClick={generateReply}>
        Generar respuesta
      </button>

      <h2>Respuesta:</h2>
      <p>{reply}</p>
    </div>
  );
}

export default App;
