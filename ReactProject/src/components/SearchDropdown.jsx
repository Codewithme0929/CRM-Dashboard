{showDropdown && (
  <div className="absolute left-0 top-12 z-50 w-[450px] rounded-xl border border-slate-200 bg-white shadow-xl">

    {/* Clients Section */}
    <div className="border-b border-slate-200">

      <h3 className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Clients
      </h3>

      {results.clients.length > 0 ? (
        results.clients.map((client) => (
          <Link
            key={client._id}
          to={`/clients?id=${client._id}`}
            onClick={() => {
              setShowDropdown(false);
              setSearch("");
            }}
            className="block px-4 py-3 hover:bg-slate-100 transition"
          >
            <p className="font-medium text-slate-800">
              {client.name}
            </p>

            <p className="text-xs text-slate-500">
              {client.email}
            </p>
          </Link>
        ))
      ) : (
        <p className="px-4 py-3 text-sm text-slate-400">
          No Clients Found
        </p>
      )}

    </div>

    {/* Tasks Section */}
    <div>

      <h3 className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Tasks
      </h3>

      {results.tasks.length > 0 ? (
        results.tasks.map((task) => (
          <Link
            key={task._id}
              to={`/task?id=${task._id}`}
            onClick={() => {
              setShowDropdown(false);
              setSearch("");
            }}
            className="block px-4 py-3 hover:bg-slate-100 transition"
          >
            <p className="font-medium text-slate-800">
              {task.name}
            </p>

            <div className="mt-1 flex items-center gap-2">

              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  task.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : task.status === "Pending"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {task.status}
              </span>

              <span className="text-xs text-slate-500">
                {task.client?.name || "No Client"}
              </span>

            </div>

          </Link>
        ))
      ) : (
        <p className="px-4 py-3 text-sm text-slate-400">
          No Tasks Found
        </p>
      )}

    </div>

  </div>
)}