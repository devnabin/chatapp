import { useParams } from "react-router-dom";

function Dashboard() {
  const { username } = useParams();

  return (
    <main className="min-h-screen bg-background p-6 text-text">
      <h1 className="text-3xl font-bold text-primary">
        Welcome, {username}!
      </h1>

      <p className="mt-3">You are logged in to BinChat.</p>
    </main>
  );
}

export default Dashboard;