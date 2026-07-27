import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail)
      }

      if (response.ok ){
            setMessage(`Welcome: ${data.success.username}`)
            navigate(`/home/${encodeURIComponent(data.success.username)}`);
            // console.log(typeof(data.username))
      }

    //   console.log(data)
    //   console.log(response)
      if(response.detail){
        setError("Cannot connect to the server.");
      }

      // Later, redirect the user to the chat page:
      // window.location.href = "/chat";
    } catch (error) {
      setMessage("Cannot connect to the server.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-text">
      <section className="w-full max-w-md rounded-xl border border-secondary/40 p-7 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-primary">
          Login to BinChat
        </h1>

        <p className="mt-2 text-center text-sm opacity-70">
          Welcome back! Enter your account details.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block font-medium">
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-secondary bg-transparent px-4 py-3 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block font-medium">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-secondary bg-transparent px-4 py-3 outline-none focus:border-primary"
            />
          </div>

      
          {error && (
            <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700">
              {message}
            </p>
          )}


          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-opacity hover:opacity-85"
          >
            Login
          </button>
        </form>

        <p className="mt-5 text-center text-sm">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Register
          </a>
        </p>
      </section>
    </main>
  );
}

export default Login;