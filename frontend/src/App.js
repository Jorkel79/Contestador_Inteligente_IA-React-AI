import { useState } from "react";

function App() {

  const [email, setEmail] = useState(null);
  const [emailText, setEmailText] = useState("");
  const [reply, setReply] = useState("");

 const getLatestEmail = async () => {
  try {
    const res = await fetch("http://localhost:4000/emails");

    if (!res.ok) {
      alert("Error en el backend 😬");
      return;
    }

    const data = await res.json();

    if (data.length > 0) {
      setEmail({
  body: data[0].body,
  from: data[0].from,
  subject: data[0].subject
});

setEmailText(data[0].body);
    } else {
      alert("No hay correos");
    }

  } catch (error) {
    console.error(error);
    alert("No se pudo conectar al backend");
  }
};

const generateReply = async () => {
  if (!emailText) {
    alert("Primero trae un correo 📬");
    return;
  }

  try {
    const res = await fetch("http://localhost:4000/generate-reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emailText: emailText,
        from: email.from
      })
    });

    if (!res.ok) {
      alert("Error generando respuesta 😬");
      return;
    }

    const data = await res.json();
    setReply(data.reply);

  } catch (error) {
    console.error(error);
    alert("No se pudo conectar al backend");
  }
};


  return (
    <div style={{ padding: "40px" }}>
      <h1>Smart Reply AI / Contestador Inteligente IA 🤖</h1>

      <button onClick={getLatestEmail}>
        Traer último correo 📬
      </button>


      <br />
      
    <button onClick={() => setEmailText("")}>
        Limpiar
      </button>

      <br />

      <p>Pega un correo o trae el último:</p>


     <textarea
  rows="6"
  cols="60"
  value={emailText}
  onChange={(e) => setEmailText(e.target.value)}
/>

      <br /><br />

      <button onClick={generateReply}>
        Generar respuesta ✨
      </button>

      <h3>Respuesta:</h3>
      <p>{reply}</p>
    </div>
  );
}

export default App;
