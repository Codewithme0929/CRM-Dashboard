export default function AuthLayout({ heading, subheading, children }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-[var(--color-sidebar)] p-12 text-white lg:flex">
        <div>
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-lg font-bold">T</div>
            <span className="text-2xl font-bold">TaskPro</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight">{heading}</h2>
          <p className="mt-4 max-w-md text-slate-400">{subheading}</p>
        </div>
        <div className="rounded-2xl bg-slate-800/50 p-8">
          <div className="mb-4 flex gap-4">
            <div className="h-24 w-24 rounded-xl bg-indigo-500/20" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-slate-600" />
              <div className="h-3 w-1/2 rounded bg-slate-600" />
              <div className="mt-4 h-16 rounded-lg bg-indigo-500/30" />
            </div>
          </div>
          <p className="text-sm text-slate-400">Client & Task Management Platform</p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center bg-white px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
