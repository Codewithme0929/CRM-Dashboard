import { Search, Bell } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { SearchContext } from "../context/SearchContext";
import { apiUrl } from "../config/api";

export default function Header({ title }) {
  const { user } = useContext(AuthContext);
  const userName = user?.name || "User";

  const { search, setSearch } = useContext(SearchContext);

  const location = useLocation();
  const containerRef = useRef(null);

  const [results, setResults] = useState({
    clients: [],
    tasks: [],
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Don't search if textbox is empty
    if (!search.trim()) {
      setResults({
        clients: [],
        tasks: [],
      });

      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    // Debounce (wait 300ms)
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await axios.get(apiUrl('/api/search'), {
          params: { q: search },
          headers: user?.token
            ? {
                Authorization: `Bearer ${user.token}`,
              }
            : undefined,
        });

        setResults({
          clients: response.data?.clients ?? [],
          tasks: response.data?.tasks ?? [],
        });
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
        setResults({ clients: [], tasks: [] });
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, user?.token]);

  useEffect(() => {
    // Close dropdown when route changes (navigating away)
    setShowDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    const onMouseDown = (e) => {
      const el = containerRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setShowDropdown(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (!user?.token) {
          setUnreadCount(0);
          return;
        }

        const response = await axios.get(apiUrl('/api/notifications'), {
          headers: { Authorization: `Bearer ${user.token}` },
          params: { page: 1, limit: 100 },
        });
        const list = Array.isArray(response.data?.notifications) ? response.data.notifications : [];
        setUnreadCount(list.filter((n) => !n.isRead).length);
      } catch (err) {
        // silent fail for header badge
        setUnreadCount(0);
      }
    };

    fetchUnread();
    const t = window.setInterval(fetchUnread, 15000);
    return () => window.clearInterval(t);
  }, [user?.token]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-white px-6">
      <h1 className="text-xl font-semibold text-slate-900">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <div ref={containerRef} className="relative w-full max-w-[420px]">

          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => {
              if (search.trim()) setShowDropdown(true);
            }}
            className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-slate-50 pl-10 pr-10 text-sm outline-none focus:border-[var(--color-primary)]"
          />

          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              ...
            </div>
          )}

          {showDropdown && (
            <div className="absolute left-0 mt-2 w-full rounded-lg border bg-white shadow-lg z-50 max-h-96 overflow-auto">

              <div className="p-3 font-semibold border-b">
                Clients
              </div>

              {results.clients.length === 0 ? (
                <div className="p-3 text-gray-500">
                  No Clients Found
                </div>
              ) : (
                results.clients.map((client) => (
                  <Link
                    key={client._id}
                    to={`/clients?focus=${client._id}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setShowDropdown(false);
                      setSearch("");
                    }}
                  >
                    {client.name}
                  </Link>
                ))
              )}

              <div className="p-3 font-semibold border-y">
                Tasks
              </div>

              {results.tasks.length === 0 ? (
                <div className="p-3 text-gray-500">
                  No Tasks Found
                </div>
              ) : (
                results.tasks.map((task) => (
                  <Link
                    key={task._id}
                    to={`/tasks?focus=${task._id}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setShowDropdown(false);
                      setSearch("");
                    }}
                  >
                    {task.name}
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <Link
          to="/notifications"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[11px] font-semibold leading-none text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3 border-l border-[var(--color-border)] pl-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">
              {userName}
            </p>

            <p className="text-xs text-slate-500">
              Admin
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-semibold">
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        </div>
      </div>
    </header>
  );
}