import Darkmode from "./Utilities/Darkmode";

function Home() {
  return (
    <main className="min-h-screen bg-background text-text transition-colors duration-300">
      <nav className="flex items-center justify-between border-b border-secondary/40 px-6 py-4">
        <h1 className="text-2xl font-bold text-primary">BinChat</h1>

        <div className="flex items-center gap-5">
          <a
            href="/login"
            className="font-medium transition-colors hover:text-primary"
          >
            Login
          </a>

          <a
            href="/register"
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-opacity hover:opacity-85"
          >
            Register
          </a>

      <Darkmode />
      
        </div>
      </nav>

      <section className="flex min-h-[80vh] items-center justify-center px-6 text-center">
        <div>
          <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
            Welcome to <span className="text-primary">BinChat</span>
          </h2>

          <p className="text-lg text-text/70">
            An easy chatting app for international roommates.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Home;