import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // console.log("Registration data:", formData);

    // Later, send formData to the backend here.
    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Inform server of JSON payload
        },
        body: JSON.stringify(formData), // Convert object to JSON string
      });

      // if (!response.ok) {
      // throw new Error('Network response failed.');
      // }

      const data = await response.json();

      if (response.status == 400) {
        setError(data.detail);
      } else {
        setMessage("Registration Completed");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      // console.log('')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-text">
      <section className="w-full max-w-md rounded-xl border border-secondary/40 bg-background p-7 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-primary">
          Create an account
        </h1>

        <p className="mt-2 text-center text-sm opacity-70">
          Register to start chatting on BinChat
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1 block font-medium">
              Full name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border border-secondary bg-transparent px-4 py-3 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block font-medium">
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              className="w-full rounded-lg border border-secondary bg-transparent px-4 py-3 outline-none focus:border-primary"
            />
          </div>

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
              placeholder="Choose a unique username"
              minLength="3"
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
              placeholder="At least 8 characters"
              minLength="8"
              required
              className="w-full rounded-lg border border-secondary bg-transparent px-4 py-3 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block font-medium">
              Confirm password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Enter the password again"
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
            Register
          </button>
        </form>

        <p className="mt-5 text-center text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Login
          </a>
        </p>
      </section>
    </main>
  );
}

export default Register;
